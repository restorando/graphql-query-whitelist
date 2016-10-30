import supertest from 'supertest'
import chai from 'chai'
import spies from 'chai-spies'

import app from './app'
import queryWhitelisting from '../lib'
import { MemoryStore } from '../lib/store'
import { QueryRepository } from '../lib/utils'

chai.use(spies)

const { expect } = chai

describe('Query whitelisting middleware', () => {
  const validQuery = 'query ValidQuery { firstName }'
  const validQueryId = 'Hwf+pzIq09drbuQSzDSAXEwuk9HfwrGKw7yFzd1buNM='
  const invalidQuery = 'query InvalidQuery { lastName }'
  const unauthorizedError = '{"error":"Unauthorized query"}'

  let store, repository, request

  beforeEach(async () => {
    store = new MemoryStore()
    repository = new QueryRepository(store)
    await repository.put(validQuery)
    request = supertest(app({ store }))
  })

  describe('Query whitelisting', () => {
    it('allows a valid query', done => {
      request
        .post('/graphql')
        .send({ query: validQuery })
        .expect('{"data":{"firstName":"John"}}', done)
    })

    it('doesn\'t allow an invalid query', done => {
      request
        .post('/graphql')
        .send({ query: invalidQuery })
        .expect(401)
        .expect(unauthorizedError, done)
    })

    it('allows to send only the queryId using a body parameter', done => {
      request
        .post('/graphql')
        .send({ queryId: validQueryId })
        .expect('{"data":{"firstName":"John"}}', done)
    })

    it('allows to send only the queryId using a query parameter', done => {
      request
        .post('/graphql')
        .query({ queryId: validQueryId })
        .expect('{"data":{"firstName":"John"}}', done)
    })
  })

  describe('Query normalization', () => {
    [validQuery, 'query ValidQuery \n{\n\nfirstName\n\n          }'].forEach((query) => {
      it(`adds the QueryId and the normalizedQuery attributes to the req object`, async () => {
        const req = { body: { query }, query: {} }
        const res = {}
        const next = () => {}

        const normalizedQuery = 'query ValidQuery {\n  firstName\n}\n'

        await queryWhitelisting({ store })(req, res, next)

        expect(req.queryId).to.equal(validQueryId)
        expect(req.body.query).to.equal(normalizedQuery)
        expect(req.normalizedQuery).to.equal(normalizedQuery)
      })
    })
  })

  describe('Skip validation function', () => {
    it('doesn\'t skip the middleware if the skip function is not provided', done => {
      const request = supertest(app({ store }))

      request
        .post('/graphql')
        .send({ query: invalidQuery })
        .expect(401)
        .expect(unauthorizedError, done)
    })

    it('skips the middleware if the skip function returns a truthy value', done => {
      const request = supertest(app({ store, skipValidationFn: () => true }))

      request
        .post('/graphql')
        .send({ query: invalidQuery })
        .expect('{"data":{"lastName":"Cook"}}', done)
    })

    it('doesn\'t skip the middleware if the skip function returns a falsey value', done => {
      const request = supertest(app({ store, skipValidationFn: () => false }))

      request
        .post('/graphql')
        .send({ query: invalidQuery })
        .expect(401)
        .expect(unauthorizedError, done)
    })
  })

  describe('Validation error function', () => {
    it('calls the validation error function if the query is invalid', done => {
      const spy = chai.spy()
      const request = supertest(app({ store, validationErrorFn: spy }))

      request
        .post('/graphql')
        .send({ query: invalidQuery })
        .expect(401, () => {
          expect(spy).to.have.been.called()
          done()
        })
    })

    it('doesn\'t call the validation error function if the query is valid', done => {
      const spy = chai.spy()
      const request = supertest(app({ store, validationErrorFn: spy }))

      request
        .post('/graphql')
        .send({ query: validQuery })
        .expect(401, () => {
          expect(spy).to.not.have.been.called()
          done()
        })
    })
  })
})

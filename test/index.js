import supertest from 'supertest'
import chai from 'chai'
import spies from 'chai-spies'

import app from './app'
import queryWhitelisting from '../lib'

chai.use(spies)

const { expect } = chai

describe('Query whitelisting middleware', () => {
  const validQuery = '{ firstName }'
  const validQueryHash = 'FJJ3cIcLjvOBIyw6Q7jQpl1IIDPIeNPnakYVHM35orY='
  const invalidQuery = '{ lastName }'

  const validateFn = (queryHash) => new Promise((resolve) => resolve(queryHash === validQueryHash))

  describe('Query whitelisting', () => {
    const request = supertest(app({ validateFn }))

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
        .expect('Unauthorized query', done)
    })
  })

  describe('Query normalization', () => {
    [validQuery, '\n{\n\nfirstName\n\n          }'].forEach((query) => {
      it(`adds the queryHash and the normalizedQuery attributes to the req object`, async () => {
        const req = { body: { query } }
        const res = {}
        const next = () => {}

        const normalizedQuery = '{\n  firstName\n}\n'

        await queryWhitelisting({ validateFn })(req, res, next)

        expect(req.queryHash).to.equal(validQueryHash)
        expect(req.normalizedQuery).to.equal(normalizedQuery)
      })
    })
  })

  describe('Skip validation function', () => {
    it('doesn\'t skip the middleware if the skip function is not provided', done => {
      const request = supertest(app({ validateFn }))

      request
        .post('/graphql')
        .send({ query: invalidQuery })
        .expect(401)
        .expect('Unauthorized query', done)
    })

    it('skips the middleware if the skip function returns a truthy value', done => {
      const request = supertest(app({ validateFn, skipValidationFn: () => true }))

      request
        .post('/graphql')
        .send({ query: invalidQuery })
        .expect('{"data":{"lastName":"Cook"}}', done)
    })

    it('doesn\'t skip the middleware if the skip function returns a falsey value', done => {
      const request = supertest(app({ validateFn, skipValidationFn: () => false }))

      request
        .post('/graphql')
        .send({ query: invalidQuery })
        .expect(401)
        .expect('Unauthorized query', done)
    })
  })

  describe('Validation error function', () => {
    it('calls the validation error function if the query is invalid', done => {
      const spy = chai.spy()
      const request = supertest(app({ validateFn, validationErrorFn: spy }))

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
      const request = supertest(app({ validateFn, validationErrorFn: spy }))

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

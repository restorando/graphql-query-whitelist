import supertest from 'supertest'
import { expect } from 'chai'
import app from './app'
import queryWhitelisting from '../lib'

describe('Query whitelisting middleware', () => {
  const validQuery = '{ firstName }'
  const validQueryHash = 'FJJ3cIcLjvOBIyw6Q7jQpl1IIDPIeNPnakYVHM35orY='
  const invalidQuery = '{ lastName }'

  const validateFn = (queryHash) => new Promise((resolve) => resolve(queryHash === validQueryHash))

  describe('Query whitelisting', () => {
    const request = supertest(app({ validateFn }));

    it('allows a valid query', done => {
      request
        .post('/graphql')
        .send({ query: validQuery })
        .expect('{"data":{"firstName":"John"}}', done);
    })

    it('doesn\'t allow an invalid query', done => {
      request
        .post('/graphql')
        .send({ query: invalidQuery })
        .expect(401)
        .expect('Unauthorized query', done);
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

  describe('Bypass function', () => {
    it('doesn\'t bypass the middleware if the bypass function is not provided', done => {
      const request = supertest(app({ validateFn }));

      request
        .post('/graphql')
        .send({ query: invalidQuery })
        .expect(401)
        .expect('Unauthorized query', done);
    })

    it('bypasses the middleware if the bypass function returns a truthy value', done => {
      const request = supertest(app({ validateFn, bypassFn: () => true }));

      request
        .post('/graphql')
        .send({ query: invalidQuery })
        .expect('{"data":{"lastName":"Cook"}}', done);
    })

    it('doesn\'t bypass the middleware if the bypass function returns a falsey value', done => {
      const request = supertest(app({ validateFn, bypassFn: () => false }));

      request
        .post('/graphql')
        .send({ query: invalidQuery })
        .expect(401)
        .expect('Unauthorized query', done);
    })
  })
})

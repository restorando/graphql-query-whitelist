import supertest from 'supertest'
import { expect } from 'chai'
import app from './app'
import { MemoryStore } from '../lib/store'
import { QueryRepository } from '../lib/utils'

describe('Api', () => {
  const existingQuery = 'query ExistingQuery { firstName }'
  const existingQueryId = '2d3bPA6TQe76B05EIgS8Vs7xHMjmW2m7g/INufnCWbA='
  const newQuery = 'query ValidQuery { firstName }'
  const newQueryId = 'Hwf+pzIq09drbuQSzDSAXEwuk9HfwrGKw7yFzd1buNM='
  const fullQuery = {
    id: existingQueryId,
    query: 'query ExistingQuery {\n  firstName\n}\n',
    operationName: 'ExistingQuery',
    enabled: true
  }

  let request
  const store = new MemoryStore()

  beforeEach(async () => {
    await store.clear()
    const repository = new QueryRepository(store)
    await repository.put(existingQuery)

    request = supertest(app({ store }))
  })

  describe('GET /queries', () => {
    it('lists the queries', done => {
      request
        .get(`/api/queries`)
        .expect([fullQuery], done)
    })
  })

  describe('GET /queries/:id', () => {
    it('gets an existing query', done => {
      request
        .get(`/api/queries/${existingQueryId}`)
        .expect(fullQuery, done)
    })

    it('returns a 404 if the query does no exist', done => {
      request
        .get(`/api/queries/invalidQuery`)
        .expect(404, { error: 'Query not found' }, done)
    })
  })

  describe('POST /queries', () => {
    it('creates a new query', done => {
      request
        .post('/api/queries')
        .send({ query: newQuery })
        .expect(201, {
          id: newQueryId,
          query: 'query ValidQuery {\n  firstName\n}\n',
          operationName: 'ValidQuery',
          enabled: true
        }, done)
    })
  })

  describe('PUT /queries/:id', () => {
    it('updates an existing query', done => {
      request
        .put(`/api/queries/${existingQueryId}`)
        .send({ enabled: false })
        .expect({ ...fullQuery, enabled: false }, done)
    })

    it('returns a 404 if the query that needs to be updated does not exist', done => {
      request
        .put(`/api/queries/invalidQuery`)
        .expect(404, { error: 'Query not found' }, done)
    })
  })

  describe('DELETE /queries/:id', () => {
    it('deletes an existing query', done => {
      store.get(existingQueryId).then((query) => {
        expect(query).not.to.be.undefined

        request
          .delete(`/api/queries/${existingQueryId}`)
          .end(async (err, res) => {
            if (err) return done(err)
            expect(await store.get(existingQueryId)).to.be.undefined
            done()
          })
      })
    })

    it('returns a 404 if the query does not exist', done => {
      request
        .delete(`/api/queries/invalidQuery`)
        .expect(404, done)
    })
  })
})

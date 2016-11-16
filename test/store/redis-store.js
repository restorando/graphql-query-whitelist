import { expect } from 'chai'
import { RedisStore } from '../../lib/store'

describe('RedisStore', () => {
  const query = 'query TestQuery { firstName }'
  const queryHash = 'FoZSVHVMq0lErDt43A50mbb4MsYSM55MrEUTr53Xvv0='

  let store = null

  beforeEach(async () => {
    store = new RedisStore({ keyPrefix: 'graphql-query-whitelist-test:' })
    await store.clear()
  })

  it('puts a query into the store', async () => {
    expect(await store.redisClient.hexists('queries', queryHash)).to.equal(0)

    await store.set(queryHash, query)

    expect(await store.redisClient.hexists('queries', queryHash)).to.equal(1)
  })

  it('gets a query from the store', async () => {
    expect(await store.get(queryHash)).to.be.undefined

    await store.set(queryHash, query)

    expect(await store.get(queryHash)).to.equal(query)
  })

  it('gets all the entries', async () => {
    await Promise.all([store.set('foo', 'bar'), store.set('foo2', 'bar2')])
    expect(await store.entries()).to.deep.include.members([['foo', 'bar'], ['foo2', 'bar2']])
  })

  it('deletes an entry', async () => {
    await store.set(queryHash, query)

    expect(await store.get(queryHash)).to.equal(query)

    await store.delete(queryHash)

    expect(await store.get(queryHash)).to.be.undefined
  })
})

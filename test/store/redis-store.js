import { expect } from 'chai'
import { RedisStore } from '../../lib/store'

describe('RedisStore', () => {
  const query = 'query TestQuery { firstName }'
  const queryHash = 'FoZSVHVMq0lErDt43A50mbb4MsYSM55MrEUTr53Xvv0='

  let store = null

  beforeEach(() => {
    store = new RedisStore({ keyPrefix: 'graphql-query-whitelisting-test:' })
    store.clear()
  })

  it('puts a query into the store', async () => {
    expect(await store.redisClient.exists(queryHash)).to.equal(0)

    await store.put(queryHash, query)

    expect(await store.redisClient.exists(queryHash)).to.equal(1)
  })

  it('gets a query from the store', async () => {
    expect(await store.get(queryHash)).to.be.null

    await store.put(queryHash, query)

    expect(await store.get(queryHash)).to.equal(query)
  })
})

import { expect } from 'chai'
import { MemoryStore } from '../../lib/store'

describe('MemoryStore', () => {
  const query = 'query TestQuery { firstName }'
  const queryHash = 'FoZSVHVMq0lErDt43A50mbb4MsYSM55MrEUTr53Xvv0='

  let store = null

  beforeEach(() => { store = new MemoryStore() })

  it('puts a query into the store', async () => {
    expect(store.queries.has(queryHash)).to.be.false

    await store.put(queryHash, query)

    expect(store.queries.has(queryHash)).to.be.true
  })

  it('gets a query from the store', async () => {
    store.put(queryHash, query)

    expect(await store.get(queryHash)).to.equal(query)
  })
})

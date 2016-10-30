import { expect } from 'chai'
import QueryRepository from '../../lib/utils/query-repository'
import MemoryStore from '../../lib/store/memory-store'

describe('QueryRepository', () => {
  const query = 'query TestQuery { firstName }'
  const queryHash = 'FoZSVHVMq0lErDt43A50mbb4MsYSM55MrEUTr53Xvv0='

  const expectedQuery = {
    enabled: true,
    operationName: 'TestQuery',
    query: 'query TestQuery {\n  firstName\n}\n'
  }

  const store = new MemoryStore()
  const repo = new QueryRepository(store)

  beforeEach(() => store.clear())

  it('puts a query into the store', async () => {
    expect(store.queries.has(queryHash)).to.be.false

    await repo.put(query)

    expect(store.queries.has(queryHash)).to.be.true
    expect(JSON.parse(store.queries.get(queryHash))).to.deep.equal(expectedQuery)
  })

  it('gets a query from the store', async () => {
    await repo.put(query)

    expect(await repo.get(queryHash)).to.deep.equal(expectedQuery)
  })

  it('updates a query from the store', async () => {
    await repo.put(query)

    expect(await repo.get(queryHash)).to.deep.equal(expectedQuery)

    await repo.update(queryHash, { enabled: false, operationName: 'UpdatedQuery' })

    expect(await repo.get(queryHash)).to.deep.equal({
      ...expectedQuery,
      operationName: 'UpdatedQuery',
      enabled: false
    })
  })

  it('gets all entries', async () => {
    const anotherQuery = 'query AnotherQuery { lastName }'
    const anotherExpectedQuery = {
      enabled: true,
      id: 'uaqhFBxe3pkrjGmEzbiZrAgaHD0G1ojQJJmGdPHgwS0=',
      operationName: 'AnotherQuery',
      query: 'query AnotherQuery {\n  lastName\n}\n'
    }

    await Promise.all([repo.put(query), repo.put(anotherQuery)])
    const entries = await repo.entries()

    expect(entries).to.deep.include.members([{ ...expectedQuery, id: queryHash }, anotherExpectedQuery])
  })
})

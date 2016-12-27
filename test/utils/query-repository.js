import { expect } from 'chai'
import QueryRepository from '../../lib/utils/query-repository'
import MemoryStore from '../../lib/store/memory-store'

describe('QueryRepository', () => {
  const query = 'query TestQuery { firstName }'
  const queryId = 'FoZSVHVMq0lErDt43A50mbb4MsYSM55MrEUTr53Xvv0='

  const expectedQuery = {
    enabled: true,
    operationName: 'TestQuery',
    query: 'query TestQuery {\n  firstName\n}\n'
  }
  const expectedFullQuery = { ...expectedQuery, id: queryId }
  const store = new MemoryStore()
  const repo = new QueryRepository(store)

  beforeEach(() => store.clear())

  it('puts a query into the store', async () => {
    expect(store.queries.has(queryId)).to.be.false

    await repo.put(query)

    expect(store.queries.has(queryId)).to.be.true
    expect(store.queries.get(queryId)).to.deep.equal(expectedQuery)
  })

  it('overrides the operation name', async () => {
    expect(store.queries.has(queryId)).to.be.false

    await repo.put(query, { operationName: 'foo' })

    expect(store.queries.get(queryId)).to.deep.equal({
      enabled: true,
      operationName: 'foo',
      query: 'query TestQuery {\n  firstName\n}\n'
    })
  })

  it('gets a query from the store', async () => {
    await repo.put(query)

    expect(await repo.get(queryId)).to.deep.equal(expectedFullQuery)
  })

  it('updates a query from the store', async () => {
    await repo.put(query)

    expect(await repo.get(queryId)).to.deep.equal(expectedFullQuery)

    await repo.update(queryId, { enabled: false, operationName: 'UpdatedQuery' })

    expect(await repo.get(queryId)).to.deep.equal({
      ...expectedFullQuery,
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

    expect(entries).to.deep.include.members([{ ...expectedFullQuery }, anotherExpectedQuery])
  })
})

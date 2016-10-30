import parseQuery from './parse-query'

class QueryRepository {
  constructor(store) {
    this.store = store
  }

  async get(queryId) {
    const entry = await this.store.get(queryId)
    if (!entry) return

    return JSON.parse(entry)
  }

  async put(query) {
    const { queryId, operationName, normalizedQuery } = parseQuery(query)
    const queryObj = { query: normalizedQuery, operationName, enabled: true }
    await this.store.put(queryId, JSON.stringify(queryObj))

    return { id: queryId, ...queryObj }
  }

  async update(queryId, properties = {}) {
    let query = await this.get(queryId)

    // don't allow to update the query
    delete properties.query

    query = { ...query, ...properties }
    await this.store.put(queryId, JSON.stringify(query))

    return { id: queryId, ...query }
  }

  async entries() {
    const entries = await this.store.entries()

    return entries.map(([queryId, properties]) => ({ ...JSON.parse(properties), id: queryId })).reverse()
  }
}

export default QueryRepository

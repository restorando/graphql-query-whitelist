import parseQuery from './parse-query'

export class QueryNotFoundError {
  constructor(message) {
    this.name = 'QueryNotFound'
    this.message = message || 'Query not found'
    this.stack = (new Error()).stack
  }
}

QueryNotFoundError.prototype = Object.create(Error.prototype)

class QueryRepository {
  constructor(store) {
    this.store = store
  }

  async get(queryId) {
    const entry = await this.store.get(queryId)
    if (!entry) throw new QueryNotFoundError()

    return { id: queryId, ...entry }
  }

  async put(query, options = {}) {
    let { queryId, operationName, normalizedQuery } = parseQuery(query, { requireOperationName: false })
    operationName = options.operationName || operationName || 'Unnamed query'
    const queryObj = { query: normalizedQuery, operationName, enabled: true }
    await this.store.set(queryId, queryObj)

    return { id: queryId, ...queryObj }
  }

  async update(queryId, properties = {}) {
    let query = await this.get(queryId)

    // don't allow to update the query
    delete properties.query

    query = { ...query, ...properties }
    await this.store.set(queryId, query)

    return { id: queryId, ...query }
  }

  async entries() {
    const entries = await this.store.entries()
    return entries.map(([queryId, properties]) => ({ ...properties, id: queryId })).reverse()
  }

  async delete(queryId) {
    // check if the query exists. raise an error if not
    await this.get(queryId)
    return this.store.delete(queryId)
  }
}

export default QueryRepository

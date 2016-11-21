import { parseQuery, QueryRepository, QueryNotFoundError } from './utils'

const noop = () => { }

export default ({ store, skipValidationFn = noop, validationErrorFn = noop }) => {
  const repository = new QueryRepository(store)

  return async (req, res, next) => {
    const unauthorized = (errorCode) => {
      validationErrorFn(req, { errorCode })
      res.status(401).json({ error: 'Unauthorized query' })
    }

    if (skipValidationFn(req)) return next()

    const queryId = req.body.queryId || req.query.queryId
    let queryObj = {}

    if (queryId) {
      queryObj = { queryId }
    } else if (req.body.query) {
      queryObj = parseQuery(req.body.query)
    } else {
      // No queryId or query was specified. Let express-graphql handle this
      next()
    }

    try {
      const { query, enabled } = await repository.get(queryObj.queryId)

      req.queryId = queryObj.queryId
      req.body.query = req.normalizedQuery = query

      enabled ? next() : unauthorized('QUERY_DISABLED')
    } catch (error) {
      if (error instanceof QueryNotFoundError) {
        unauthorized('QUERY_NOT_FOUND')
      } else {
        throw error
      }
    }
  }
}

export Api from './api'
export { MemoryStore, RedisStore } from './store'
export { QueryRepository }

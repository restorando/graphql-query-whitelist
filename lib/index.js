import { parseQuery, QueryRepository, QueryNotFoundError, storeIntrospectionQueries as storeQueries } from './utils'
import { formatError } from 'graphql'

const noop = () => { }

export default ({ store, skipValidationFn = noop, validationErrorFn = noop, storeIntrospectionQueries = false }) => {
  const repository = new QueryRepository(store)
  const storeIQPromise = storeIntrospectionQueries ? storeQueries(repository) : Promise.resolve()

  return async (req, res, next) => {
    const unauthorized = (errorCode, error = { message: 'Unauthorized query' }, statusCode = 401) => {
      validationErrorFn(req, { errorCode })
      res.status(statusCode).json({ errors: [formatError(error)] })
    }

    if (skipValidationFn(req)) return next()

    try {
      const queryId = req.body.queryId || req.query.queryId
      let queryObj = {}

      await storeIQPromise

      if (queryId) {
        queryObj = { queryId }
      } else if (req.body.query) {
        queryObj = parseQuery(req.body.query, { requireOperationName: false })
      } else {
        // No queryId or query was specified. Let express-graphql handle this
        next()
      }

      const { query, enabled } = await repository.get(queryObj.queryId)

      req.queryId = queryObj.queryId
      req.body.query = req.normalizedQuery = query

      enabled ? next() : unauthorized('QUERY_DISABLED')
    } catch (error) {
      if (error instanceof QueryNotFoundError) {
        unauthorized('QUERY_NOT_FOUND')
      } else {
        unauthorized('GRAPHQL_ERROR', error, 400)
      }
    }
  }
}

export Api from './api'
export { MemoryStore, RedisStore } from './store'
export { QueryRepository }

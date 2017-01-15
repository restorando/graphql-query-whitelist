import { parseQuery, QueryRepository, QueryNotFoundError, storeIntrospectionQueries as storeQueries } from './utils'
import { formatError } from 'graphql'

const noop = () => { }

export default ({ store, skipValidationFn = noop, validationErrorFn = noop,
  storeIntrospectionQueries = false, dryRun = false }) => {
  const repository = new QueryRepository(store)
  const storeIQPromise = storeIntrospectionQueries ? storeQueries(repository) : Promise.resolve()

  if (dryRun) {
    console.info('[graphql-query-whitelist] - running in dry run mode')
  }

  return async (req, res, next) => {
    const body = req.body

    if (typeof body !== 'object') {
      return next(new Error('body-parser middleware (https://github.com/expressjs/body-parser) must be ' +
        'inserted before graphql-query-whitelist middleware'))
    }

    // Needed to render GraphiQL if using express-graphql
    if (req.method === 'GET' && !req.query.queryId && !req.query.query) return next()

    const unauthorized = (errorCode, error = { message: 'Unauthorized query' }, statusCode = 401) => {
      validationErrorFn(req, { errorCode })

      if (dryRun) {
        next()
      } else {
        res.status(statusCode).json({ errors: [formatError(error)] })
      }
    }

    if (skipValidationFn(req)) return next()

    try {
      const queryId = body.queryId || req.query.queryId
      let queryObj = {}

      await storeIQPromise

      if (queryId) {
        queryObj = { queryId }
      } else if (body.query) {
        queryObj = parseQuery(req.body.query, { requireOperationName: false })
      } else {
        // No queryId or query was specified. Let express-graphql handle this
        next()
      }

      req.queryId = queryObj.queryId
      req.operationName = queryObj.operationName

      const { query, enabled } = await repository.get(queryObj.queryId)
      body.query = query

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

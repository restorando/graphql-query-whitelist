import { parseQuery, QueryRepository } from './utils'

const noop = () => { }

export default ({ store, skipValidationFn = noop, validationErrorFn = noop }) => {
  const repository = new QueryRepository(store)

  return async (req, res, next) => {
    if (skipValidationFn(req)) return next()

    const unauthorized = (error = 'Unauthorized query') => {
      validationErrorFn(req)
      res.status(401).json({ error })
    }

    try {
      let queryObj = {}
      const queryId = req.body.queryId || req.query.queryId

      if (queryId) {
        queryObj = { queryId }
      } else if (req.body.query) {
        queryObj = parseQuery(req.body.query)
      }

      const { query, enabled } = (await repository.get(queryObj.queryId)) || {}

      req.queryId = queryObj.queryId
      req.body.query = req.normalizedQuery = query

      query && enabled ? next() : unauthorized()
    } catch (e) {
      unauthorized(e.message)
    }
  }
}

export Api from './api'

export MemoryStore from './store/memory-store'

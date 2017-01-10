import express from 'express'
import QueryRepository, { QueryNotFoundError } from '../utils/query-repository'

const handleError = (error, res) => {
  const statusCode = error instanceof QueryNotFoundError ? 404 : 422
  res.status(statusCode).json({ error: error.message })
}

export default (store) => {
  const router = express.Router()
  const repository = new QueryRepository(store)

  router.get('/queries', async (req, res) => {
    const queries = await repository.entries()
    res.json(queries)
  })

  router.get('/queries/:id(*)', async (req, res) => {
    try {
      const query = await repository.get(req.params.id)
      res.json(query)
    } catch (e) {
      handleError(e, res)
    }
  })

  router.post('/queries', async (req, res) => {
    try {
      const result = await repository.put(req.body.query)
      res.status(201).json(result)
    } catch (e) {
      res.status(422).json({ error: e.message })
    }
  })

  router.put('/queries/:id(*)', async (req, res) => {
    const { enabled, operationName } = req.body
    const newProperties = { enabled, operationName }

    // Manually check each updatable property since they are only 2
    if (typeof enabled !== 'boolean') delete newProperties.enabled
    if (!operationName) delete newProperties.operationName

    try {
      const query = await repository.update(req.params.id, newProperties)
      res.json(query)
    } catch (e) {
      handleError(e, res)
    }
  })

  router.delete('/queries/:id(*)', async (req, res) => {
    try {
      await repository.delete(req.params.id)
      res.status(200).end()
    } catch (e) {
      handleError(e, res)
    }
  })

  return router
}

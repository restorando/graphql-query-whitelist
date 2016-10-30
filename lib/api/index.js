import express from 'express'
import QueryRepository from '../utils/query-repository'

export default (store) => {
  const router = express.Router()
  const repository = new QueryRepository(store)

  router.get('/queries', async (req, res) => {
    const queries = await repository.entries()
    res.json(queries)
  })

  router.post('/queries', async (req, res) => {
    try {
      const result = await repository.put(req.body.query)
      res.json(result)
    } catch (e) {
      res.status(422).json({ error: e.message })
    }
  })

  router.put('/queries/:id(*)', async (req, res) => {
    const newStatus = req.body.status
    const queryId = req.params.id

    if (!/^(enabled|disabled)$/.test(newStatus)) {
      return res.status(422).json({ error: 'Invalid status' })
    }

    try {
      const query = await repository.update(queryId, { enabled: newStatus === 'enabled' })
      res.json(query)
    } catch (e) {
      res.status(422).json({ error: e.message })
    }
  })

  return router
}

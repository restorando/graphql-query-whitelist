import { print } from 'graphql/language/printer'
import { parse } from 'graphql/language/parser'
import crypto from 'crypto'

const noop = () => { }

export default ({ validateFn, skipValidationFn = noop, validationErrorFn = noop }) =>
  async (req, res, next) => {
    if (skipValidationFn(req)) return next()

    req.normalizedQuery = print(parse(req.body.query))
    req.queryHash = crypto.createHash('sha256').update(req.normalizedQuery).digest('base64')

    if (await validateFn(req.queryHash)) {
      next()
    } else {
      validationErrorFn(req)
      res.status(401).send('Unauthorized query')
    }
  }

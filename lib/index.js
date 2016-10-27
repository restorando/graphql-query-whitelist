import { print } from 'graphql/language/printer'
import { parse } from 'graphql/language/parser'
import crypto from 'crypto'

export default ({ validateFn }) => async (req, res, next) => {
  // if (!config.queryWhitelist.enabled) {
  //   return next()
  // }

  req.normalizedQuery = print(parse(req.body.query))
  req.queryHash = crypto.createHash('sha256').update(req.normalizedQuery).digest('base64')

  let validQuery = await validateFn(req.queryHash)

  if (validQuery) {
    next()
  } else {
    // warn(`Query '${req.queryHash}' is not in the whitelist`)
    // verbose(`Unauthorized query: ${req.normalizedQuery}`)
    res.status(401).send('Unauthorized query')
  }
}

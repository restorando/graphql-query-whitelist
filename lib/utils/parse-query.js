import { print } from 'graphql/language/printer'
import { parse } from 'graphql/language/parser'
import { getOperationAST } from 'graphql'
import crypto from 'crypto'

const hashQuery = (query) => crypto.createHash('sha256').update(query).digest('base64')

export default (query, options = { requireOperationName: true }) => {
  const queryAST = parse(query)
  const operationAST = getOperationAST(queryAST)
  const normalizedQuery = print(queryAST)

  if (options.requireOperationName && !operationAST.name) {
    throw new Error(`
      Invalid Query: 'Query must have an operation name'.
      e.g.
        query MyQueryName {
          firstName,
          lastName
        }
    `)
  }

  return {
    queryId: hashQuery(normalizedQuery),
    operationName: operationAST.name && operationAST.name.value,
    normalizedQuery
  }
}

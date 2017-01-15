import express from 'express'
import graphqlHTTP from 'express-graphql'
import bodyParser from 'body-parser'
import graphqlWhitelist, { Api } from '../../lib'

import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'

const QueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Test query',
  fields: () => ({
    firstName: {
      type: GraphQLString,
      resolve: () => 'John'
    },
    lastName: {
      type: GraphQLString,
      resolve: () => 'Cook'
    }
  })
})

const schema = new GraphQLSchema({
  query: QueryType
})

export default (options) => {
  const app = express()

  if (!options.noBodyParser) {
    app.use(bodyParser.json())
  }

  app.use('/graphql', graphqlWhitelist(options), (req, res) => graphqlHTTP({ schema, graphiql: true })(req, res))
  app.use('/api', Api(options.store))

  return app
}

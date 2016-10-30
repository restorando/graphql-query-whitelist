import express from 'express'
import graphqlHTTP from 'express-graphql'
import bodyParser from 'body-parser'
import schema from './schema'
import queryWhitelisting from '../../lib'

export default (options) => {
  const app = express()

  app.use(bodyParser.json())
  app.use('/graphql', queryWhitelisting(options), (req, res) => graphqlHTTP({ schema })(req, res))

  return app
}

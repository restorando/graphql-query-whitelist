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

export default new GraphQLSchema({
  query: QueryType
})

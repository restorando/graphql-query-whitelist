import { basename, join } from 'path'
import { introspectionQuery } from 'graphql'
import { version as graphqlVersion } from 'graphql/package.json'
import { storeQueriesFromDir } from './'

const getOperationNameFn = (file) => {
  const filename = basename(file, '.graphql')
  let [, app, version] = filename.match(/^(graphi?ql).*?([\d.]+)$/)
  app = app.replace(/[gql]/g, letter => letter.toUpperCase())

  return `${app} ${version} introspection query`
}

export default async function storeIntrospectionQueries(repository) {
  const operationName = getOperationNameFn(`graphql-introspection-query-${graphqlVersion}.graphql`)
  const introspectionQueriesPath = join(__dirname, 'queries')

  return Promise.all([
    repository.put(introspectionQuery, { operationName }),
    storeQueriesFromDir(repository, introspectionQueriesPath, { getOperationNameFn })
  ]).then(() => {
    console.log(`Storing bundled introspection query for version ${graphqlVersion}`)
    console.log('Introspection queries stored successfully')
  })
}

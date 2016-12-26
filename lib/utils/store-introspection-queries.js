import fs from 'fs'
import path from 'path'
import { introspectionQuery } from 'graphql'
import { version as graphqlVersion } from 'graphql/package.json'

const resolvePath = (filename = '') => path.join(__dirname, 'queries', filename)

const getQueryFiles = () => {
  return new Promise((resolve, reject) => {
    const directory = resolvePath()

    fs.readdir(directory, (err, files) => {
      if (err) return reject(err)
      resolve(files.filter(file => /\.graphql$/.test(file)).map(resolvePath))
    })
  })
}

const graphqlFilenameToString = (file) => {
  const filename = path.basename(file, '.graphql')
  let [, app, version] = filename.match(/^(graphi?ql).*?([\d.]+)$/)
  app = app.replace(/[gql]/g, letter => letter.toUpperCase())

  return `${app} ${version} introspection query`
}

export default async function storeIntrospectionQueries(repository) {
  const files = await getQueryFiles()
  const promises = []
  let operationName = graphqlFilenameToString(`graphql-introspection-query-${graphqlVersion}.graphql`)

  promises.push(repository.put(introspectionQuery, { operationName }))

  files.forEach(file => {
    fs.readFile(file, (err, data) => {
      if (err) return console.warn(err)

      operationName = graphqlFilenameToString(file)

      console.info(`Storing ${operationName}`)
      promises.push(repository.put(data.toString(), { operationName }))
    })
  })

  return Promise.all(promises)
}

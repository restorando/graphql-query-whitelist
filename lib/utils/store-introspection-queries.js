import fs from 'fs'
import path from 'path'
import { introspectionQuery } from 'graphql'

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

export default async function storeIntrospectionQueries(repository) {
  const files = await getQueryFiles()

  console.info('Storing introspection query => extracted from current graphql version')
  repository.put(introspectionQuery)

  files.forEach(file => {
    fs.readFile(file, (err, data) => {
      if (err) return console.warn(err)

      console.info(`Storing introspection query => ${path.basename(file, '.graphql')}`)
      repository.put(data.toString())
    })
  })
}

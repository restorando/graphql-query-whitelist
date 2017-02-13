import fs from 'fs'
import path from 'path'

const findQueries = dir => new Promise((resolve, reject) => {
  const resolvePath = (filename = '') => path.resolve(dir, filename)

  console.log(`Searching for queries in '${resolvePath()}'`)

  fs.readdir(dir, (err, files) => {
    if (err) return reject(err)
    resolve(files.filter(file => /\.graphql$/.test(file)).map(resolvePath))
  })
})

const readQueryFile = file => new Promise((resolve, reject) => {
  fs.readFile(file, (err, data) => {
    if (err) return reject(err)
    resolve(data.toString())
  })
})

const identityFn = input => input

export default async (repository, dir, options = {}) => {
  const queryFiles = await findQueries(dir)
  const operationNameFn = options.operationNameFn || identityFn

  return Promise.all(queryFiles.map(async file => {
    console.log(`Storing query from ${file}`)
    return repository.put(await readQueryFile(file), { operationName: operationNameFn(file) })
  }))
}

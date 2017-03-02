import fs from 'fs'
import path from 'path'

const findQueryFiles = dir => new Promise((resolve, reject) => {
  const resolvePath = (filename = '') => path.resolve(dir, filename)

  console.log(`Searching for queries in '${resolvePath()}'`)

  fs.readdir(dir, (err, files) => {
    if (err) return reject(err)
    resolve(files.filter(file => /\.graphql$/.test(file)).map(resolvePath))
  })
})

const readQueryFromFile = file => new Promise((resolve, reject) => {
  fs.readFile(file, (err, data) => {
    if (err) return reject(err)
    resolve(data.toString())
  })
})

export const getQueriesFromDir = async dir => {
  const files = await findQueryFiles(dir)
  return Promise.all(files.map(async filename => ({ query: await readQueryFromFile(filename), filename })))
}

const identityFn = input => input

export default async (repository, dir, options = {}) => {
  const queryFiles = await findQueryFiles(dir)
  const getOperationNameFn = options.getOperationNameFn || identityFn

  return Promise.all(queryFiles.map(async file => {
    console.log(`Storing query from ${file}`)
    return repository.put(await readQueryFromFile(file), { operationName: getOperationNameFn(file) })
  }))
}

#!/usr/bin/env node

/*
  Config.json example:

  {
    "redis": {
      "url": "redis://localhost:6379",
      "options": {
        "keyPrefix": "myKeyPrefix",
        ... (any ioredis option)
      }
    }
  }
*/

import optimist from 'optimist'
import { getQueriesFromDir } from './'
import axios from 'axios'

const { argv } = optimist
  .usage('Stores the queries residing in the specified directories.\nUsage: gql-whitelist dir1 [dir2] [dir3] ')
  .demand('endpoint')
  .alias('H', 'header')
  .describe('endpoint', 'Base url of query whitelist API')
  .describe('header', 'Header to send to the API: e.g key=value')

const { _: directories, endpoint, header } = argv

const parseHeaders = (headers) => {
  const result = {}

  headers = Array.isArray(headers) ? headers : [headers]
  headers.forEach(header => {
    const [key, val] = header.split(/=(.+)/)
    result[key] = val
  })

  return result
}

const client = axios.create({
  baseURL: endpoint,
  timeout: 10000,
  maxRedirects: 0,
  headers: parseHeaders(header)
})

const addQueryToWhitelist = async ({ query, filename }) => {
  try {
    console.log(`Adding query from ${filename}`)
    const { data: { operationName, id } } = await client.post('/queries', { query })
    console.log(`${operationName} => ${id}`)
  } catch (e) {
    if (e.ressponse) {
      console.error(e.response.data)
    } else {
      console.error(e)
    }
  }
}

const execute = async () => {
  let store

  try {
    await Promise.all(directories.map(async dir => {
      const queries = await getQueriesFromDir(dir)
      return Promise.all(queries.map(addQueryToWhitelist))
    }))
    console.log('All queries stored successfully')
  } catch (e) {
    console.trace(e)
    process.exitCode = 1
  } finally {
    store && store.redisClient.quit()
  }
}

execute()

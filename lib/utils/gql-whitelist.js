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
import path from 'path'
import { QueryRepository, storeQueriesFromDir } from './'
import { RedisStore } from '../store'

const { argv } = optimist
  .usage('Stores the queries residing in the specified directories.\nUsage: gql-whitelist dir1 [dir2] [dir3] ')
  .demand('config')
  .describe('config', 'path to the config file')

const { _: directories, config } = argv

const logResult = result => {
  console.log(result.map(({ id, operationName }) => `${operationName} => ${id}`).join('\n'))
}

const execute = async () => {
  let store

  try {
    const { redis: { url, options } } = require(path.resolve(config))
    store = new RedisStore(url, options)
    const repository = new QueryRepository(store)

    await Promise.all(directories.map(dir => storeQueriesFromDir(repository, dir).then(logResult)))
    console.log('All queries stored successfully')
  } catch (e) {
    console.trace(e)
    process.exitCode = 1
  } finally {
    store && store.redisClient.quit()
  }
}

execute()

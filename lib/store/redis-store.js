const redisKey = 'queries'

class RedisStore {
  constructor(...redisOptions) {
    const Redis = require('ioredis')
    this.redisClient = new Redis(...redisOptions)
  }

  get(key) {
    return this.redisClient.hget(redisKey, key).then((val) => val === null ? undefined : JSON.parse(val))
  }

  set(key, val) {
    return this.redisClient.hset(redisKey, key, JSON.stringify(val))
  }

  entries() {
    return this.redisClient.hgetall(redisKey).then(queries => (
      Object.keys(queries).map((key) => [key, JSON.parse(queries[key])])
    ))
  }

  delete(key) {
    return this.redisClient.hdel(redisKey, key)
  }

  clear() {
    return this.redisClient.flushdb()
  }
}

export default RedisStore

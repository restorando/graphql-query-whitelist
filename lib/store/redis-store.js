class RedisStore {
  constructor(...redisOptions) {
    const Redis = require('ioredis')
    this.redisClient = new Redis(...redisOptions)
  }

  get(key) {
    return this.redisClient.get(key)
  }

  put(key, val) {
    return this.redisClient.set(key, val)
  }

  entries() {
    return Array.from(this.queries)
  }

  clear() {
    return this.redisClient.flushdb()
  }
}

export default RedisStore

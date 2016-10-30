class MemoryStore {
  constructor() {
    this.queries = new Map()
  }

  async get(key) {
    return this.queries.get(key)
  }

  async put(key, val) {
    return this.queries.set(key, val)
  }

  async entries() {
    return Array.from(this.queries)
  }

  async clear() {
    this.queries = new Map()
  }
}

export default MemoryStore

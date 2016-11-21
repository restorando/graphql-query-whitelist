class MemoryStore {
  constructor() {
    this.queries = new Map()
  }

  async get(key) {
    return this.queries.get(key)
  }

  async set(key, val) {
    this.queries.set(key, val)
  }

  async entries() {
    return Array.from(this.queries)
  }

  async delete(key) {
    this.queries.delete(key)
  }

  async clear() {
    this.queries = new Map()
  }
}

export default MemoryStore

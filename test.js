import { QueryRepository, MemoryStore } from './lib'

const store = new MemoryStore()
const repository = new QueryRepository(store)

const query = `
  query MyQuery {
    users {
      firstName
    }
  }
`

repository.put(query).then((queryObj) => console.log(queryObj))

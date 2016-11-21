# graphql-query-whitelist
A simple GraphQL query whitelist toolkit for express.

It includes:

* An express middleware that prevents queries not in the whitelist to be executed. It also allows to execute queries just passing the queryId instead of the full query
* A REST API to create/get/list/enable/disable/delete queries from the whitelist
* A `MemoryStore` and `RedisStore` to store the queries
* An utility class (`QueryRepository`) to perform CRUD operations programatically

# Rationale

One of the security concerns for a typical GraphQL app is that it lacks of a security mechanism out of the box.

By default, anyone can query any field of your GraphQL app, and if your schema supports nested queries, a malicious attacker could make a query that consumes all the resources of the server.

Example:

```
query RecursiveQuery {
  friends {
    username

    friends {
      username

      friends {
        username

        friends { ... }
      }
    }
  }
}
```

This middleware avoids this type of queries checking if the incoming query is whitelisted or not.

(more info: [source 1](https://edgecoders.com/graphql-deep-dive-the-cost-of-flexibility-ee50f131a83d#.6okcpvtri), [source 2](https://dev-blog.apollodata.com/5-benefits-of-static-graphql-queries-b7fa90b0b69a))

# Installation

`npm install --save graphql-query-whitelist graphql body-parser`

In your app:

```js
import express from 'express'
import bodyParser from 'body-parser'
import graphqlWhitelist, { MemoryStore } from 'graphql-query-whitelist'

const app = express()
const store = new MemoryStore()
// body-parser must be included before including the query whitelist middleware
app.use(bodyParser.json())
app.post('/graphql', graphqlWhitelist({ store }))
```

Before each request is processed by GraphQL, it will check if the inbound query is in the whitelist or not.
If it's not in the whitelist, it will respond with a 401 status code.

# Running queries only sending the queryId

Since the server has access to the query store, and the store has access to the full queries, it's possible to run a query just sending the queryId.

E.g: `POST /graphql?queryId=dSPDigYWUw2w9wTI9g0RrbakmsJiRFIvTUa59jnZsV4=`

# Storing and retrievieng queries

There are 2 ways of storing and retrieving queries

### Rest API

Normally you would want to automate the process of storing queries at the build time.

This library includes a Rest API that you can mount in any express app to list, create, get, enable/disable and delete queries.

Example:

```js
import { Api as whitelistAPI, RedisStore } from 'graphql-query-whitelist'
app.use('/whitelist', whitelistAPI(new RedisStore()))
```

Will allow you to access to these routes:

```
GET /whitelist/queries
GET /whitelist/queries/:id
POST /whitelist/queries
PUT /whitelist/queries/:id
DELETE /whitelist/queries/:id
```

## Programatically using the QueryRepository

Example:

```js
import { QueryRepository, MemoryStore } from 'graphql-query-whitelist'

const store = new MemoryStore()
const repository = new QueryRepository(store)

const query = `
  query MyQuery {
    users {
      firstName
    }
  }
`

repository.put(query).then(console.log)

/*
 * Prints:
 * {
 *   id: 'dSPDigYWUw2w9wTI9g0RrbakmsJiRFIvTUa59jnZsV4=',
 *   query: 'query MyQuery {\n  users {\n    firstName\n  }\n}\n',
 *   operationName: 'MyQuery',
 *   enabled: true
 *  }
/*
```

The `QueryRepository` class exposes the following methods:

* get(queryId)
* put(query)
* update(queryId, properties)
* entries()
* delete(queryId)

# Stores

A store is the medium to list, get, store and delete queries.

It must implement the following methods:

##### get(key)
It returns a Promise that resolves to the value for that key

#### set(key, value)
returns a Promise that is resolved after the value is saved in the store

#### entries()
returns a Promise that resolves to an array of all the entries stored, having the following format:
`[[key1, val1], [key2, val2], ...]`

#### delete(key)
returns a Promise that is resolved after the element is deleted from the store

#### clear()
returns a Promise that is resolved after all the elements are deleted from the store

Including in this library are 2 stores:

* MemoryStore
* RedisStore (needs to have [ioredis](https://github.com/luin/ioredis) installed)

The `RedisStore` receives the [same constructor arguments as ioredis](https://github.com/luin/ioredis#connect-to-redis).

# Middleware Options

### store

This property is mandatory and must be a valid query store.

### skipValidationFn

This property is optional and must be a function that receives the `express` request object and returns a boolean value. If a truthy value is returned, the whitelist check is skipped and the query is executed.

This option is very useful to skip the whitelist check for certain apps that are already sending dynamic queries that are impossible to add to the whitelist.

Example:

```js
const skipValidationFn = (req) => req.get('X-App-Version') <> 'legacy-app-1.0'

app.post('/graphql', graphqlWhitelist({ store, skipValidationFn }))
```

### validationErrorFn

This property is optional and must be a function that receives the express request object and will be called for every query that is prevented to be executed by this middleware.

Example:

```js
import { verbose, warn } from 'utils/log'

const validationErrorFn = (req) => {
  warn(`Query '${req.queryId}' is not in the whitelist`)
  verbose(`Unauthorized query: ${req.normalizedQuery}`)
}

app.post('/graphql', graphqlWhitelist({ store, validationErrorFn }))
```

## License

Copyright (c) 2016 Restorando

MIT License

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

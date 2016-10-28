# graphql-query-whitelisting
A simple GraphQL query whitelisting middleware for express

# Rationale

One of the security concerns for a typical GraphQL app is that it lacks of a security mechanism out of the box.

By default, anyone can query any field of your GraphQL app, and if your schema supports nested queries, someone could make a query that consumes all the resources of the server. 

Example:

```
{
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

`npm install --save graphql-query-whitelisting`

In your app:

```js
import express from 'express'
import bodyParser from 'body-parser'
import Redis from 'ioredis'

const app = express()
const redis = new Redis()

// This function must return a Promise that resolves with a truthy value if the query is valid.
const validateFn = (queryHash) => redis.sismember('query-whitelist', queryHash)

app.use(bodyParser.json()) // body-parser must be included before including the query whitelisting middleware
app.post('/graphql', queryWhitelisting({ validateFn }))
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

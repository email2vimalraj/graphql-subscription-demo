const http = require('http')
const { ApolloServer, PubSub, gql } = require('apollo-server-express')
const express = require('express')

const PORT = 4000
const app = express()

const pubsub = new PubSub()
const COUNT_INCREMENTED = 'COUNT_INCREMENTED'

let count = 1

const interval = setInterval(() => {
  count += 1
  pubsub.publish(COUNT_INCREMENTED, { count })
}, 3000)

const typeDefs = gql`
  type Query {
    count: Int
  }

  type Subscription {
    count: Int
  }
`

const resolvers = {
  Query: {
    count: () => count
  },

  Subscription: {
    count: {
      subscribe: () => pubsub.asyncIterator([COUNT_INCREMENTED])
    }
  }
}

const server = new ApolloServer({ typeDefs, resolvers })
server.applyMiddleware({ app })

const httpServer = http.createServer(app)
server.installSubscriptionHandlers(httpServer)

httpServer.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}${server.graphqlPath}`)
  console.log(
    `Subscriptions on ws://localhost:${PORT}${server.subscriptionsPath}`
  )
})

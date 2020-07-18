const { ApolloServer, PubSub, gql } = require('apollo-server')

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

server.listen().then(({ url }) => console.log(`Server running at ${url}`))

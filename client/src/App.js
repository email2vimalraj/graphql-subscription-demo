import React from 'react'
import { Layout, Row, Col, Modal } from 'antd'
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql,
  useQuery,
  HttpLink,
  split
} from '@apollo/client'
import { WebSocketLink } from '@apollo/client/link/ws'
import { getMainDefinition } from '@apollo/client/utilities'

import './App.css'

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql'
})

const subscriptionLink = new WebSocketLink({
  uri: 'ws://localhost:4000/graphql',
  options: {
    reconnect: true
  }
})

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  subscriptionLink,
  httpLink
)

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache()
})

const COUNT_QUERY = gql`
  query CountQuery {
    count
  }
`

const COUNT_SUBSCRIPTION = gql`
  subscription CountSubscription {
    count
  }
`

function Counter() {
  const { loading, error, data, subscribeToMore } = useQuery(COUNT_QUERY)

  const [modalVisible, setModalVisible] = React.useState(false)

  React.useEffect(() => {
    let unsubscribe

    if (!modalVisible) {
      unsubscribe = subscribeToMore({
        document: COUNT_SUBSCRIPTION,
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) return prev

          return {
            count: subscriptionData.data.count
          }
        }
      })
    }

    if (unsubscribe) return () => unsubscribe()
  }, [modalVisible, subscribeToMore])

  return (
    <>
      <h1
        style={{ fontSize: 54, cursor: 'pointer' }}
        onClick={() => setModalVisible(!modalVisible)}
      >
        {loading ? 'Loading' : error ? 'Error :(' : data.count}
      </h1>
      <Modal
        title="Drill down"
        visible={modalVisible}
        onOk={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
      >
        <p>Drill down here</p>
      </Modal>
    </>
  )
}

function App() {
  return (
    <ApolloProvider client={client}>
      <Layout style={{ height: '100vh' }}>
        <Layout.Content
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Row>
            <Col span={24} style={{ textAlign: 'center', padding: '16px 0' }}>
              <Counter />
            </Col>
          </Row>
        </Layout.Content>
      </Layout>
    </ApolloProvider>
  )
}

export default App

import { ApolloProvider } from '@apollo/client/react'
import React from 'react'
import * as ReactDOM from 'react-dom/client'

import App from './App.jsx'
import client from './graphql/apolloClient.js'
import DashboardProvider from './providers/DashboardProvider.jsx'
import './styles/global.css'

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <ApolloProvider client={client}>
    <DashboardProvider>
      <App />
    </DashboardProvider>
  </ApolloProvider>,
)

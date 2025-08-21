// eslint-disable-next-line import/no-unresolved
import 'dotenv/config.js'
import fs from 'fs'
import path from 'path'

import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import morgan from 'morgan'

import { schema } from './graphql/index.js'

const PORT = process.env.PORT || 3001
const IS_PROD = process.env.NODE_ENV === 'production'

const app = express()

const logDirectory = path.join(process.cwd(), 'logs')
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

// One log per instance, since the public and internal instances share this dir
const logFileName = IS_PROD ? `access-${PORT}.log` : 'accessDEV.log'
const accessLogStream = fs.createWriteStream(
  path.join(logDirectory, logFileName),
  { flags: 'a' },
)

app.use(morgan('combined', { stream: accessLogStream }))

const server = new ApolloServer({
  schema,
  introspection: !IS_PROD,
  playground: !IS_PROD,
})

async function startServer() {
  await server.start()
  server.applyMiddleware({ app, path: '/graphql' })

  app.listen({ port: PORT }, () => {
    if (!IS_PROD)
      console.log(
        `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`,
      )
  })
}

startServer()

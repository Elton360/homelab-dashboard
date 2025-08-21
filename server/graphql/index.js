import { readFileSync } from 'fs'
import { join } from 'path'

import { mergeResolvers } from '@graphql-tools/merge'
import { makeExecutableSchema } from '@graphql-tools/schema'

import { ROOT_DIR } from '../helpers/env.js'

import Query from './resolvers/Query.js'

const typeDefs = readFileSync(
  join(ROOT_DIR, 'graphql', 'schema.graphql'),
  'utf8',
)

const resolvers = mergeResolvers([Query])

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

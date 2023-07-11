// index.ts
import 'reflect-metadata';
import * as tq from 'type-graphql';
import { ApolloServer } from 'apollo-server';
import { PrismaClient } from '@prisma/client';
import { UserResolver } from "./resolvers/UserResolver";
import { MovieResolver } from "./resolvers/MovieResolver";

// Creating a new PrismaClient instance
const prisma = new PrismaClient()

const app = async () => {
  // Building the GraphQL schema using TypeGraphQL and the resolvers
  const schema = await tq.buildSchema({ resolvers: [UserResolver, MovieResolver]  })

  // Defining the context that will be available to all resolvers
  const context = {
    prisma
  }

  // Creating a new ApolloServer instance and starting the server
  new ApolloServer({ schema, context: ({ req }) => ({ req, prisma }), }).listen({ port: 4000 }, () =>
    console.log('🚀 Server ready at: <http://localhost:4000>')
  )
}

app()
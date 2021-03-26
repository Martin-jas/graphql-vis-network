import ApolloClient, { Resolvers } from "apollo-boost";
import { buildTypeDefsAndResolvers } from "type-graphql";
import fetch from 'node-fetch';

import EdgeResolver from "../../resolvers/EdgeResolver";
import VertexResolver from "../../resolvers/VertexResolver";
import TokenResolver from "../../resolvers/TokenResolver";
import {FSDataIntegration} from "../../data"

export default async function createApolloClient() {
  const { typeDefs, resolvers } = await buildTypeDefsAndResolvers({
    resolvers: [TokenResolver(FSDataIntegration), EdgeResolver(FSDataIntegration), VertexResolver(FSDataIntegration)],
    skipCheck: true, // allow for schema without queries
  });

  const client = new ApolloClient({
    uri: 'http://localhost:4000/',
    fetch: fetch,
    clientState: {
      typeDefs,
      resolvers: resolvers as Resolvers,
      defaults: {
        Vertex: {
          __typename: "Vertex",
        },
        Edge: {
            __typename: "Edge",
          },
        Token: {
          __typename: "Token",
        },
      },
    },
  });

  return client;
}
import { GraphQLServer } from "graphql-yoga";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import EdgeResolver from "./resolvers/EdgeResolver";
import VertexResolver from "./resolvers/VertexResolver";
import TokenResolver from "./resolvers/TokenResolver";
import Express from "express"
import {SaveData} from "./data"
/* import {CosmosDataIntegration} from "./dataClients/cosmosClient" */
import {ArangoDataIntegration} from "./dataClients/arangoClient"
import BodyParser from "body-parser"
import {db} from "./dataClients/arangoClient"
console.log(db)
async function StartGraphQLServer() {
  const schema = await buildSchema({
    resolvers: [TokenResolver(ArangoDataIntegration), EdgeResolver(ArangoDataIntegration), VertexResolver(ArangoDataIntegration)],
    emitSchemaFile: true,
  });

  const server = new GraphQLServer({
    schema,
  });

  await server.start(() => console.log("Server is running on http://localhost:4000"))
  const customRouter = Express.Router();
  customRouter.use(BodyParser());
  customRouter.get('/save', async () => {
    SaveData()
    return 200
  });

  server.express.use(customRouter);
}

StartGraphQLServer();



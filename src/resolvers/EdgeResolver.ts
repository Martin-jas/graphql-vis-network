// src/resolvers/ProjectResolver.ts

import { Arg, FieldResolver, Query, Resolver, Root, Mutation } from "type-graphql";
import { EdgeData, VertexData } from "../data";
import Vertex from "../schemas/Vertex";
import Edge from "../schemas/Edge";

export default (dataIntegrationModule) => {
@Resolver(of => Edge)
class EdgeResolver {
  @Query(returns => [Edge])
  listEdges(): Promise<EdgeData[]> {
    return dataIntegrationModule.listEdges();
  }

  @Query(returns => Edge, { nullable: true })
  getEdge(@Arg("id") id: number): Promise<EdgeData> {
    return dataIntegrationModule.getEdge(id)
  }

  @Query(returns => Edge, { nullable: true })
  edgeByName(@Arg("name") name: string): Promise<EdgeData>{
    //TODO
    return null;
  }

  @FieldResolver(returns => Vertex)
  from(@Root() edge: EdgeData):Promise<VertexData>{
    return dataIntegrationModule.getVertex(edge.from)
  }

  @FieldResolver(() => Vertex)
  to(@Root() edge: EdgeData):Promise<VertexData>{
    return dataIntegrationModule.getVertex(edge.to)
  }

  @Mutation(returns => [Edge])
    async delete(@Arg("id") id: string): Promise<EdgeData[]> {
      return  dataIntegrationModule.removeEdge(id).then(() => dataIntegrationModule.listEdges());
    }
}
return EdgeResolver
}
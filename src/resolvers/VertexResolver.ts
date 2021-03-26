// src/resolvers/TaskResolver.ts

import { Arg, FieldResolver, Mutation, Query, Resolver, Root } from "type-graphql";
import { VertexData, EdgeData, TokenData } from "../data";
import Vertex, {VertexInput} from "../schemas/Vertex";
import Edge from "../schemas/Edge";
import Token, { TokenInput } from "../schemas/Token";
import { DataIntegration } from "../dataInterface";
import { asyncForEach } from "../util";

export default (dataIntegrationModule: DataIntegration) => {
  @Resolver(() => Vertex)
  class VertexResolver{
    @Query(() => [Vertex])
    listVertices(): Promise<VertexData[]> {
      return dataIntegrationModule.listVertices();
    }
  
    @Query(() => Vertex, { nullable: true })
    async getVertex(@Arg("id") id: string): Promise<VertexData>{
      const v = await dataIntegrationModule.getVertex(id)
      console.log(v)
      if (!v.in){
        v.in=[]
      }
      v.in = v.in.reduce((acc, c) => {
        if(c!= null) {
          return [...acc, c]
        }
        return acc
      }, [])
      return v;
    }
  
    @Mutation(() => Vertex)
    createVertex(@Arg("name") name: string, @Arg("resourceType") resourceType: string){
      const newV : VertexData = {
        id: null,
        name: name,
        resourceType: resourceType,
        currentLoad: [],
        in: [],
        out:[]
      };
      return dataIntegrationModule.addVertex(newV)
    }

    @Mutation(() => Vertex)
    async updateVertex(@Arg("v") v: VertexInput){
      const transformedLoad = [];
      if (v.currentLoad && v.currentLoad.length) {
        await asyncForEach(v.currentLoad, async c => {
          console.log(typeof c)
          if( typeof c === "string"){
            transformedLoad.push(c)
          }else{
            const token = await dataIntegrationModule.addToken(c)
            transformedLoad.push(token.id)
          }
        } )
      }
      console.log({transformedLoad})
      const transformedVertex = {...v, currentLoad: transformedLoad}
      return dataIntegrationModule.updateVertex(transformedVertex).catch(e => console.log("could not update vertex: ", e.message))
    }
  
    @Mutation(() => Edge)
    async connect(@Arg("fromVertex") fromV: string, @Arg("toVertex") toV: string, @Arg("edgeName") edgeName: string): Promise<EdgeData> {
      console.log("Attemp to connect", fromV, toV);
      const fromVertex = await dataIntegrationModule.getVertex(fromV);
      if (!fromVertex) {
        throw new Error(`Couldn't find the vertex with id ${fromV}`);
      }
      const toVertex = await dataIntegrationModule.getVertex(toV);
      if (!toVertex) {
        throw new Error(`Couldn't find the vertex with id ${toV}`);
      }
  
      console.log({
        fromVertex,
        toVertex
      });
  
      const newEdge : EdgeData = {
        id: null,
        name: edgeName,
        from: fromV,
        to: toV,
      };
  
      const addedEdge = await dataIntegrationModule.addEdge(newEdge)
      console.log({addedEdge})

      fromVertex.out.push(addedEdge.id);
      toVertex.in.push(addedEdge.id);
      // TODO: this can be done in parallel
      await dataIntegrationModule.addVertex(fromVertex)
      await dataIntegrationModule.addVertex(toVertex)
      console.log({addedEdge})
      return addedEdge;
    }
  
    @FieldResolver(() => [Edge])
    async in(@Root() v: VertexData):Promise<[EdgeData]>{
      console.log("in: ", v.id)
      const edges =[]  as unknown as [EdgeData]
      const promises = []
      v.in.forEach(inc => {
        promises.push(dataIntegrationModule.getEdge(inc).catch(console.log).then(positive => positive && edges.push(positive), console.log))
      })
      await Promise.all(promises)
      console.log(edges)
      
      return edges.reduce((acc, c) => (c && [...acc, c] || acc), []) as unknown as [EdgeData] // remove null
    }
  
  
    @FieldResolver(() => [Edge])
    async  out(@Root() v: VertexData):Promise<EdgeData>{
      console.log("in: ", v.id)
      const edges =[]  as unknown as [EdgeData]
      const promises = []
      v.out.forEach(inc => {
        promises.push(dataIntegrationModule.getEdge(inc).catch(console.log).then(positive => positive && edges.push(positive), console.log))
      })
      await Promise.all(promises)
      console.log(edges)
      
      return edges.reduce((acc, c) => (c && [...acc, c] || acc), []) as unknown as [EdgeData] // remove null
    }

    @FieldResolver(() => [Token])
    async currentLoad(@Root() v: VertexData):Promise<[TokenData]>{
      console.log("in: ", v.id)
      const load =[]  as unknown as [TokenData]
      const promises = []
      v.currentLoad.forEach(inc => {
        promises.push(dataIntegrationModule.getToken(inc).then(positive => positive && load.push(positive), console.log));
      })
      await Promise.all(promises)
      console.log(load)
      return load
    }

  }
  
  return VertexResolver
}

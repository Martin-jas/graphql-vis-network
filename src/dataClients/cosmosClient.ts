/*
import Gremlin from "gremlin";
import {DataIntegration} from "./dataInterface"
import { EdgeData, VertexData } from "./data";

const cosmosAuth = {
  endpoint: "wss://gremilintraining.gremlin.cosmos.azure.com:443/",
  primaryKey: "xj6Yh31uMqzEdIBJLB6ORGtSLFD5gOp3TW4O8vLCFIfHFxqHF4kVgVbzbgCLiBsQHHJeYbzhYJH95qNQg0DI6A==",
  database: "graphdb",
  collection: "Persons",
}


const authenticator =new Gremlin.driver.auth.PlainTextSaslAuthenticator(`/dbs/${cosmosAuth.database}/colls/${cosmosAuth.collection}`, cosmosAuth.primaryKey)
const client = new Gremlin.driver.Client(
  cosmosAuth.endpoint, 
  { 
      authenticator,
      traversalsource : "g",
      rejectUnauthorized : true,
      mimeType : "application/vnd.gremlin-v2.0+json"
  }
);
function countVertices()
{
    console.log('Running Count');
    return client.submit("g.V().count()", { }).then(function (result) {
        console.log("Result: %s\n", JSON.stringify(result));
    });
}

console.log(countVertices())

export const CosmosDataIntegration : DataIntegration = {
    addVertex: async (vertex: VertexData) => {
        let addNodeQuery = "g.addV(label).property('id', id).property('name', name)"
        const toBeAdded = {
            label:"persons",
            id:vertex.id,
            name:vertex.name,
            in: vertex.in,
            out: vertex.out,
        }
        if (!toBeAdded.in.length){
            delete toBeAdded.in
        }else{
            addNodeQuery += ".addNodeQuery.property('in', in)";
        }
        if (!toBeAdded.out.length){
            delete toBeAdded.out
        }else{
            addNodeQuery += ".property('out', out)";
        }
        const node = await client.submit(addNodeQuery,toBeAdded )
        console.log(transformeNode(node && node._items && node._items[0]))
        return transformeNode(node && node._items && node._items[0])
    },
    removeVertex: async (id: string | number) => {
        return client.submit("g.V(id).drop()", {
            id
        }).catch(e =>console.log(e))
    },
    addEdge: async (edge: EdgeData) => {
        const edgeC = await client.submit("g.V(source).addE(relationship).to(g.V(target))", {
            source:edge.from, 
            relationship: edge.name,
            target:edge.to
        }).catch(e => console.log(e))
        return edgeC && edgeC._items && transformEdges(edgeC._items[0])
    },
    removeEdge: async (id: string | number) => {
        const edge = client.submit("g.E(id).drop()", {
            id
        }).catch(e => console.log(e))
        return edge._items
    },
    saveData: async () => {},
    async getVertex(id: string | number): Promise<VertexData>{
        const node = await client.submit("g.V(id)", {
            id
        }).catch(e => console.log(e))
        return transformeNode(node._items[0])
    },
    async getEdge(id: string | number): Promise<EdgeData>{
        const comminEdge = await client.submit("g.E(id)", {
            id
        }).catch(e => console.log(e));
        const a : EdgeData = {
            id: comminEdge._items.id,
            name: comminEdge._items.relationship,
            from: comminEdge._items.source,
            to: comminEdge._items.target,
        }
        return a
    },
    listEdges(): Promise<EdgeData[]>{
        const e = client.submit("g.E()").catch(e => console.log(e))
        return e && e._items && e._items.map((edge):EdgeData => ({
            id: edge.id,
            name: edge.relationship,
            from: edge.source,
            to: edge.target,
        })) ||[]
    },
    async listVertices():Promise<VertexData[]>{
        console.log("trying to list")
        const a = await client.submit("g.V()").catch(e => console.log(e))
        console.log(JSON.stringify(a))

        return a._items.map((cnode):VertexData => {
            return {
                id: cnode.id,
                name: cnode && cnode.properties && cnode.properties.name && cnode.properties.name[0] && cnode.properties.name[0].value || cnode.label,
                in: cnode && cnode.properties && cnode.properties.in,
                out: cnode && cnode.properties && cnode.properties.out,
            }
        }) || []
    },
  };

  const transformeNode = (cnode:any):VertexData => {
    return {
        id: cnode.id,
        name: cnode && cnode.properties && cnode.properties.name && cnode.properties.name[0] && cnode.properties.name[0].value || cnode.label,
        in: cnode && cnode.properties && cnode.properties.in,
        out: cnode && cnode.properties && cnode.properties.out,
    }
  }
  const transformEdges = (comminEdge:any):EdgeData => {
    return {
        id: comminEdge.id,
        name: comminEdge.relationship,
        from: comminEdge.source,
        to: comminEdge.target,
    }
  }
  */
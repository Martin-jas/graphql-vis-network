import {EdgeData, VertexData} from "../data"
import {DataIntegration} from "../dataInterface"
import { Database, DocumentCollection, EdgeCollection } from "arangojs";
import { tokensIntegration } from "./arango/tokens"
import { vertexIntegration } from "./arango/vertex";
import { edgesIntegration } from "./arango/edges";


export const db = new Database({
    url: "http://localhost:8529"    
  });

const initArango = async () => {
  await db.createDatabase("test").catch(e => {
      console.log(e.message)
  });
  
  try {
    // Init documents
    await nodes.create().catch(e => console.log(e.message))
    // Init Edges
    await edges.create({
        waitForSync: true // always sync document changes to disk
    }).catch(e => console.log(e.message));
    // Init Tokens
    await tokens.create({
        waitForSync: true // always sync document changes to disk
    }).catch(e => console.log(e.message));

    // ...
    return {nodes, edges, tokens}
  } catch (err) {
  }
};

export interface ArangoDBHolder {
    nodes: DocumentCollection<any>;
    edges: EdgeCollection<any>;
    tokens: DocumentCollection<any>;
}

const arangoDB : ArangoDBHolder = {nodes:null, edges: null, tokens: null}
initArango().then(DBs => {
    arangoDB.nodes = DBs.nodes;
    arangoDB.edges = DBs.edges;
    arangoDB.tokens = DBs.tokens;
});

export const ArangoDataIntegration : DataIntegration = {
    saveData: (vertices: VertexData[], edges: EdgeData[]) => {},
    ...tokensIntegration(arangoDB,db),
    ...vertexIntegration(arangoDB, db),
    ...edgesIntegration(arangoDB, db)
}
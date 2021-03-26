// src/data.ts
import fs from "fs";
import {DataIntegration} from "./dataInterface"

export interface EdgeData {
    id: number | string;
    name: string;
    from: number | string;
    to: number | string;
  }

  export interface VertexData {
     id: number | string;
     name: string;
     resourceType: string;
     currentLoad: [number | string] | any;
     out: [number | string] | any;
     in: [number | string] | any;
  }
  
  export interface TokenData {
    id: number | string;
    type: string;
    intensity: number;
    owner: string;
 }

  import de from "./dataEdges.json";
  import ve from "./dataVertices.json";
  export const edges: EdgeData[] = de.edges;
  export const vertices: VertexData[] = ve.vertices;

  export const SaveData  = () =>  {
    console.log("Trying to save data...")
    const edgesString = JSON.stringify({edges}, null, 2)
    const verticesString = JSON.stringify({vertices}, null, 2)
    // check if have to do the same to dist ( i think so )
    fs.writeFile("./src/dataEdges.json", edgesString, function(err) {
      if (err) {
          console.log(err);
      }
    });
    fs.writeFile("./src/dataVertices.json", verticesString, function(err) {
      if (err) {
          console.log(err);
      }
    });
    console.log("Done")
  }

  export const FSDataIntegration : DataIntegration = {
    addVertex: async (vertex: VertexData) => {
      const newVertex = {...vertex};
      if (!vertex.id){
        do {
          console.log("creating ID of vertex")
          newVertex.id = Math.random().toString(36).substring(2,5);
        } while(vertices.findIndex(v => v.id == newVertex.id) !== -1);
      }

      const index = vertices.findIndex(v => v.id == newVertex.id)
      if (index !== -1){
        vertices[index] = newVertex
      }else{
        vertices.push(newVertex);
      }

      return newVertex
    },
    removeVertex: async (id: string | number) => {
      vertices.filter(v => v.id !== id)
    },
    addEdge: async (edge: EdgeData) => {
      // TODO: Make it able to update
      if (!edge.id){
        edge.id = Math.random().toString(36).substring(2,5);
      }
      edges.push(edge);
      return edge
    },
    removeEdge: async (id: string | number) => {
      edges.filter(e => e.id !== id)
    },
    saveData: SaveData,
    getVertex: async (id: string | number) => {
      return vertices.find(v => v.id == id);
    },
    getEdge: async (id: string | number) => {
      return edges.find(e => e.id == id);
    },
    listEdges: async () => {
      return edges;
    },
    listVertices: async () => {
      return vertices;
    }
  };
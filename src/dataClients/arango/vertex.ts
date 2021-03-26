import { VertexData } from "../../data"
import { ArangoDBHolder } from "../arangoClient";
import { Database } from "arangojs"; 


export const vertexIntegration = (arangoDB: ArangoDBHolder, db: Database) => ({
    addVertex: async (vertex: VertexData) => {
        const trans = {...vertex, _id:null};
        if (trans.id) {
            trans._id = trans.id+""
            delete trans.id
        }
        const node = await arangoDB.nodes.save(trans,{overwrite:true, waitForSync: true});
        trans.id = node._id
        return trans
    },
    updateVertex: async (vertex: VertexData) => {
        await arangoDB.nodes.update(vertex.id+"" ,{...vertex, _id: (vertex.id+"")}, {waitForSync: true});
        return vertex
    },
    removeVertex: (id: string | number) => {
        arangoDB.nodes.remove({_id: id + ""}) // hack to let us use string | number
    },
    getVertex: async (id: string | number): Promise<VertexData> => {   
        if (!id){
            return null
        }    
        const node = await arangoDB.nodes.document({_id:id+""}).catch(e => console.log(e.message + " " + id))
        if (!node || !node._id){
            return null
        }
        node.id = node._id
        return node as unknown as VertexData
    },
    listVertices: async ():Promise<VertexData[]> => {
        const nodeList = await db.query(
            `FOR d IN nodes
            RETURN d`)
        const nodes = await nodeList.all()
        return nodes.map(nod => {
            nod.id = nod._id
            return nod
        })
    },
})
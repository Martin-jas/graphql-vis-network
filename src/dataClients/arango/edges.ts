import { EdgeData } from "../../data"
import { ArangoDBHolder } from "../arangoClient";
import { Database } from "arangojs"; 


export const edgesIntegration = (arangoDB: ArangoDBHolder, db: Database) => ({
    addEdge: async (edge: EdgeData) => {
        const trans = {...edge, _id:null};
        if (trans.id) {
            trans._id = trans.id+""
            delete trans.id
        }
        const e = await arangoDB.edges.save(trans, {_id:edge.from+""}, {_id:edge.to+""}, {returnNew:true});
        trans.id = e._id
        return {...trans, from: e.new._from, to: e.new._to }
    },
    
    removeEdge: (id: string | number) => {
        return arangoDB.edges.remove({_id: id+""}).then(()=>arangoDB.nodes.remove({_id: id+""})) // hack to let us use string | number
    },
    
    getEdge: async (id: string | number): Promise<EdgeData> => {
        arangoDB.edges.document(id+"")
        const edge = await arangoDB.edges.document({_id:id+""}).catch(e => console.log(e.message + " " + id))
        if (!edge || !edge._id){
            return null
        }
        edge.id = edge._id
        return edge as unknown as EdgeData
    },

    listEdges: async (): Promise<EdgeData[]> => {
        const edgesList = await db.query(
            `FOR d IN edges
            RETURN d`)
        const edges = await edgesList.all()

        return edges.filter(ed => ed.from && ed.to ).map(e => ({
            ...e,
            id: e._id,
        }))
    },
})
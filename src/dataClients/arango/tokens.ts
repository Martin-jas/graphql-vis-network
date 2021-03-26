import { TokenData } from "../../data"
import { ArangoDBHolder } from "../arangoClient";
import { Database } from "arangojs"; 


export const tokensIntegration = (arangoDB: ArangoDBHolder, db: Database) => ({
    addToken: async (token: TokenData) => {
        console.log("addToken", token)
        const trans = {...token, _id:null};
        if (trans.id) {
            trans._id = trans.id+""
            delete trans.id
        }else{
            trans._id = Math.random()*1000+""
        }
        const e = await arangoDB.tokens.save(trans,{overwrite:true, waitForSync: true});
        trans.id = e._id
        return trans
    },
    removeToken: async (id: string | number) => {
        console.log("removeToken")
        return arangoDB.tokens.remove({_id: id+""}).then(()=>arangoDB.nodes.remove({_id: id+""})) // hack to let us use string | number
    },
    getToken: async (id: string | number): Promise<TokenData|null> | null => {
        if (!id){
            return null
        }    
        console.log("getToken: ", id)
        const token = await arangoDB.tokens.document({_id:id+""}).catch(e => console.log(e.message + " " + id))
        if (!token || !token._id){
            return null
        }
        token.id = token._id
        return token as unknown as TokenData
    },
    listTokens: async (): Promise<TokenData[]> => {
        console.log("listTokens")
        const tokensList = await db.query(
            `FOR d IN tokens
            RETURN d`)
        const tokens = await tokensList.all()

        return tokens
    }
})
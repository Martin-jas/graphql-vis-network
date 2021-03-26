import {EdgeData, VertexData, TokenData} from "./data"

export interface DataIntegration {
    listVertices():Promise<VertexData[]>
    addVertex(vertex: VertexData)
    removeVertex(id: string | number)
    getVertex(id: string | number): Promise<VertexData|null> | null
    updateVertex(vertex: VertexData): Promise<VertexData|null> | null

    addEdge(edge: EdgeData)
    removeEdge(id: string | number)
    getEdge(id: string | number): Promise<EdgeData|null> | null
    listEdges(): Promise<EdgeData[]>
    
    addToken(token: TokenData)
    removeToken(id: string | number)
    getToken(id: string | number): Promise<TokenData|null> | null
    listTokens(): Promise<TokenData[]>

    saveData(vertices: VertexData[], edges: EdgeData[])

}
// src/resolvers/ProjectResolver.ts

import { Arg, FieldResolver, Query, Resolver, Root, Mutation } from "type-graphql";
import { VertexData, TokenData } from "../data";
import Vertex from "../schemas/Vertex";
import Token from "../schemas/Token";
import { DataIntegration } from "../dataInterface";

export default (dataIntegrationModule: DataIntegration) => {
@Resolver(of => Token)
class TokenResolver {
  @Query(returns => [Token])
  listTokens(): Promise<TokenData[]> {
    return dataIntegrationModule.listTokens();
  }

  @Query(returns => Token, { nullable: true })
  getToken(@Arg("id") id: number): Promise<TokenData> {
    return dataIntegrationModule.getToken(id)
  }

  @FieldResolver(returns => Vertex)
  owner(@Root() token: TokenData): Promise<VertexData>{
    return dataIntegrationModule.getVertex(token.owner)
  }

  @Mutation(returns => [Token])
    async delete(@Arg("id") id: string): Promise<TokenData[]> {
        return  dataIntegrationModule.removeToken(id).then(() => dataIntegrationModule.listTokens());
    }
}

return TokenResolver
}
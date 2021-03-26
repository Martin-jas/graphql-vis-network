// src/schemas/Token.ts

import { Field, ObjectType, InputType } from "type-graphql";
import Vertex from "./Vertex";

@ObjectType()
export default class Token {
  @Field(() => String)
  id: string;

  @Field(() => String)
  type: string;

  @Field(() => Vertex)
  owner: Vertex;

  @Field()
  intensity: number; // We can either add intensity or think each token as an entity ( not really optimized )
}

@InputType()
export class TokenInput {
  @Field(() => String, { nullable: true })
  id: string;

  @Field(() => String, {nullable: true})
  type: string;

  @Field(() => String, {nullable: true})
  owner: string;

  @Field({nullable: true})
  intensity: number;
}
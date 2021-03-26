// src/schemas/Project.ts

import { Field, ObjectType } from "type-graphql";
import Vertex from "./Vertex";

@ObjectType()
export default class Edge {
  @Field(() => String)
  id: number|string;

  @Field()
  type: string;

  @Field()
  name: string;

  @Field(() => Vertex)
  from: Vertex;

  @Field(() => Vertex)
  to: Vertex;
}
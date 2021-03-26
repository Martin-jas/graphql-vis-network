   // src/schemas/Task.ts

import { Field, ObjectType, InputType } from "type-graphql";
import Edge from "./Edge";
import Token, {TokenInput} from "./Token";

@ObjectType()
export default class Vertex {
  @Field(() => String)
  id: number|string;

  @Field()
  name: string;

  @Field()
  resourceType: string;

  @Field(() => [Token])
  currentLoad: [Token];

  @Field(() => [Edge])
  out: [Edge];

  @Field(() => [Edge])
  in: [Edge];
}

@InputType()
export class VertexInput {
    @Field(() => String)
    id: number|string;

    @Field()
    name: string;

    @Field()
    resourceType: string;

    @Field(() => [TokenInput])
    currentLoad: [TokenInput];

    @Field(() => [String])
    out: [string];

    @Field(() => [String])
    in: [string];
}
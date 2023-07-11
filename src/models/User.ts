import { ObjectType, Field, ID } from 'type-graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  id: number;

  @Field()
  userName: string;

  @Field()
  email: string;

  @Field()
  password: string;
}
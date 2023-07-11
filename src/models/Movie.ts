import { ObjectType, Field, ID } from 'type-graphql';

@ObjectType()
export class Movie {
  @Field(() => ID)
  id: number;

  @Field()
  movieName: string;

  @Field()
  description: string;

  @Field()
  directorName: string;

  @Field()
  releaseDate: Date;
}
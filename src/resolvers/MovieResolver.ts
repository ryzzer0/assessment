import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Ctx,
  Int,
  UseMiddleware,
} from "type-graphql";
import { ContextType } from "../types";
import { isAuth } from "../middleware/isAuth"; // This is a middleware function you'll need to create
import { Movie } from "./Movie";

class MovieNotFoundError extends Error {
    constructor() {
      super("Movie not found");
      this.name = "MovieNotFoundError";
    }
  }

@Resolver(Movie)
export class MovieResolver {
  @Query(() => [Movie])
  async movies(
    @Arg("skip", () => Int, { nullable: true }) skip: number,
    @Arg("take", () => Int, { nullable: true }) take: number,
    @Arg("orderBy", { nullable: true }) orderBy: string,
    @Arg("search", { nullable: true }) search: string,
    @Ctx() ctx: ContextType
  ) {

    const finalSkip = skip ?? 0;
    const finalTake = take ?? 10;

    return await ctx.prisma.movie.findMany({
      skip: finalSkip,
      take: finalTake,
      orderBy: orderBy ? { [orderBy]: "asc" } : undefined,
      where: search
        ? {
            OR: [
              { movieName: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : {},
    });
  }

  @Query(() => Movie)
  async movie(@Arg("id", () => Int) id: number, @Ctx() ctx: ContextType) {
    const movie = await ctx.prisma.movie.findUnique({ where: { id } });
    if (!movie) throw new Error("Movie not found");
    return movie;
  }

  @Mutation(() => Movie)
  @UseMiddleware(isAuth) // This middleware checks if the user is authenticated
  async createMovie(
    @Arg("movieName") movieName: string,
    @Arg("description") description: string,
    @Arg("directorName") directorName: string,
    @Arg("releaseDate") releaseDate: string,
    @Ctx() ctx: ContextType
  ) {
    const userId = ctx.payload.userId;
    const movie = await ctx.prisma.movie.create({
      data: {
        movieName,
        description,
        directorName,
        releaseDate: new Date(releaseDate),
        userId,
      },
    });
    return movie;
  }

  @Mutation(() => Movie)
  @UseMiddleware(isAuth)
  async updateMovie(
    @Arg("id", () => Int) id: number,
    @Arg("movieName", { nullable: true }) movieName: string,
    @Arg("description", { nullable: true }) description: string,
    @Arg("directorName", { nullable: true }) directorName: string,
    @Arg("releaseDate", { nullable: true }) releaseDate: string,
    @Ctx() ctx: ContextType
  ) {
    const movie = await ctx.prisma.movie.findUnique({ where: { id } });
    if (!movie) throw new Error("Movie not found");
    if (movie.userId !== ctx.payload.userId) throw new Error("Unauthorized");

    return await ctx.prisma.movie.update({
      where: { id },
      data: {
        movieName: movieName || movie.movieName,
        description: description || movie.description,
        directorName: directorName || movie.directorName,
        releaseDate: releaseDate ? new Date(releaseDate) : movie.releaseDate,
      },
    });
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteMovie(@Arg("id", () => Int) id: number, @Ctx() ctx: ContextType) {
    const movie = await ctx.prisma.movie.findUnique({ where: { id } });
    if (!movie) throw new MovieNotFoundError();
    if (movie.userId !== ctx.payload.userId) throw new Error("Unauthorized");

    await ctx.prisma.movie.delete({ where: { id } });
    return true;
  }
}

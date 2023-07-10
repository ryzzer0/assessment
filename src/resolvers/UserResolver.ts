import { Resolver, Mutation, Arg, Ctx, UseMiddleware } from "type-graphql";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { ContextType } from "../types";
import { User } from "./User";
import { Length, IsEmail, Matches } from "class-validator";
import { Field, InputType } from "type-graphql";
import { isAuth } from "../middleware/isAuth";

@InputType()
class SignupInput {
  @Field()
  @Length(1, 30)
  userName: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @Length(8, 50)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: "Password too weak",
  })
  password: string;
}

@InputType()
class ChangePasswordInput {
  @Field()
  @Length(1, 30)
  email: string;

  @Field()
  @Length(8, 50)
  oldPassword: string;

  @Field()
  @Length(8, 50)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password too weak',
  })
  newPassword: string;
}

class UserNotFoundError extends Error {
    constructor() {
      super("No user found");
      this.name = "UserNotFoundError";
    }
  }

@Resolver(User)
export class UserResolver {
  @Mutation(() => User)
  async signup(@Arg("data") data: SignupInput, @Ctx() ctx: ContextType) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await ctx.prisma.user.create({
      data: {
        userName: data.userName,
        email: data.email,
        password: hashedPassword,
      },
    });
    return user;
  } catch (err) {
    console.log(err);
    throw new Error("Error creating user");
  }

  @Mutation(() => String)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() ctx: ContextType
  ) {
    const user = await ctx.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UserNotFoundError();

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Invalid password");

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    return token;
  }

  @Mutation(() => User)
  @UseMiddleware(isAuth)
  async changePassword(@Arg("data") data: ChangePasswordInput, @Ctx() ctx: ContextType) {
    const user = await ctx.prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new UserNotFoundError();

    const valid = await bcrypt.compare(data.oldPassword, user.password);
    if (!valid) throw new Error("Invalid password");

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    const updatedUser = await ctx.prisma.user.update({
      where: { email: data.email },
      data: {
        password: hashedPassword
      }
    });
    return updatedUser;
  }
}

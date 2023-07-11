# Movie API

A GraphQL API for managing movies and users, built with Apollo Server, TypeGraphQL, and Prisma.

## Description

This API allows users to sign up, log in, and manage movies. Users can create, update, delete, and fetch movies. The API uses JWT for authentication and bcrypt for password hashing.

## Installation

1. Clone the repository: `git clone https://github.com/yourusername/movie-api.git`
2. Install dependencies: `npm install`
3. Set up your `.env` file with your `JWT_SECRET` and `DATABASE_URL`.
4. Run the Prisma migration: `npx prisma migrate dev`
5. Start the server: `npm start`

## Usage

To create a new user, use the `signup` mutation. To log in, use the `login` mutation, which will return a JWT. Include this JWT in the `Authorization` header of your requests, in the format `Bearer [your token]`.

## Testing

To run tests, use the `npm run dev` command.
import { MiddlewareFn } from 'type-graphql';
import { verify, TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { ContextType } from '../types';

// Middleware function for checking if a user is authenticated
export const isAuth: MiddlewareFn<ContextType> = ({ context }, next) => {
  // Extracting the 'authorization' header from the request
  const authorization = context.req.headers['authorization'];

  // If there's no 'authorization' header, the user is not authenticated
  if (!authorization) {
    throw new Error('Not authenticated');
  }

  try {
    // The 'authorization' header should be in the format "Bearer [token]"
    // So we split by space and take the second part
    const token = authorization.split(' ')[1];

    // Verifying the token with the secret ke
    const payload = verify(token, process.env.JWT_SECRET);

    // If the token is valid, we add the payload to the context
    context.payload = payload as any;
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      throw new Error('Session expired, please login again');
    } else if (err instanceof JsonWebTokenError) {
      throw new Error('Invalid token, please login again');
    } else {
      console.log(err);
      throw new Error('Not authenticated');
    }
  }

  return next();
};
import { MiddlewareFn } from 'type-graphql';
import { verify, TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { ContextType } from '../types';

export const isAuth: MiddlewareFn<ContextType> = ({ context }, next) => {
  const authorization = context.req.headers['authorization'];

  if (!authorization) {
    throw new Error('Not authenticated');
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = verify(token, process.env.JWT_SECRET);
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
import { PrismaClient } from '@prisma/client';
import { Request } from 'express';

export type ContextType = {
  prisma: PrismaClient;
  req: Request;
  payload?: { userId: number };
};
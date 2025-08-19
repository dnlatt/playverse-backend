// src/middlewares/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config } from '../config';
import { JWTPayload } from '../types/auth.d'; // Make sure the path is correct

declare global {
  namespace Express {
    export interface Request {
      user?: JWTPayload;
    }
  }
}

const prisma = new PrismaClient();
const jwtSecret = config.JWT_SECRET;

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Authorization token not found' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    // @ts-ignore
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (...roles: number[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.roleId;

    //console.log(`🔍 [DEBUG] Authorizing role ${userRole}, allowed roles:`, roles);

    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ error: 'You do not have permission to access this route' });
    }
    next();
  };
};
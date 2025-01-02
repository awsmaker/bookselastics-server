// filepath: /C:/Users/Haythem/Documents/000 dream/ebook/ebook-server-master/src/middlewares.ts
import { Request, Response, NextFunction } from 'express';

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  // Middleware logic for authentication
  next();
};

export const isValidReadingRequest = (req: Request, res: Response, next: NextFunction) => {
  // Middleware logic for validating reading requests
  next();
};
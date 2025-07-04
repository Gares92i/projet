import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        email?: string;
        isAuthenticated?: boolean;
        internalUserId?: string;
      };
    }
    
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      }
    }
  }
}

export interface RequestWithAuth extends Express.Request {
  auth?: {
    userId: string;
    email?: string;
    isAuthenticated?: boolean;
    internalUserId?: string;
  };
}

export { Response, NextFunction };

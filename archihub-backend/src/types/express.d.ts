import { Request } from 'express';

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
  }
}

export interface RequestWithAuth extends Request {
  auth?: {
    userId: string;
    email?: string;
    isAuthenticated?: boolean;
    internalUserId?: string;
  };
}

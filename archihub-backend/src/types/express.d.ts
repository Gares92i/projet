import { Request } from 'express';

export interface RequestWithAuth extends Request {
  auth?: {
    userId: string;
    isAuthenticated: boolean;
  };
  // Propriétés ajoutées par Clerk
  userId?: string;
  session?: any;
}

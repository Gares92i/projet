import { Request } from 'express';

export interface RequestWithAuth extends Request {
  auth?: {
    userId: string;
    isAuthenticated: boolean;
  };
  userId?: string; // Ajouté par Clerk
  session?: any; // Ajouté par Clerk
}

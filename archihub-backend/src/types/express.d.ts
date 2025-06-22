import { Request } from 'express';

export interface RequestWithAuth extends Request {
  auth?: {
    userId: string; // ID Clerk
    internalUserId?: string; // ID interne (UUID)
    isAuthenticated: boolean;
    roles?: string[];
  };
}

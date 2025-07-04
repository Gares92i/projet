import { Request } from 'express';

// Étendre Request sans le redéclarer
export interface RequestWithAuth extends Request {
  auth?: {
    userId: string; // ID Clerk
    internalUserId?: string; // ID interne (UUID)
    isAuthenticated: boolean;
    roles?: string[];
  };
}

// Déclarer le module express pour éviter les conflits
declare module 'express' {
  interface Request {
    auth?: {
      userId: string;
      internalUserId?: string;
      isAuthenticated: boolean;
      roles?: string[];
    };
  }
}

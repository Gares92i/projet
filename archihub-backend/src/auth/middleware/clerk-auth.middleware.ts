import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

// Étendre l'interface Request pour inclure auth
interface RequestWithAuth extends Request {
  auth?: {
    userId: string;
    isAuthenticated: boolean;
  };
}

@Injectable()
export class ClerkAuthMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Utiliser l'interface étendue
      const request = req as RequestWithAuth;

      // SOLUTION TEMPORAIRE: Toujours authentifier en mode développement
      // REMARQUE: À remplacer par une vérification réelle en production
      request.auth = {
        userId: 'dev-user-id',
        isAuthenticated: true,
      };

      // Si vous voulez simuler l'authentification via un token de test
      // Décommentez ce bloc:
      /*
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];

        // Pour des besoins de test, vérifiez un token spécifique
        if (token === 'test-token') {
          request.auth = {
            userId: 'test-user-id',
            isAuthenticated: true,
          };
        }
      }
      */
    } catch (error) {
      console.error(
        "Erreur dans le middleware d'authentification:",
        error instanceof Error ? error.message : 'Erreur inconnue',
      );
    }

    next();
  }
}

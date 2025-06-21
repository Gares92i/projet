import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { RequestWithAuth } from '../../types/express';

@Injectable()
export class ClerkAuthMiddleware implements NestMiddleware {
  constructor(private authService: AuthService) {}

  async use(req: RequestWithAuth, res: Response, next: NextFunction) {
    try {
      // Utiliser le middleware Clerk
      const clerkMiddleware = this.authService.getClerkMiddleware();

      // Utiliser une promesse pour wrapper le middleware Express
      await new Promise<void>((resolve, reject) => {
        clerkMiddleware(req, res, (err?: any) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Si l'authentification réussit via Clerk, adapter notre format d'auth
      if (!req.auth && req.userId) {
        req.auth = {
          userId: req.userId,
          isAuthenticated: true,
        };
      }

      next();
    } catch (error) {
      console.error("Erreur d'authentification Clerk:", error);
      next(new UnauthorizedException('Non autorisé: Token invalide'));
    }
  }
}

import { Injectable, NestMiddleware } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class ClerkAuthMiddleware implements NestMiddleware {
  constructor(private authService: AuthService) {}

  use(req: any, res: any, next: any) {
    try {
      // Extraire le token d'autorisation
      const authHeader = req.headers.authorization;

      console.log("Headers d'autorisation:", authHeader?.substring(0, 20) + '...');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.auth = { userId: 'guest', isAuthenticated: false };
        return next();
      }

      const token = authHeader.split(' ')[1];
      console.log('Token reçu:', token);

      // Vérifier le token
      this.authService
        .verifyToken(token)
        .then((decoded: any) => {
          console.log('Token vérifié avec succès:', decoded.sub);
          req.auth = {
            userId: decoded.sub,
            isAuthenticated: true,
          };
          next();
        })
        .catch((err) => {
          console.error('Erreur de validation du token:', err.message);
          req.auth = { userId: 'guest', isAuthenticated: false };
          next();
        });
    } catch (error) {
      console.error('Erreur middleware auth:', error);
      req.auth = { userId: 'guest', isAuthenticated: false };
      next();
    }
  }
}

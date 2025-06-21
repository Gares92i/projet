import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {}

  /**
   * Vérifier un token JWT
   */
  async verifyToken(token: string) {
    try {
      const secretKey = this.configService.get<string>('CLERK_SECRET_KEY');
      if (!secretKey) {
        throw new Error('CLERK_SECRET_KEY non trouvée');
      }

      // Vérification simple du token JWT
      const decoded = jwt.verify(token, secretKey);
      return decoded;
    } catch (error) {
      throw new Error(`Erreur de vérification du token: ${error.message}`);
    }
  }

  /**
   * Obtenir les informations utilisateur de Clerk
   */
  async getUserInfo(userId: string) {
    const secretKey = this.configService.get<string>('CLERK_SECRET_KEY');
    try {
      const response = await axios.get(`https://api.clerk.com/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération des informations utilisateur: ${error.message}`,
      );
    }
  }

  /**
   * Implémenter un middleware d'authentification manuel
   */
  getClerkMiddleware() {
    return (req: any, res: any, next: any) => {
      try {
        // Extraire le token d'autorisation
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          req.auth = { isAuthenticated: false };
          return next();
        }

        const token = authHeader.split(' ')[1];

        // Vérifier le token
        this.verifyToken(token)
          .then((decoded: any) => {
            // Définir les informations d'authentification
            req.auth = {
              userId: decoded.sub,
              isAuthenticated: true,
            };
            next();
          })
          .catch((err) => {
            console.error('Erreur de validation du token:', err);
            req.auth = { isAuthenticated: false };
            next();
          });
      } catch (error) {
        console.error('Erreur middleware auth:', error);
        req.auth = { isAuthenticated: false };
        next();
      }
    };
  }
}

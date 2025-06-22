import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import * as jwkToPem from 'jwk-to-pem';
import { JWK } from 'jwk-to-pem';

// Définir un type pour les clés JWKS compatible avec jwk-to-pem
interface JwkKey {
  kid: string;
  kty: string;
  use: string;
  n: string;
  e: string;
  [key: string]: any;
}

@Injectable()
export class AuthService {
  private jwksCache: JwkKey[] | null = null;
  private jwksCacheExpiry: number = 0;

  constructor(private configService: ConfigService) {}

  /**
   * Obtenir les clés JWKS de Clerk pour vérifier les tokens
   */
  private async getClerkJWKS(): Promise<JwkKey[]> {
    const now = Date.now();

    // Utiliser le cache si disponible et non expiré (1 heure)
    if (this.jwksCache && this.jwksCacheExpiry > now) {
      return this.jwksCache;
    }

    try {
      const issuer =
        this.configService.get<string>('CLERK_ISSUER_URL') ||
        'https://actual-gator-23.clerk.accounts.dev';
      const response = await axios.get(`${issuer}/.well-known/jwks.json`);

      // Mettre à jour le cache
      this.jwksCache = response.data.keys as JwkKey[];
      this.jwksCacheExpiry = now + 3600000; // Expire dans 1 heure

      return this.jwksCache;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des JWKS: ${error.message}`);
    }
  }

  /**
   * Vérifier un token JWT en utilisant les clés JWKS de Clerk
   */
  async verifyToken(token: string) {
    // UNIQUEMENT POUR LE DÉVELOPPEMENT - À SUPPRIMER EN PRODUCTION
    if (token.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.')) {
      try {
        // Assurez-vous que cette clé correspond exactement à celle utilisée dans create-test-token.js
        const decoded = jwt.verify(token, 'test-secret-key-not-for-production');
        console.log('Token de test validé:', decoded);
        return decoded;
      } catch (e) {
        console.error('Erreur validation token de test:', e.message);
        // Continuer avec la vérification normale
      }
    }

    try {
      // Décoder le header du token pour obtenir le kid (Key ID)
      const decodedHeader = jwt.decode(token, { complete: true })?.header as { kid?: string };

      if (!decodedHeader || !decodedHeader.kid) {
        throw new Error('Token invalide ou sans kid');
      }

      // Récupérer les clés JWKS de Clerk
      const jwks = await this.getClerkJWKS();

      // Trouver la clé correspondant au kid
      const key = jwks.find((k: JwkKey) => k.kid === decodedHeader.kid);
      if (!key) {
        throw new Error(`Aucune clé correspondante trouvée pour le kid ${decodedHeader.kid}`);
      }

      // Convertir la clé JWK en format PEM pour jwt.verify
      // Utilisation d'une conversion de type pour satisfaire jwk-to-pem
      const publicKey = jwkToPem(key as JWK);

      // Vérifier le token avec la clé publique
      const verified = jwt.verify(token, publicKey, {
        algorithms: ['RS256'], // Clerk utilise RS256
        issuer:
          this.configService.get<string>('CLERK_ISSUER_URL') ||
          'https://actual-gator-23.clerk.accounts.dev',
      });

      return verified;
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
   * Obtenir un middleware pour Express qui vérifie les tokens Clerk
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

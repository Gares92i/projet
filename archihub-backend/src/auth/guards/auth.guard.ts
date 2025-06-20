import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
  private jwtSecret: string;

  constructor(private configService: ConfigService) {
    this.jwtSecret =
      this.configService.get<string>('JWT_SECRET') ||
      'super-secret-jwt-token-with-at-least-32-characters';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    // Pour le développement, accepter un token de test
    if (token === 'test-token') {
      request['auth'] = { userId: 'dev-user-id', isAuthenticated: true };
      return true;
    }

    if (!token) {
      throw new UnauthorizedException('Token non fourni');
    }

    try {
      const payload = jwt.verify(token, this.jwtSecret);

      // Utiliser le sub du JWT comme ID utilisateur
      const userId = typeof payload === 'object' && payload.sub ? payload.sub : null;

      if (!userId) {
        throw new UnauthorizedException('Token invalide: sub manquant');
      }

      // Ajouter les infos d'authentification à la requête
      request['auth'] = {
        userId,
        isAuthenticated: true,
      };

      return true;
    } catch (error) {
      this.logger.error(`Erreur d'authentification: ${error.message}`);
      throw new UnauthorizedException('Token invalide');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

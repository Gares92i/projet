import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../../users/users.service';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClerkUserMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ClerkUserMiddleware.name);
  private jwtSecret: string;

  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    this.jwtSecret =
      this.configService.get<string>('JWT_SECRET') ||
      'super-secret-jwt-token-with-at-least-32-characters';
  }

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const token = this.extractTokenFromHeader(req);

      // Passer au middleware suivant si pas de token
      if (!token || token === 'test-token') {
        return next();
      }

      const payload = jwt.verify(token, this.jwtSecret);
      if (typeof payload === 'object' && payload.sub) {
        const clerkUserId = payload.sub;
        const name = payload.name || '';
        const email = payload.email || '';

        // Synchroniser l'utilisateur avec la base de données
        await this.usersService.findOrCreate({
          id: clerkUserId,
          name,
          email,
        });
      }
    } catch (error) {
      this.logger.error(`Erreur lors de la synchronisation de l'utilisateur: ${error.message}`);
      // Continuer même en cas d'erreur
    }

    next();
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

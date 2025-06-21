import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { UsersService } from '../../users/users.service';
import { RequestWithAuth } from '../../types/express';

@Injectable()
export class ClerkUserMiddleware implements NestMiddleware {
  constructor(private readonly usersService: UsersService) {}

  async use(req: RequestWithAuth, res: Response, next: NextFunction) {
    try {
      // Vérifier si l'utilisateur est authentifié et a un ID Clerk
      if (req.auth && req.auth.userId) {
        const userId = req.auth.userId;

        // Essayer de trouver l'utilisateur dans notre base de données
        const user = await this.usersService.findByClerkId(userId);

        // Si l'utilisateur n'existe pas en DB, le créer
        if (!user) {
          await this.usersService.createFromClerk(userId);
        }
      }

      next();
    } catch (error) {
      console.error('Erreur lors de la synchronisation utilisateur:', error);
      next();
    }
  }
}

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { UsersService } from '../../users/users.service';
import { RequestWithAuth } from '../../types/express';

@Injectable()
export class ClerkUserMiddleware implements NestMiddleware {
  constructor(private readonly usersService: UsersService) {}

  async use(req: RequestWithAuth, res: Response, next: NextFunction) {
    try {
      if (req.auth && req.auth.userId) {
        const clerkId = req.auth.userId;
        const user = await this.usersService.findOrCreateByClerkId(clerkId);

        // Mettre à jour req.auth avec l'ID interne de l'utilisateur
        if (user) {
          req.auth.internalUserId = user.id;
        }
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation utilisateur:', error);
    }
    next();
  }
}

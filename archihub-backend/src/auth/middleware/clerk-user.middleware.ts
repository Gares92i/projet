import { Injectable, NestMiddleware } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

@Injectable()
export class ClerkUserMiddleware implements NestMiddleware {
  constructor(private readonly usersService: UsersService) {}

  async use(req: any & { auth?: any }, res: any, next: any) {
    try {
      if (req.auth && req.auth.userId && req.auth.userId !== 'guest') {
        const clerkUserId = req.auth.userId;
        const user = await this.usersService.findOrCreateByClerkId(clerkUserId);

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

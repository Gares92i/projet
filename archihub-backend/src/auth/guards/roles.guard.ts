import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../../users/users.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // Aucun rôle requis
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.auth?.userId;

    if (!userId) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }

    // Récupérer l'utilisateur et ses rôles depuis la base de données
    const user = await this.usersService.findByClerkId(userId);

    if (!user) {
      throw new UnauthorizedException('Utilisateur inconnu');
    }

    // Vérifier si l'utilisateur a au moins un des rôles requis
    const hasRequiredRole = requiredRoles.some((role) => user.roles && user.roles.includes(role));

    if (!hasRequiredRole) {
      throw new UnauthorizedException("Vous n'avez pas les permissions nécessaires");
    }

    return true;
  }
}

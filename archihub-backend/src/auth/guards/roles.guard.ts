import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../../users/users.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.auth?.userId;

    if (!userId) {
      return false;
    }

    // Récupérer l'utilisateur et ses rôles
    const user = await this.usersService.findById(userId);
    const userRoles = user.roles || [];

    return requiredRoles.some((role) => userRoles.includes(role));
  }
}

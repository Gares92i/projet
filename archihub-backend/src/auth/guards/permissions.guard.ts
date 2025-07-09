import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<string>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredPermission) {
      return true; // Pas de permission requise, accès libre
    }
    const request = context.switchToHttp().getRequest();
    // On suppose que le middleware d'auth a injecté agencyMember dans request
    const agencyMember = request.agencyMember;
    if (!agencyMember || !agencyMember.permissions) {
      throw new ForbiddenException('Aucune information de permissions trouvée');
    }
    if (agencyMember.role === 'admin') {
      return true; // Les admins ont tous les droits
    }
    if (agencyMember.permissions[requiredPermission]) {
      return true;
    }
    throw new ForbiddenException('Permission refusée');
  }
} 
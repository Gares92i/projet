import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RequestWithAuth } from '../../types/express';

@Injectable()
export class OwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const user = request.auth;

    if (!user?.userId) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    // Pour l'instant, on considère que l'utilisateur connecté est l'owner
    // Plus tard, on pourra vérifier le rôle dans la base de données
    return true;
  }
} 
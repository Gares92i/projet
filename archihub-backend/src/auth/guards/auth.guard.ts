import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestWithAuth } from '../../types/express';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();

    // Vérifier si l'utilisateur est authentifié
    if (request.auth && request.auth.isAuthenticated) {
      return true;
    }

    throw new UnauthorizedException('Vous devez être connecté pour accéder à cette ressource');
  }
}

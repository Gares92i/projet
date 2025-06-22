import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestWithAuth } from '../../types/express';

@Injectable()
// Assurez-vous que le garde vérifie req.auth et autorise les utilisateurs authentifiés
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    console.log('Auth Guard - État auth:', request.auth);

    if (!request.auth || !request.auth.isAuthenticated) {
      throw new UnauthorizedException('Vous devez être connecté pour accéder à cette ressource');
    }

    return true;
  }
}

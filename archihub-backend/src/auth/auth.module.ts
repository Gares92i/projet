import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { ClerkAuthMiddleware } from './middleware/clerk-auth.middleware';
import { UsersModule } from '../users/users.module';
import { ClerkUserMiddleware } from './middleware/clerk-user.middleware';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
  ],
  providers: [AuthService, RolesGuard],
  exports: [AuthService, RolesGuard],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    // Appliquer le middleware d'authentification à toutes les routes API
    consumer
      .apply(ClerkAuthMiddleware)
      .exclude(
        { path: 'api/health', method: RequestMethod.GET }, // Exclure les routes de santé
        { path: 'api-docs', method: RequestMethod.ALL }, // Exclure Swagger
      )
      .forRoutes('*');

    // Appliquer le middleware de synchronisation utilisateur
    consumer
      .apply(ClerkUserMiddleware)
      .exclude(
        { path: 'api/health', method: RequestMethod.GET },
        { path: 'api-docs', method: RequestMethod.ALL },
      )
      .forRoutes('*');
  }
}

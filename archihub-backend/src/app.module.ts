import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { ClientsModule } from './clients/clients.module';
import { ReportsModule } from './reports/reports.module';
import { TeamsModule } from './teams/teams.module';
import { DocumentsModule } from './documents/documents.module';
import { PdfModule } from './pdf/pdf.module';
import { UploadsModule } from './uploads/uploads.module'; // Ajoutez cette ligne
import { AuthModule } from './auth/auth.module';
import { ClerkAuthMiddleware } from './auth/middleware/clerk-auth.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 60 * 5, // 5 minutes
      max: 100, // 100 items maximum dans le cache
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        ssl: {
          rejectUnauthorized: false,
        },
        synchronize: false, // Important: Gardez à false car les tables existent déjà
        logging: ['query', 'error'],
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    ProjectsModule,
    ClientsModule,
    ReportsModule,
    TeamsModule,
    DocumentsModule,
    PdfModule,
    UploadsModule, // Ajoutez cette ligne
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ClerkAuthMiddleware).forRoutes('*');
  }
}

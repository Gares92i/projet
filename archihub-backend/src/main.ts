import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Sécurité avec Helmet
  app.use(helmet());

  // Activer CORS
  app.enableCors();

  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('ArchiHub API')
    .setDescription("API pour la gestion de projets d'architecture")
    .setVersion('1.0')
    .addTag('clients', 'Gestion des clients')
    .addTag('projects', 'Gestion des projets')
    .addTag('documents', 'Gestion des documents')
    .addTag('reports', 'Gestion des rapports')
    .addTag('teams', 'Gestion des équipes')
    .addTag('stats', 'Statistiques')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Servir les fichiers statiques
  app.useStaticAssets(path.join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

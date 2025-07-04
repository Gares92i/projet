import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as helmet from 'helmet'; // Changer l'import
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Sécurité avec Helmet
  app.use(helmet.default()); // Utiliser helmet.default()

  // Configuration pour augmenter la limite de taille des requêtes
  app.use((req: any, res: any, next: any) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  });

  // Activer CORS
  app.enableCors({
    origin: [
      'https://archihub-frontend.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:8084',
      'http://localhost:8083',
      'http://localhost:8082',
      'http://localhost:8081',
      'http://localhost:8080'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  });

  // Validation globale avec limite de taille augmentée
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
    .addTag('authentication')
    .addTag('clients')
    .addTag('projects')
    .addTag('documents')
    .addTag('reports')
    .addTag('teams')
    .addTag('stats')
    .addBearerAuth() // Important pour l'authentification
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Servir les fichiers statiques
  app.useStaticAssets(path.join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
// Force redeploy

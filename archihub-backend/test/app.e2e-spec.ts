import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ArchiHub API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('message');
      });
  });

  // Test d'authentification
  it('/clients (GET) - with auth', () => {
    return request(app.getHttpServer())
      .get('/clients')
      .set('Authorization', 'Bearer test-token')
      .expect(200);
  });

  // Test d'accès non autorisé
  it('/clients (GET) - without auth', () => {
    return request(app.getHttpServer()).get('/clients').expect(401);
  });
});

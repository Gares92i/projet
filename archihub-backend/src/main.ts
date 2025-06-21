import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
console.log('[ULTRA-DEBUG] main.ts script started.'); // Very first log

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { DataSource } from 'typeorm'; // No DataSource needed for this test

async function bootstrap() {
  console.log('[ULTRA-DEBUG] Bootstrap function entered.');
  let app;
  try {
    console.log('[ULTRA-DEBUG] Attempting NestFactory.create(AppModule)...');
    app = await NestFactory.create(AppModule);
    console.log('[ULTRA-DEBUG] NestJS app created successfully (DB module commented out).');

    // All other logic (listen, schema, datasource) removed for this test

    console.log('[ULTRA-DEBUG] Intending to exit successfully.');
    process.exit(0);

  } catch (error) {
    console.error('[ULTRA-DEBUG] Error during bootstrap (DB module commented out):', error);
    process.exit(1);
  }
  // No finally block with app.close() to ensure immediate exit via process.exit()
}

bootstrap();

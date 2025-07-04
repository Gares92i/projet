import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { ConfigModule } from '@nestjs/config';
import multer from 'multer';
import { UploadThingService } from './uploadthing.service';

@Module({
  imports: [
    ConfigModule,
    MulterModule.register({
      storage: multer.memoryStorage(), // Utiliser la mémoire pour le stockage temporaire
    }),
  ],
  controllers: [UploadsController],
  providers: [UploadsService, UploadThingService],
  exports: [UploadsService, UploadThingService],
})
export class UploadsModule {}

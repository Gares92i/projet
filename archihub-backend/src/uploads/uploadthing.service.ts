import { Injectable, Logger } from '@nestjs/common';
// @ts-ignore
const { UploadThing } = require('uploadthing');

@Injectable()
export class UploadThingService {
  private readonly logger = new Logger(UploadThingService.name);
  private readonly uploadthing = new UploadThing({
    apiKey: process.env.UPLOADTHING_SECRET,
  });

  /**
   * Upload un fichier vers UploadThing et retourne l'URL
   */
  async uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    try {
      const result = await this.uploadthing.upload({
        file: fileBuffer,
        fileName,
        contentType: mimeType,
      });
      return result.url;
    } catch (error) {
      this.logger.error(`Erreur UploadThing: ${error.message}`);
      throw error;
    }
  }
} 
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';

@Injectable()
export class UploadThingService {
  private readonly logger = new Logger(UploadThingService.name);
  private readonly apiKey = process.env.UPLOADTHING_SECRET;

  /**
   * Upload un fichier vers UploadThing et retourne l'URL
   */
  async uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    try {
      // Créer un FormData avec le fichier
      const formData = new FormData();
      formData.append('file', fileBuffer, {
        filename: fileName,
        contentType: mimeType,
      });

      // Appeler l'API UploadThing
      const response = await axios.post(
        'https://uploadthing.com/api/upload',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      if (response.data && response.data.url) {
        return response.data.url;
      } else {
        throw new Error('URL non trouvée dans la réponse UploadThing');
      }
    } catch (error) {
      this.logger.error(`Erreur UploadThing: ${error.message}`);
      throw error;
    }
  }
} 
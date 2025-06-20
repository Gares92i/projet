import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly uploadDir: string;
  private readonly thumbnailsDir: string;

  constructor(private configService: ConfigService) {
    // Créer les dossiers pour les uploads
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.thumbnailsDir = path.join(this.uploadDir, 'thumbnails');
    fs.ensureDirSync(this.uploadDir);
    fs.ensureDirSync(this.thumbnailsDir);
    this.logger.log(`Dossier pour les uploads: ${this.uploadDir}`);
  }

  /**
   * Sauvegarde une image téléchargée et génère une miniature
   */
  async saveImage(file: Express.Multer.File): Promise<{ url: string; thumbnailUrl: string }> {
    try {
      const uniqueId = uuidv4();
      const originalExt = path.extname(file.originalname).toLowerCase();
      const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

      // Vérifier si l'extension est autorisée
      if (!allowedExts.includes(originalExt)) {
        throw new Error('Format de fichier non supporté. Formats acceptés: JPG, PNG, GIF, WEBP');
      }

      // Créer des noms de fichiers uniques
      const imageName = `${uniqueId}${originalExt}`;
      const thumbnailName = `${uniqueId}_thumb${originalExt}`;

      const imagePath = path.join(this.uploadDir, imageName);
      const thumbnailPath = path.join(this.thumbnailsDir, thumbnailName);

      // Traiter et optimiser l'image avec Sharp
      await sharp(file.buffer)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toFile(imagePath);

      // Générer une miniature
      await sharp(file.buffer)
        .resize(300, 300, {
          fit: 'cover',
          position: 'centre',
        })
        .toFile(thumbnailPath);

      // Construire les URLs relatives
      const baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
      const imageUrl = `${baseUrl}/uploads/${imageName}`;
      const thumbnailUrl = `${baseUrl}/uploads/thumbnails/${thumbnailName}`;

      return { url: imageUrl, thumbnailUrl };
    } catch (error) {
      this.logger.error(`Erreur lors de la sauvegarde de l'image: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Supprime une image et sa miniature
   */
  async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      // Extraire le nom du fichier de l'URL
      const baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
      const relativePath = imageUrl.replace(`${baseUrl}/uploads/`, '');

      if (relativePath.includes('thumbnails/')) {
        // Si c'est une miniature
        const thumbnailPath = path.join(this.thumbnailsDir, path.basename(relativePath));
        const originalName = path.basename(relativePath).replace('_thumb', '');
        const originalPath = path.join(this.uploadDir, originalName);

        await Promise.all([
          fs.remove(thumbnailPath).catch(() => {}),
          fs.remove(originalPath).catch(() => {}),
        ]);
      } else {
        // Si c'est une image originale
        const imagePath = path.join(this.uploadDir, relativePath);
        const ext = path.extname(relativePath);
        const baseName = path.basename(relativePath, ext);
        const thumbnailPath = path.join(this.thumbnailsDir, `${baseName}_thumb${ext}`);

        await Promise.all([
          fs.remove(imagePath).catch(() => {}),
          fs.remove(thumbnailPath).catch(() => {}),
        ]);
      }

      return true;
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression de l'image: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Redimensionne une image existante et retourne l'URL de l'image redimensionnée
   */
  async resizeImage(imageUrl: string, width: number, height: number): Promise<string> {
    try {
      // Extraire le nom du fichier de l'URL
      const baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
      const relativePath = imageUrl.replace(`${baseUrl}/uploads/`, '');
      const imagePath = path.join(this.uploadDir, relativePath);

      // Vérifier si le fichier existe
      if (!fs.existsSync(imagePath)) {
        throw new Error('Image non trouvée');
      }

      // Créer un nom de fichier pour l'image redimensionnée
      const ext = path.extname(relativePath);
      const baseName = path.basename(relativePath, ext);
      const resizedName = `${baseName}_${width}x${height}${ext}`;
      const resizedPath = path.join(this.uploadDir, 'resized', resizedName);

      // Créer le dossier pour les images redimensionnées s'il n'existe pas
      fs.ensureDirSync(path.join(this.uploadDir, 'resized'));

      // Redimensionner l'image
      await sharp(imagePath)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toFile(resizedPath);

      // Retourner l'URL de l'image redimensionnée
      return `${baseUrl}/uploads/resized/${resizedName}`;
    } catch (error) {
      this.logger.error(
        `Erreur lors du redimensionnement de l'image: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Retourne le chemin absolu d'un fichier à partir de son URL
   */
  getFilePath(fileUrl: string): string {
    const baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
    const relativePath = fileUrl.replace(`${baseUrl}/uploads/`, '');

    if (relativePath.includes('thumbnails/')) {
      return path.join(this.thumbnailsDir, path.basename(relativePath));
    } else if (relativePath.includes('resized/')) {
      return path.join(this.uploadDir, 'resized', path.basename(relativePath));
    } else {
      return path.join(this.uploadDir, relativePath);
    }
  }
}

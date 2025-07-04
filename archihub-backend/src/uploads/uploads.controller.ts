import {
  Controller,
  Post,
  Get,
  Delete,
  Query,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  Res,
  HttpStatus,
  HttpException,
  ParseIntPipe,
  Logger,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Response } from '../types/express';
import { UploadsService } from './uploads.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import * as fs from 'fs-extra';

@Controller('uploads')
export class UploadsController {
  private readonly logger = new Logger(UploadsController.name);

  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async uploadFile(@UploadedFiles() files: Express.Multer.File[]) {
    try {
      // Prendre le premier fichier, quel que soit son nom de champ
      const file = files?.[0];

      if (!file) {
        throw new HttpException(
          "Aucun fichier fourni. Envoyez un fichier avec n'importe quel nom de champ.",
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.uploadsService.saveImage(file);
      return {
        success: true,
        imageUrl: result.url,
        thumbnailUrl: result.thumbnailUrl,
        message: 'Image téléchargée avec succès',
      };
    } catch (error) {
      this.logger.error(`Erreur lors de l'upload du fichier: ${error.message}`, error.stack);
      throw new HttpException(
        `Erreur lors de l'upload: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':filename')
  @UseGuards(AuthGuard)
  async deleteFile(@Param('filename') filename: string) {
    try {
      const baseUrl = 'http://localhost:3000'; // À récupérer de la config
      const imageUrl = `${baseUrl}/uploads/${filename}`;

      const result = await this.uploadsService.deleteImage(imageUrl);
      if (result) {
        return {
          success: true,
          message: 'Image supprimée avec succès',
        };
      } else {
        throw new HttpException('Image non trouvée', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression du fichier: ${error.message}`, error.stack);
      throw new HttpException(
        `Erreur lors de la suppression: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('resize')
  async resizeImage(
    @Query('url') imageUrl: string,
    @Query('width', ParseIntPipe) width: number,
    @Query('height', ParseIntPipe) height: number,
    @Res() res: Response,
  ) {
    try {
      const resizedUrl = await this.uploadsService.resizeImage(imageUrl, width, height);
      return res.status(HttpStatus.OK).json({
        success: true,
        imageUrl: resizedUrl,
        message: 'Image redimensionnée avec succès',
      });
    } catch (error) {
      this.logger.error(`Erreur lors du redimensionnement: ${error.message}`, error.stack);
      throw new HttpException(
        `Erreur lors du redimensionnement: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':filename')
  async serveFile(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const baseUrl = 'http://localhost:3000'; // À récupérer de la config
      const fileUrl = `${baseUrl}/uploads/${filename}`;
      const filePath = this.uploadsService.getFilePath(fileUrl);

      if (!fs.existsSync(filePath)) {
        throw new HttpException('Fichier non trouvé', HttpStatus.NOT_FOUND);
      }

      return res.sendFile(filePath);
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération du fichier: ${error.message}`, error.stack);
      throw new HttpException(
        `Erreur lors de la récupération du fichier: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('thumbnails/:filename')
  async serveThumbnail(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const baseUrl = 'http://localhost:3000'; // À récupérer de la config
      const fileUrl = `${baseUrl}/uploads/thumbnails/${filename}`;
      const filePath = this.uploadsService.getFilePath(fileUrl);

      if (!fs.existsSync(filePath)) {
        throw new HttpException('Miniature non trouvée', HttpStatus.NOT_FOUND);
      }

      return res.sendFile(filePath);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération de la miniature: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        `Erreur lors de la récupération de la miniature: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

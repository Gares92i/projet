import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Res,
  Logger,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { PdfService } from './pdf.service';
import { ReportDto } from './dto/report.dto';
import { Response } from 'express';
import * as fs from 'fs-extra';
import * as path from 'path';

@Controller('pdf')
export class PdfController {
  private readonly logger = new Logger(PdfController.name);

  constructor(private readonly pdfService: PdfService) {}

  @Post('generate-report')
  async generateReport(@Body() reportData: ReportDto) {
    try {
      const pdfPath = await this.pdfService.generateSiteVisitReport(reportData);

      // Renvoyer uniquement le nom du fichier pour référence ultérieure
      return {
        success: true,
        fileName: path.basename(pdfPath),
        message: 'PDF généré avec succès',
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la génération du PDF: ${error.message}`, error.stack);
      throw new HttpException(
        'Erreur lors de la génération du PDF',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('download/:filename')
  async downloadPdf(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const tempDir = path.join(require('os').tmpdir(), 'archihub-pdf');
      const filePath = path.join(tempDir, filename);

      if (!fs.existsSync(filePath)) {
        throw new HttpException('Fichier non trouvé', HttpStatus.NOT_FOUND);
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      this.logger.error(`Erreur lors du téléchargement du PDF: ${error.message}`, error.stack);
      throw new HttpException(
        'Erreur lors du téléchargement du PDF',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('preview/:filename')
  async previewPdf(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const tempDir = path.join(require('os').tmpdir(), 'archihub-pdf');
      const filePath = path.join(tempDir, filename);

      if (!fs.existsSync(filePath)) {
        throw new HttpException('Fichier non trouvé', HttpStatus.NOT_FOUND);
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      this.logger.error(`Erreur lors de la prévisualisation du PDF: ${error.message}`, error.stack);
      throw new HttpException(
        'Erreur lors de la prévisualisation du PDF',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

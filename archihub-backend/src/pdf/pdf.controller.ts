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
  UseGuards,
} from '@nestjs/common';
import { PdfService } from './pdf.service';
import { ReportDto } from './dto/report.dto';
import * as fs from 'fs-extra';
import * as path from 'path';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('pdf')
@UseGuards(AuthGuard, RolesGuard)
export class PdfController {
  private readonly logger = new Logger(PdfController.name);

  constructor(private readonly pdfService: PdfService) {}

  @Post('generate-report')
  @Roles('admin', 'manager', 'user')
  async generateReport(@Body() reportData: ReportDto, @Res() res: any) {
    try {
      const pdfPath = await this.pdfService.generateSiteVisitReport(reportData);
      const pdfBuffer = await fs.readFile(pdfPath);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="rapport.pdf"',
        'Content-Length': pdfBuffer.length,
      });
      
      res.end(pdfBuffer);
      
      // Nettoyer le fichier temporaire
      await fs.remove(pdfPath);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la génération du PDF' });
    }
  }

  @Get('download/:filename')
  async downloadPdf(@Param('filename') filename: string, @Res() res: any) {
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
  async previewPdf(@Param('filename') filename: string, @Res() res: any) {
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

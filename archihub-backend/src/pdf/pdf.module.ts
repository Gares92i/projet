import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { PdfController } from './pdf.controller';
import { ConfigModule } from '@nestjs/config';
import { ProjectsModule } from '../projects/projects.module';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [ConfigModule, ProjectsModule, ReportsModule],
  controllers: [PdfController],
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}

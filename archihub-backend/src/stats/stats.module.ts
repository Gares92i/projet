import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { Project } from '../projects/entities/project.entity';
import { Client } from '../clients/entities/client.entity';
import { Report } from '../reports/entities/report.entity';
import { Document } from '../documents/entities/document.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Client, Report, Document]), AuthModule],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
  ) {}

  async create(createReportDto: CreateReportDto): Promise<Report> {
    try {
      const report = this.reportsRepository.create(createReportDto);
      return await this.reportsRepository.save(report);
    } catch (error) {
      this.logger.error(`Erreur lors de la création du rapport: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(projectId?: string): Promise<Report[]> {
    try {
      const query = this.reportsRepository
        .createQueryBuilder('report')
        .leftJoinAndSelect('report.project', 'project')
        .leftJoinAndSelect('report.createdByUser', 'user')
        .orderBy('report.visitDate', 'DESC');

      if (projectId) {
        query.where('report.projectId = :projectId', { projectId });
      }

      return await query.getMany();
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des rapports: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOne(id: string): Promise<Report> {
    try {
      const report = await this.reportsRepository.findOne({
        where: { id },
        relations: ['project', 'createdByUser'],
      });

      if (!report) {
        throw new NotFoundException(`Rapport avec ID ${id} non trouvé`);
      }

      return report;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération du rapport: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateReportDto: UpdateReportDto): Promise<Report> {
    try {
      const report = await this.findOne(id);
      Object.assign(report, updateReportDto);
      return await this.reportsRepository.save(report);
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour du rapport: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const report = await this.findOne(id);
      await this.reportsRepository.remove(report);
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression du rapport: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByProject(projectId: string): Promise<Report[]> {
    try {
      return await this.reportsRepository.find({
        where: { projectId },
        relations: ['createdByUser'],
        order: { visitDate: 'DESC' },
      });
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des rapports par projet: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/entities/project.entity';
import { Client } from '../clients/entities/client.entity';
import { Report } from '../reports/entities/report.entity';
import { Document } from '../documents/entities/document.entity';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);

  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
  ) {}

  async getDashboardStats() {
    try {
      const [totalProjects, activeProjects, totalClients, totalReports, totalDocuments] =
        await Promise.all([
          this.projectsRepository.count(),
          this.projectsRepository.count({ where: { status: 'active' } }),
          this.clientsRepository.count(),
          this.reportsRepository.count(),
          this.documentsRepository.count(),
        ]);

      return {
        totalProjects,
        activeProjects,
        totalClients,
        totalReports,
        totalDocuments,
      };
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des statistiques: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getProjectStats(period: string) {
    try {
      let dateFilter: Date;
      const now = new Date();

      switch (period) {
        case 'week':
          dateFilter = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          dateFilter = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          dateFilter = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          dateFilter = new Date(now.setMonth(now.getMonth() - 1)); // default to month
      }

      const projects = await this.projectsRepository
        .createQueryBuilder('project')
        .where('project.created_at >= :dateFilter', { dateFilter })
        .getMany();

      // Définir le type explicitement avec Record<string, number>
      const projectsByStatus: Record<string, number> = {};

      projects.forEach((project) => {
        const status = project.status || 'unknown';
        projectsByStatus[status] = (projectsByStatus[status] || 0) + 1;
      });

      return {
        total: projects.length,
        byStatus: projectsByStatus,
        period,
      };
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des statistiques de projets: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}

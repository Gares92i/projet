import { Controller, Get, UseGuards, Logger, Query } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { StatsService } from './stats.service';

@Controller('stats')
@UseGuards(AuthGuard)
export class StatsController {
  private readonly logger = new Logger(StatsController.name);

  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  async getDashboardStats() {
    try {
      return await this.statsService.getDashboardStats();
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des statistiques: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get('projects')
  async getProjectStats(@Query('period') period: string = 'month') {
    try {
      return await this.statsService.getProjectStats(period);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des statistiques de projets: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}

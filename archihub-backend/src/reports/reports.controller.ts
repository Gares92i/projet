import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Logger,
  HttpException,
  HttpStatus,
  Req,
  Query,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(AuthGuard, PermissionsGuard)
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name);

  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @RequirePermission('stats')
  @ApiOperation({ summary: 'Créer un nouveau rapport' })
  @ApiResponse({ status: 201, description: 'Rapport créé avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 500, description: 'Erreur serveur.' })
  async create(@Body() createReportDto: CreateReportDto) {
    try {
      return await this.reportsService.create(createReportDto);
    } catch (error) {
      this.logger.error(`Erreur lors de la création du rapport: ${error.message}`, error.stack);
      throw new HttpException(
        `Erreur lors de la création du rapport: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @RequirePermission('stats')
  @ApiOperation({ summary: 'Récupérer tous les rapports' })
  @ApiResponse({ status: 200, description: 'Liste des rapports récupérée avec succès.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 500, description: 'Erreur serveur.' })
  @ApiQuery({
    name: 'projectId',
    required: false,
    description: 'ID du projet pour filtrer les rapports',
  })
  async findAll(@Query('projectId') projectId?: string) {
    try {
      return await this.reportsService.findAll(projectId);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des rapports: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        `Erreur lors de la récupération des rapports: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Récupérer les rapports par projet' })
  @ApiResponse({ status: 200, description: 'Rapports du projet récupérés avec succès.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 500, description: 'Erreur serveur.' })
  @ApiParam({ name: 'projectId', description: 'ID du projet' })
  async findByProject(@Param('projectId') projectId: string) {
    try {
      return await this.reportsService.findByProject(projectId);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des rapports par projet: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        `Erreur lors de la récupération des rapports par projet: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @RequirePermission('stats')
  @ApiOperation({ summary: 'Récupérer un rapport par ID' })
  @ApiResponse({ status: 200, description: 'Rapport récupéré avec succès.' })
  @ApiResponse({ status: 404, description: 'Rapport non trouvé.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 500, description: 'Erreur serveur.' })
  @ApiParam({ name: 'id', description: 'ID du rapport' })
  async findOne(@Param('id') id: string) {
    try {
      return await this.reportsService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      this.logger.error(`Erreur lors de la récupération du rapport: ${error.message}`, error.stack);
      throw new HttpException(
        `Erreur lors de la récupération du rapport: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @RequirePermission('stats')
  @ApiOperation({ summary: 'Mettre à jour un rapport' })
  @ApiResponse({ status: 200, description: 'Rapport mis à jour avec succès.' })
  @ApiResponse({ status: 404, description: 'Rapport non trouvé.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 500, description: 'Erreur serveur.' })
  @ApiParam({ name: 'id', description: 'ID du rapport' })
  async update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
    try {
      return await this.reportsService.update(id, updateReportDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      this.logger.error(`Erreur lors de la mise à jour du rapport: ${error.message}`, error.stack);
      throw new HttpException(
        `Erreur lors de la mise à jour du rapport: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @RequirePermission('stats')
  @ApiOperation({ summary: 'Supprimer un rapport' })
  @ApiResponse({ status: 200, description: 'Rapport supprimé avec succès.' })
  @ApiResponse({ status: 404, description: 'Rapport non trouvé.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 500, description: 'Erreur serveur.' })
  @ApiParam({ name: 'id', description: 'ID du rapport' })
  async remove(@Param('id') id: string) {
    try {
      await this.reportsService.remove(id);
      return { success: true, message: 'Rapport supprimé avec succès' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      this.logger.error(`Erreur lors de la suppression du rapport: ${error.message}`, error.stack);
      throw new HttpException(
        `Erreur lors de la suppression du rapport: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('template')
  async generateReportTemplate(@Body() data: any) {
    try {
      const templateData = {
        projectId: data.projectId,
        reportNumber: `R-${Math.floor(Math.random() * 10000)}`,
        visitDate: new Date(),
        contractor: '',
        inCharge: '',
        progress: 0,
        weather: '',
        participants: [],
        observations: [],
        recommendations: [],
        reserves: [],
        additionalDetails: '',
        createdByUserId: data.userId,
      };

      return templateData;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la génération du modèle de rapport: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        `Erreur lors de la génération du modèle de rapport: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

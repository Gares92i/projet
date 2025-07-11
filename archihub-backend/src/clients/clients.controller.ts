import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Logger,
  HttpException,
  HttpStatus,
  Req,
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
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequestWithAuth } from '../types/express';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';

@ApiTags('clients')
@ApiBearerAuth()
@Controller('clients')
@UseGuards(AuthGuard, PermissionsGuard)
export class ClientsController {
  private readonly logger = new Logger(ClientsController.name);

  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @RequirePermission('clients')
  @ApiOperation({ summary: 'Créer un nouveau client' })
  @ApiResponse({ status: 201, description: 'Le client a été créé avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 500, description: 'Erreur serveur.' })
  async create(@Body() createClientDto: CreateClientDto, @Req() req: RequestWithAuth) {
    try {
      const userId = req.auth?.userId;
      return await this.clientsService.create(createClientDto, userId);
    } catch (error) {
      this.logger.error(`Erreur lors de la création du client: ${error.message}`, error.stack);
      throw new HttpException(
        `Erreur lors de la création du client: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @RequirePermission('clients')
  @ApiOperation({ summary: 'Récupérer tous les clients' })
  @ApiResponse({ status: 200, description: 'Liste des clients récupérée avec succès.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 500, description: 'Erreur serveur.' })
  async findAll(@Req() req: RequestWithAuth) {
    try {
      const userId = req.auth?.userId;
      return await this.clientsService.findAll(userId);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des clients: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        `Erreur lors de la récupération des clients: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('search')
  @RequirePermission('clients')
  @ApiOperation({ summary: 'Rechercher des clients' })
  @ApiResponse({ status: 200, description: 'Résultats de la recherche récupérés avec succès.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 500, description: 'Erreur serveur.' })
  async search(@Query('q') query: string, @Req() req: RequestWithAuth) {
    try {
      const userId = req.auth?.userId;
      return await this.clientsService.search(query, userId);
    } catch (error) {
      this.logger.error(`Erreur lors de la recherche de clients: ${error.message}`, error.stack);
      throw new HttpException(
        `Erreur lors de la recherche de clients: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @RequirePermission('clients')
  @ApiOperation({ summary: 'Récupérer un client par ID' })
  @ApiResponse({ status: 200, description: 'Client récupéré avec succès.' })
  @ApiResponse({ status: 404, description: 'Client non trouvé.' })
  @ApiResponse({ status: 500, description: 'Erreur serveur.' })
  async findOne(@Param('id') id: string) {
    this.logger.log(`[FINDONE] Recherche du client avec l'ID: ${id}`);
    try {
      const client = await this.clientsService.findOne(id);
      this.logger.log(`[FINDONE] Résultat pour l'ID ${id}: ${client ? 'TROUVÉ' : 'NON TROUVÉ'}`);
      return client;
    } catch (error) {
      this.logger.error(`[FINDONE] Erreur pour l'ID ${id}: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        `Erreur lors de la récupération du client: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @RequirePermission('clients')
  @ApiOperation({ summary: 'Mettre à jour un client par ID' })
  @ApiResponse({ status: 200, description: 'Client mis à jour avec succès.' })
  @ApiResponse({ status: 404, description: 'Client non trouvé.' })
  @ApiResponse({ status: 500, description: 'Erreur serveur.' })
  async update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto, @Req() req: RequestWithAuth) {
    this.logger.log(`[UPDATE] Demande de mise à jour du client avec l'ID: ${id}`);
    try {
      const userId = req.auth?.userId;
      const updated = await this.clientsService.update(id, updateClientDto, userId);
      this.logger.log(`[UPDATE] Résultat pour l'ID ${id}: ${updated ? 'TROUVÉ ET MIS À JOUR' : 'NON TROUVÉ'}`);
      return updated;
    } catch (error) {
      this.logger.error(`[UPDATE] Erreur pour l'ID ${id}: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        `Erreur lors de la mise à jour du client: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @RequirePermission('clients')
  @ApiOperation({ summary: 'Supprimer un client par ID' })
  @ApiResponse({ status: 200, description: 'Client supprimé avec succès.' })
  @ApiResponse({ status: 404, description: 'Client non trouvé.' })
  @ApiResponse({ status: 500, description: 'Erreur serveur.' })
  async remove(@Param('id') id: string, @Req() req: RequestWithAuth) {
    try {
      const userId = req.auth?.userId;
      await this.clientsService.remove(id, userId);
      return { success: true, message: 'Client supprimé avec succès' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      this.logger.error(`Erreur lors de la suppression du client: ${error.message}`, error.stack);
      throw new HttpException(
        `Erreur lors de la suppression du client: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

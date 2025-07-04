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

@ApiTags('clients')
@ApiBearerAuth()
@Controller('clients')
@UseGuards(AuthGuard)
export class ClientsController {
  private readonly logger = new Logger(ClientsController.name);

  constructor(private readonly clientsService: ClientsService) {}

  @Post()
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
  @Roles('admin', 'manager', 'user')
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
  @Roles('admin', 'manager', 'user')
  @ApiOperation({ summary: 'Récupérer un client par ID' })
  @ApiResponse({ status: 200, description: 'Client récupéré avec succès.' })
  @ApiResponse({ status: 404, description: 'Client non trouvé.' })
  @ApiResponse({ status: 500, description: 'Erreur serveur.' })
  async findOne(@Param('id') id: string) {
    try {
      return await this.clientsService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      this.logger.error(`Erreur lors de la récupération du client: ${error.message}`, error.stack);
      throw new HttpException(
        `Erreur lors de la récupération du client: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Mettre à jour un client par ID' })
  @ApiResponse({ status: 200, description: 'Client mis à jour avec succès.' })
  @ApiResponse({ status: 404, description: 'Client non trouvé.' })
  @ApiResponse({ status: 500, description: 'Erreur serveur.' })
  async update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    try {
      return await this.clientsService.update(id, updateClientDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      this.logger.error(`Erreur lors de la mise à jour du client: ${error.message}`, error.stack);
      throw new HttpException(
        `Erreur lors de la mise à jour du client: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Supprimer un client par ID' })
  @ApiResponse({ status: 200, description: 'Client supprimé avec succès.' })
  @ApiResponse({ status: 404, description: 'Client non trouvé.' })
  @ApiResponse({ status: 500, description: 'Erreur serveur.' })
  async remove(@Param('id') id: string) {
    try {
      await this.clientsService.remove(id);
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

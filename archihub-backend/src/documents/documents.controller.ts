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
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';

@ApiTags('documents')
@ApiBearerAuth()
@Controller('documents')
@UseGuards(AuthGuard, PermissionsGuard)
export class DocumentsController {
  private readonly logger = new Logger(DocumentsController.name);

  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @RequirePermission('documents')
  @ApiOperation({ summary: 'Créer un nouveau document' })
  @ApiResponse({ status: 201, description: 'Document créé avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 500, description: 'Erreur serveur.' })
  async create(@Body() createDocumentDto: CreateDocumentDto) {
    try {
      return await this.documentsService.create(createDocumentDto);
    } catch (error) {
      this.logger.error(`Erreur lors de la création du document: ${error.message}`, error.stack);
      throw new HttpException(
        `Erreur lors de la création du document: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @RequirePermission('documents')
  @ApiOperation({ summary: 'Récupérer tous les documents' })
  @ApiResponse({ status: 200, description: 'Liste des documents récupérée avec succès.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 500, description: 'Erreur serveur.' })
  @ApiQuery({
    name: 'projectId',
    required: false,
    description: 'ID du projet pour filtrer les documents',
  })
  async findAll(@Query('projectId') projectId?: string) {
    try {
      return await this.documentsService.findAll(projectId);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des documents: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        `Erreur lors de la récupération des documents: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @RequirePermission('documents')
  @ApiOperation({ summary: 'Récupérer un document par ID' })
  @ApiResponse({ status: 200, description: 'Document récupéré avec succès.' })
  @ApiResponse({ status: 404, description: 'Document non trouvé.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 500, description: 'Erreur serveur.' })
  @ApiParam({ name: 'id', description: 'ID du document' })
  async findOne(@Param('id') id: string) {
    try {
      return await this.documentsService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      this.logger.error(
        `Erreur lors de la récupération du document: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        `Erreur lors de la récupération du document: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @RequirePermission('documents')
  @ApiOperation({ summary: 'Mettre à jour un document' })
  @ApiResponse({ status: 200, description: 'Document mis à jour avec succès.' })
  @ApiResponse({ status: 404, description: 'Document non trouvé.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 500, description: 'Erreur serveur.' })
  @ApiParam({ name: 'id', description: 'ID du document' })
  async update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto) {
    try {
      return await this.documentsService.update(id, updateDocumentDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      this.logger.error(`Erreur lors de la mise à jour du document: ${error.message}`, error.stack);
      throw new HttpException(
        `Erreur lors de la mise à jour du document: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @RequirePermission('documents')
  @ApiOperation({ summary: 'Supprimer un document' })
  @ApiResponse({ status: 200, description: 'Document supprimé avec succès.' })
  @ApiResponse({ status: 404, description: 'Document non trouvé.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 500, description: 'Erreur serveur.' })
  @ApiParam({ name: 'id', description: 'ID du document' })
  async remove(@Param('id') id: string) {
    try {
      await this.documentsService.remove(id);
      return { success: true, message: 'Document supprimé avec succès' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      this.logger.error(`Erreur lors de la suppression du document: ${error.message}`, error.stack);
      throw new HttpException(
        `Erreur lors de la suppression du document: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

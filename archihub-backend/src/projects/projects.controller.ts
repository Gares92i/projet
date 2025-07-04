import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RequestWithAuth } from '../types/express';
import { UploadThingService } from '../uploads/uploadthing.service';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
@UseGuards(AuthGuard)
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly uploadThingService: UploadThingService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau projet' })
  @ApiResponse({ status: 201, description: 'Projet créé avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 500, description: 'Erreur serveur.' })
  async create(@Body() createProjectDto: CreateProjectDto, @Request() req: RequestWithAuth) {
    // Vérification explicite et sûre de l'authentification
    if (!req.auth?.userId) {
      throw new Error('Utilisateur non authentifié');
    }
    const userId = req.auth.userId;

    return await this.projectsService.create(createProjectDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les projets' })
  @ApiResponse({ status: 200, description: 'Liste des projets récupérée avec succès.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 500, description: 'Erreur serveur.' })
  @ApiQuery({
    name: 'clientId',
    required: false,
    description: 'ID du client pour filtrer les projets',
  })
  async findAll(@Query('clientId') clientId: string, @Request() req: RequestWithAuth) {
    // Vérification explicite et sûre de l'authentification
    if (!req.auth?.userId) {
      throw new Error('Utilisateur non authentifié');
    }
    const userId = req.auth.userId;

    return await this.projectsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un projet par ID' })
  @ApiResponse({ status: 200, description: 'Projet récupéré avec succès.' })
  @ApiResponse({ status: 404, description: 'Projet non trouvé.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 500, description: 'Erreur serveur.' })
  @ApiParam({ name: 'id', description: 'ID du projet' })
  async findOne(@Param('id') id: string) {
    return await this.projectsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un projet' })
  @ApiResponse({ status: 200, description: 'Projet mis à jour avec succès.' })
  @ApiResponse({ status: 404, description: 'Projet non trouvé.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 500, description: 'Erreur serveur.' })
  @ApiParam({ name: 'id', description: 'ID du projet' })
  async update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return await this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un projet' })
  @ApiResponse({ status: 200, description: 'Projet supprimé avec succès.' })
  @ApiResponse({ status: 404, description: 'Projet non trouvé.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 500, description: 'Erreur serveur.' })
  @ApiParam({ name: 'id', description: 'ID du projet' })
  async remove(@Param('id') id: string) {
    return await this.projectsService.remove(id);
  }

  @Post(':id/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: "Uploader une image pour un projet via UploadThing" })
  @ApiResponse({ status: 200, description: 'Image uploadée et projet mis à jour.' })
  async uploadProjectImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('Aucun fichier reçu');
    }
    // Upload vers UploadThing
    const url = await this.uploadThingService.uploadFile(file.buffer, file.originalname, file.mimetype);
    // Mettre à jour le projet
    const updated = await this.projectsService.update(id, { imageUrl: url });
    return { success: true, imageUrl: url, project: updated };
  }
}

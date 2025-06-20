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
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('teams')
@ApiBearerAuth()
@Controller('teams')
@UseGuards(AuthGuard)
export class TeamsController {
  private readonly logger = new Logger(TeamsController.name);

  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @ApiOperation({ summary: "Créer un nouveau membre d'équipe" })
  @ApiResponse({
    status: 201,
    description: "Membre d'équipe créé avec succès.",
  })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 500, description: 'Erreur serveur.' })
  async create(@Body() createTeamMemberDto: CreateTeamMemberDto) {
    try {
      return await this.teamsService.create(createTeamMemberDto);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la création du membre d'équipe: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        `Erreur lors de la création du membre d'équipe: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: "Récupérer tous les membres d'équipe" })
  @ApiResponse({
    status: 200,
    description: "Liste des membres d'équipe récupérée avec succès.",
  })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 500, description: 'Erreur serveur.' })
  async findAll() {
    try {
      return await this.teamsService.findAll();
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des membres d'équipe: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        `Erreur lors de la récupération des membres d'équipe: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: "Récupérer un membre d'équipe par ID" })
  @ApiResponse({
    status: 200,
    description: "Membre d'équipe récupéré avec succès.",
  })
  @ApiResponse({ status: 404, description: "Membre d'équipe non trouvé." })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 500, description: 'Erreur serveur.' })
  @ApiParam({ name: 'id', description: "ID du membre d'équipe" })
  async findOne(@Param('id') id: string) {
    try {
      return await this.teamsService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      this.logger.error(
        `Erreur lors de la récupération du membre d'équipe: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        `Erreur lors de la récupération du membre d'équipe: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: "Mettre à jour un membre d'équipe" })
  @ApiResponse({
    status: 200,
    description: "Membre d'équipe mis à jour avec succès.",
  })
  @ApiResponse({ status: 404, description: "Membre d'équipe non trouvé." })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 500, description: 'Erreur serveur.' })
  @ApiParam({ name: 'id', description: "ID du membre d'équipe" })
  async update(@Param('id') id: string, @Body() updateTeamMemberDto: UpdateTeamMemberDto) {
    try {
      return await this.teamsService.update(id, updateTeamMemberDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      this.logger.error(
        `Erreur lors de la mise à jour du membre d'équipe: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        `Erreur lors de la mise à jour du membre d'équipe: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: "Supprimer un membre d'équipe" })
  @ApiResponse({
    status: 200,
    description: "Membre d'équipe supprimé avec succès.",
  })
  @ApiResponse({ status: 404, description: "Membre d'équipe non trouvé." })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 500, description: 'Erreur serveur.' })
  @ApiParam({ name: 'id', description: "ID du membre d'équipe" })
  async remove(@Param('id') id: string) {
    try {
      await this.teamsService.remove(id);
      return {
        success: true,
        message: "Membre d'équipe supprimé avec succès",
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      this.logger.error(
        `Erreur lors de la suppression du membre d'équipe: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        `Erreur lors de la suppression du membre d'équipe: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

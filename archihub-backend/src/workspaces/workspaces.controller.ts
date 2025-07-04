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
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RequestWithAuth } from '../types/express.d';

@ApiTags('workspaces')
@ApiBearerAuth()
@Controller('workspaces')
@UseGuards(AuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau workspace' })
  @ApiResponse({ status: 201, description: 'Workspace créé avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  async create(@Body() createWorkspaceDto: CreateWorkspaceDto, @Request() req: RequestWithAuth) {
    if (!req.auth?.userId) {
      throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
    }
    return await this.workspacesService.create(createWorkspaceDto, req.auth.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les workspaces de l\'utilisateur' })
  @ApiResponse({ status: 200, description: 'Liste des workspaces récupérée avec succès.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  async findAll(@Request() req: RequestWithAuth) {
    if (!req.auth?.userId) {
      throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
    }
    return await this.workspacesService.findAllByUser(req.auth.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un workspace par ID' })
  @ApiResponse({ status: 200, description: 'Workspace récupéré avec succès.' })
  @ApiResponse({ status: 404, description: 'Workspace non trouvé.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiParam({ name: 'id', description: 'ID du workspace' })
  async findOne(@Param('id') id: string, @Request() req: RequestWithAuth) {
    if (!req.auth?.userId) {
      throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
    }
    return await this.workspacesService.findOne(id, req.auth.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un workspace' })
  @ApiResponse({ status: 200, description: 'Workspace mis à jour avec succès.' })
  @ApiResponse({ status: 404, description: 'Workspace non trouvé.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
  @ApiParam({ name: 'id', description: 'ID du workspace' })
  async update(
    @Param('id') id: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
    @Request() req: RequestWithAuth
  ) {
    if (!req.auth?.userId) {
      throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
    }
    return await this.workspacesService.update(id, updateWorkspaceDto, req.auth.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un workspace' })
  @ApiResponse({ status: 200, description: 'Workspace supprimé avec succès.' })
  @ApiResponse({ status: 404, description: 'Workspace non trouvé.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
  @ApiParam({ name: 'id', description: 'ID du workspace' })
  async remove(@Param('id') id: string, @Request() req: RequestWithAuth) {
    if (!req.auth?.userId) {
      throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
    }
    return await this.workspacesService.remove(id, req.auth.userId);
  }

  @Post(':id/invite')
  @ApiOperation({ summary: 'Inviter un membre dans le workspace' })
  @ApiResponse({ status: 201, description: 'Invitation envoyée avec succès.' })
  @ApiResponse({ status: 404, description: 'Workspace non trouvé.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
  @ApiParam({ name: 'id', description: 'ID du workspace' })
  async inviteMember(
    @Param('id') id: string,
    @Body() inviteMemberDto: InviteMemberDto,
    @Request() req: RequestWithAuth
  ) {
    if (!req.auth?.userId) {
      throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
    }
    return await this.workspacesService.inviteMember(id, inviteMemberDto, req.auth.userId);
  }

  @Post('invitations/:token/accept')
  @ApiOperation({ summary: 'Accepter une invitation au workspace' })
  @ApiResponse({ status: 201, description: 'Invitation acceptée avec succès.' })
  @ApiResponse({ status: 404, description: 'Invitation invalide.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiParam({ name: 'token', description: 'Token d\'invitation' })
  async acceptInvitation(
    @Param('token') token: string,
    @Request() req: RequestWithAuth
  ) {
    if (!req.auth?.userId) {
      throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
    }
    return await this.workspacesService.acceptInvitation(token, req.auth.userId);
  }

  @Patch(':id/members/:memberId/role')
  @ApiOperation({ summary: 'Mettre à jour le rôle d\'un membre' })
  @ApiResponse({ status: 200, description: 'Rôle mis à jour avec succès.' })
  @ApiResponse({ status: 404, description: 'Membre non trouvé.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
  @ApiParam({ name: 'id', description: 'ID du workspace' })
  @ApiParam({ name: 'memberId', description: 'ID du membre' })
  async updateMemberRole(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() updateRoleDto: UpdateMemberRoleDto,
    @Request() req: RequestWithAuth
  ) {
    if (!req.auth?.userId) {
      throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
    }
    return await this.workspacesService.updateMemberRole(id, memberId, updateRoleDto, req.auth.userId);
  }

  @Delete(':id/members/:memberId')
  @ApiOperation({ summary: 'Retirer un membre du workspace' })
  @ApiResponse({ status: 200, description: 'Membre retiré avec succès.' })
  @ApiResponse({ status: 404, description: 'Membre non trouvé.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
  @ApiParam({ name: 'id', description: 'ID du workspace' })
  @ApiParam({ name: 'memberId', description: 'ID du membre' })
  async removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Request() req: RequestWithAuth
  ) {
    if (!req.auth?.userId) {
      throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
    }
    return await this.workspacesService.removeMember(id, memberId, req.auth.userId);
  }

  @Post(':id/leave')
  @ApiOperation({ summary: 'Quitter le workspace' })
  @ApiResponse({ status: 200, description: 'Workspace quitté avec succès.' })
  @ApiResponse({ status: 404, description: 'Workspace non trouvé.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 403, description: 'Le propriétaire ne peut pas quitter le workspace.' })
  @ApiParam({ name: 'id', description: 'ID du workspace' })
  async leaveWorkspace(@Param('id') id: string, @Request() req: RequestWithAuth) {
    if (!req.auth?.userId) {
      throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
    }
    return await this.workspacesService.leaveWorkspace(id, req.auth.userId);
  }
} 
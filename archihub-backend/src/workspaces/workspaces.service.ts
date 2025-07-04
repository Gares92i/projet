import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace, WorkspaceSubscriptionPlan, WorkspaceSubscriptionStatus } from './entities/workspace.entity';
import { WorkspaceMember, WorkspaceMemberRole, WorkspaceMemberStatus } from './entities/workspace-member.entity';
import { WorkspaceInvitation, WorkspaceInvitationStatus } from './entities/workspace-invitation.entity';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { User } from '../users/entities/user.entity';
import * as crypto from 'crypto';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceMember)
    private workspaceMemberRepository: Repository<WorkspaceMember>,
    @InjectRepository(WorkspaceInvitation)
    private workspaceInvitationRepository: Repository<WorkspaceInvitation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Créer un nouveau workspace
  async create(createWorkspaceDto: CreateWorkspaceDto, userId: string): Promise<Workspace> {
    const workspace = this.workspaceRepository.create({
      ...createWorkspaceDto,
      createdByUserId: userId,
      slug: this.generateSlug(createWorkspaceDto.name),
    });

    const savedWorkspace = await this.workspaceRepository.save(workspace);

    // Ajouter le créateur comme owner
    await this.workspaceMemberRepository.save({
      workspaceId: savedWorkspace.id,
      userId: userId,
      role: WorkspaceMemberRole.OWNER,
      status: WorkspaceMemberStatus.ACTIVE,
      acceptedAt: new Date(),
    });

    return savedWorkspace;
  }

  // Récupérer tous les workspaces d'un utilisateur
  async findAllByUser(userId: string): Promise<Workspace[]> {
    const memberships = await this.workspaceMemberRepository.find({
      where: { userId, status: WorkspaceMemberStatus.ACTIVE },
      relations: ['workspace'],
    });

    return memberships.map(membership => membership.workspace);
  }

  // Récupérer un workspace par ID
  async findOne(id: string, userId: string): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id },
      relations: ['members', 'members.user'],
    });

    if (!workspace) {
      throw new NotFoundException('Workspace non trouvé');
    }

    // Vérifier que l'utilisateur est membre
    const isMember = workspace.members.some(
      member => member.userId === userId && member.status === WorkspaceMemberStatus.ACTIVE
    );

    if (!isMember) {
      throw new ForbiddenException('Accès non autorisé à ce workspace');
    }

    return workspace;
  }

  // Mettre à jour un workspace
  async update(id: string, updateWorkspaceDto: UpdateWorkspaceDto, userId: string): Promise<Workspace> {
    const workspace = await this.findOne(id, userId);
    
    // Vérifier que l'utilisateur est admin ou owner
    const member = workspace.members.find(m => m.userId === userId);
    if (!member || ![WorkspaceMemberRole.OWNER, WorkspaceMemberRole.ADMIN].includes(member.role)) {
      throw new ForbiddenException('Permissions insuffisantes');
    }

    Object.assign(workspace, updateWorkspaceDto);
    return await this.workspaceRepository.save(workspace);
  }

  // Supprimer un workspace
  async remove(id: string, userId: string): Promise<void> {
    const workspace = await this.findOne(id, userId);
    
    // Seul l'owner peut supprimer le workspace
    const member = workspace.members.find(m => m.userId === userId);
    if (!member || member.role !== WorkspaceMemberRole.OWNER) {
      throw new ForbiddenException('Seul le propriétaire peut supprimer le workspace');
    }

    await this.workspaceRepository.remove(workspace);
  }

  // Inviter un membre
  async inviteMember(workspaceId: string, inviteMemberDto: InviteMemberDto, userId: string): Promise<WorkspaceInvitation> {
    const workspace = await this.findOne(workspaceId, userId);
    
    // Vérifier les permissions
    const member = workspace.members.find(m => m.userId === userId);
    if (!member || ![WorkspaceMemberRole.OWNER, WorkspaceMemberRole.ADMIN].includes(member.role)) {
      throw new ForbiddenException('Permissions insuffisantes pour inviter des membres');
    }

    // Vérifier si l'utilisateur est déjà membre
    const existingMember = workspace.members.find(m => m.user.email === inviteMemberDto.email);
    if (existingMember) {
      throw new ForbiddenException('Cet utilisateur est déjà membre du workspace');
    }

    // Créer l'invitation
    const invitation = this.workspaceInvitationRepository.create({
      workspaceId,
      email: inviteMemberDto.email,
      role: inviteMemberDto.role,
      invitedBy: userId,
      token: this.generateInvitationToken(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
    });

    return await this.workspaceInvitationRepository.save(invitation);
  }

  // Accepter une invitation
  async acceptInvitation(token: string, userId: string): Promise<WorkspaceMember> {
    const invitation = await this.workspaceInvitationRepository.findOne({
      where: { token, status: WorkspaceInvitationStatus.PENDING },
      relations: ['workspace'],
    });

    if (!invitation) {
      throw new NotFoundException('Invitation invalide ou expirée');
    }

    if (invitation.expiresAt < new Date()) {
      await this.workspaceInvitationRepository.update(token, { status: WorkspaceInvitationStatus.EXPIRED });
      throw new ForbiddenException('Invitation expirée');
    }

    // Créer le membership
    const membership = this.workspaceMemberRepository.create({
      workspaceId: invitation.workspaceId,
      userId,
      role: invitation.role,
      status: WorkspaceMemberStatus.ACTIVE,
      acceptedAt: new Date(),
    });

    // Marquer l'invitation comme acceptée
    await this.workspaceInvitationRepository.update(token, { status: WorkspaceInvitationStatus.ACCEPTED });

    return await this.workspaceMemberRepository.save(membership);
  }

  // Mettre à jour le rôle d'un membre
  async updateMemberRole(workspaceId: string, memberId: string, updateRoleDto: UpdateMemberRoleDto, userId: string): Promise<WorkspaceMember> {
    const workspace = await this.findOne(workspaceId, userId);
    
    // Vérifier les permissions
    const currentMember = workspace.members.find(m => m.userId === userId);
    if (!currentMember || ![WorkspaceMemberRole.OWNER, WorkspaceMemberRole.ADMIN].includes(currentMember.role)) {
      throw new ForbiddenException('Permissions insuffisantes');
    }

    const member = await this.workspaceMemberRepository.findOne({
      where: { id: memberId, workspaceId },
    });

    if (!member) {
      throw new NotFoundException('Membre non trouvé');
    }

    // Seul l'owner peut promouvoir en admin ou rétrograder un admin
    if (updateRoleDto.role === WorkspaceMemberRole.ADMIN && currentMember.role !== WorkspaceMemberRole.OWNER) {
      throw new ForbiddenException('Seul le propriétaire peut promouvoir en admin');
    }

    member.role = updateRoleDto.role;
    return await this.workspaceMemberRepository.save(member);
  }

  // Retirer un membre
  async removeMember(workspaceId: string, memberId: string, userId: string): Promise<void> {
    const workspace = await this.findOne(workspaceId, userId);
    
    // Vérifier les permissions
    const currentMember = workspace.members.find(m => m.userId === userId);
    if (!currentMember || ![WorkspaceMemberRole.OWNER, WorkspaceMemberRole.ADMIN].includes(currentMember.role)) {
      throw new ForbiddenException('Permissions insuffisantes');
    }

    const member = await this.workspaceMemberRepository.findOne({
      where: { id: memberId, workspaceId },
    });

    if (!member) {
      throw new NotFoundException('Membre non trouvé');
    }

    // Un admin ne peut pas retirer un autre admin (seul l'owner peut)
    if (member.role === WorkspaceMemberRole.ADMIN && currentMember.role !== WorkspaceMemberRole.OWNER) {
      throw new ForbiddenException('Seul le propriétaire peut retirer un admin');
    }

    // Un membre ne peut pas se retirer lui-même (doit quitter)
    if (member.userId === userId) {
      throw new ForbiddenException('Utilisez la fonction "Quitter le workspace" pour vous retirer');
    }

    await this.workspaceMemberRepository.remove(member);
  }

  // Quitter un workspace
  async leaveWorkspace(workspaceId: string, userId: string): Promise<void> {
    const workspace = await this.findOne(workspaceId, userId);
    
    const member = workspace.members.find(m => m.userId === userId);
    if (!member) {
      throw new NotFoundException('Membre non trouvé');
    }

    // L'owner ne peut pas quitter le workspace (doit le supprimer ou transférer la propriété)
    if (member.role === WorkspaceMemberRole.OWNER) {
      throw new ForbiddenException('Le propriétaire ne peut pas quitter le workspace. Transférez la propriété ou supprimez le workspace.');
    }

    await this.workspaceMemberRepository.remove(member);
  }

  // Utilitaires privés
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private generateInvitationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
} 
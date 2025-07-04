import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Workspace } from './workspace.entity';
import { User } from '../../users/entities/user.entity';
import { WorkspaceMemberRole } from './workspace-member.entity';

export enum WorkspaceInvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

@Entity('workspace_invitations')
export class WorkspaceInvitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'workspace_id' })
  workspaceId: string;

  @Column()
  email: string;

  @Column({ 
    type: 'enum', 
    enum: WorkspaceMemberRole,
    default: WorkspaceMemberRole.MEMBER 
  })
  role: WorkspaceMemberRole;

  @Column({ name: 'invited_by' })
  invitedBy: string;

  @Column({ unique: true })
  token: string;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({ 
    type: 'enum', 
    enum: WorkspaceInvitationStatus,
    default: WorkspaceInvitationStatus.PENDING 
  })
  status: WorkspaceInvitationStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Workspace, workspace => workspace.invitations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invited_by' })
  invitedByUser: User;
} 
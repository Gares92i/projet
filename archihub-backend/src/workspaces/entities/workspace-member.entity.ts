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

export enum WorkspaceMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer'
}

export enum WorkspaceMemberStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DECLINED = 'declined'
}

@Entity('workspace_members')
export class WorkspaceMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'workspace_id' })
  workspaceId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ 
    type: 'enum', 
    enum: WorkspaceMemberRole,
    default: WorkspaceMemberRole.MEMBER 
  })
  role: WorkspaceMemberRole;

  @Column({ type: 'jsonb', default: {} })
  permissions: Record<string, any>;

  @Column({ name: 'invited_by', nullable: true })
  invitedBy: string;

  @Column({ name: 'invited_at', nullable: true })
  invitedAt: Date;

  @Column({ name: 'accepted_at', nullable: true })
  acceptedAt: Date;

  @Column({ 
    type: 'enum', 
    enum: WorkspaceMemberStatus,
    default: WorkspaceMemberStatus.PENDING 
  })
  status: WorkspaceMemberStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Workspace, workspace => workspace.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
} 
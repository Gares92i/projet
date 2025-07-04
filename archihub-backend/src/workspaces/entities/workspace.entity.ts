import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WorkspaceMember } from './workspace-member.entity';
import { WorkspaceInvitation } from './workspace-invitation.entity';
import { Project } from '../../projects/entities/project.entity';
import { Client } from '../../clients/entities/client.entity';
import { TeamMember } from '../../teams/entities/team-member.entity';

export enum WorkspaceSubscriptionPlan {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

export enum WorkspaceSubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled'
}

@Entity('workspaces')
export class Workspace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ unique: true })
  slug: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl: string;

  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, any>;

  @Column({ 
    name: 'subscription_plan', 
    type: 'enum', 
    enum: WorkspaceSubscriptionPlan,
    default: WorkspaceSubscriptionPlan.FREE 
  })
  subscriptionPlan: WorkspaceSubscriptionPlan;

  @Column({ 
    name: 'subscription_status', 
    type: 'enum', 
    enum: WorkspaceSubscriptionStatus,
    default: WorkspaceSubscriptionStatus.ACTIVE 
  })
  subscriptionStatus: WorkspaceSubscriptionStatus;

  @Column({ name: 'created_by_user_id' })
  createdByUserId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => WorkspaceMember, member => member.workspace)
  members: WorkspaceMember[];

  @OneToMany(() => WorkspaceInvitation, invitation => invitation.workspace)
  invitations: WorkspaceInvitation[];

  @OneToMany(() => Project, project => project.workspace)
  projects: Project[];

  @OneToMany(() => Client, client => client.workspace)
  clients: Client[];

  @OneToMany(() => TeamMember, teamMember => teamMember.workspace)
  teamMembers: TeamMember[];
} 
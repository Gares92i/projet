import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UsersClerk } from '../../users/entities/users_clerk.entity';

@Entity('company_settings')
export class CompanySettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @ManyToOne(() => UsersClerk, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: UsersClerk;

  @Column({ name: 'company_name', length: 255 })
  companyName: string;

  @Column({ length: 255, nullable: true })
  address: string;

  @Column({ name: 'logo_url', length: 255, nullable: true })
  logoUrl: string;

  @Column({ name: 'subscription_plan', length: 50, nullable: true })
  subscriptionPlan: string;

  @Column({ name: 'subscription_status', length: 50, nullable: true })
  subscriptionStatus: string;

  @Column({ name: 'max_members_allowed', type: 'int', nullable: true })
  maxMembersAllowed: number;

  @Column({ name: 'default_user_role', length: 50, nullable: true })
  defaultUserRole: string;

  @Column({ type: 'jsonb', nullable: true })
  branding: any;

  @Column({ type: 'jsonb', nullable: true })
  architectInfo: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 
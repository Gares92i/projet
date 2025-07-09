import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UsersClerk } from '../../users/entities/users_clerk.entity';

@Entity('agency_members')
export class AgencyMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => UsersClerk, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UsersClerk;

  @Column({ name: 'owner_id', type: 'varchar' })
  ownerId: string;

  @Column({ length: 50, default: 'member' })
  role: string;

  @Column({ length: 20, default: 'active' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
} 
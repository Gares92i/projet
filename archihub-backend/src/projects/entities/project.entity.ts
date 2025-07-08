import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UsersClerk } from '../../users/entities/users_clerk.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'client_id', nullable: true })
  clientId: string;

  @Column({ nullable: true })
  location: string;

  @Column({ name: 'start_date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true, default: 0 })
  progress: number;

  @Column({ name: 'project_type', nullable: true })
  projectType: string;

  @Column({ name: 'project_area', nullable: true })
  projectArea: number;

  @Column({ name: 'room_count', nullable: true })
  roomCount: number;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ name: 'created_by_user_id', nullable: true })
  createdByUserId: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'owner_id', nullable: true })
  ownerId: string;

  @ManyToOne(() => UsersClerk, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'owner_id' })
  owner: UsersClerk;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
}

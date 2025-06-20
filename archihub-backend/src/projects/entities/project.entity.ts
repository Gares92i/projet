import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { User } from '../../users/entities/user.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true, name: 'client_id' })
  clientId: string;

  @ManyToOne(() => Client, (client) => client.projects, { nullable: true })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ nullable: true, type: 'text' })
  location: string;

  @Column({ nullable: true, name: 'start_date' })
  startDate: Date;

  @Column({ nullable: true, name: 'end_date' })
  endDate: Date;

  @Column({ nullable: true, length: 50 })
  status: string;

  @Column({ nullable: true, default: 0 })
  progress: number;

  @Column({ nullable: true, name: 'project_type', length: 100 })
  projectType: string;

  @Column({
    nullable: true,
    name: 'project_area',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  projectArea: number;

  @Column({ nullable: true, name: 'room_count' })
  roomCount: number;

  @Column({ nullable: true, name: 'image_url', type: 'text' })
  imageUrl: string;

  @Column({ nullable: true, name: 'created_by_user_id' })
  createdByUserId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_user_id' })
  createdByUser: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

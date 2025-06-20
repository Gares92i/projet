import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { User } from '../../users/entities/user.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ nullable: true, name: 'report_number', length: 100 })
  reportNumber: string;

  @Column({ name: 'visit_date' })
  visitDate: Date;

  @Column({ nullable: true, length: 255 })
  contractor: string;

  @Column({ nullable: true, length: 255 })
  inCharge: string;

  @Column({ nullable: true })
  progress: number;

  @Column({ nullable: true, type: 'text' })
  weather: string;

  @Column({ nullable: true, type: 'jsonb' })
  participants: any;

  @Column({ nullable: true, type: 'jsonb' })
  observations: any;

  @Column({ nullable: true, type: 'jsonb' })
  recommendations: any;

  @Column({ nullable: true, type: 'jsonb' })
  reserves: any;

  @Column({ nullable: true, name: 'additional_details', type: 'text' })
  additionalDetails: string;

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

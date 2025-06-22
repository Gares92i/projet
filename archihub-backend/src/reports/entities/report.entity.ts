import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @Column({ name: 'report_number', nullable: true })
  reportNumber: string;

  @Column({ name: 'visit_date' })
  visitDate: Date;

  @Column({ nullable: true })
  contractor: string;

  @Column({ name: 'in_charge', nullable: true })
  inCharge: string;

  @Column({ nullable: true })
  progress: number;

  @Column({ nullable: true })
  weather: string;

  @Column({ nullable: true, type: 'jsonb' })
  participants: any;

  @Column({ nullable: true, type: 'jsonb' })
  observations: any;

  @Column({ nullable: true, type: 'jsonb' })
  recommendations: any;

  @Column({ nullable: true, type: 'jsonb' })
  reserves: any;

  @Column({ name: 'additional_details', nullable: true })
  additionalDetails: string;

  @Column({ name: 'created_by_user_id', nullable: true })
  createdByUserId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

}

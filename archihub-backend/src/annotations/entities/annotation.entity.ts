import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('annotations')
export class Annotation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'document_id' })
  documentId: string;

  @Column({ name: 'created_by_user_id', nullable: true })
  createdByUserId: string;

  @Column({ type: 'jsonb' })
  position: any;

  @Column({ nullable: true })
  comment: string;

  @Column({ nullable: true, default: 'comment' })
  type: string;

  @Column({ name: 'is_resolved', nullable: true, default: false })
  isResolved: boolean;

  @Column({ name: 'resolved_at', nullable: true })
  resolvedAt: Date;

  @Column({ name: 'resolved_by_user_id', nullable: true })
  resolvedByUserId: string;

  @Column({ nullable: true, type: 'jsonb' })
  photos: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

}

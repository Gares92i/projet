import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @Column()
  name: string;

  @Column({ name: 'file_type', nullable: true })
  fileType: string;

  @Column({ name: 'storage_url' })
  storageUrl: string;

  @Column({ name: 'uploaded_by_user_id', nullable: true })
  uploadedByUserId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

}

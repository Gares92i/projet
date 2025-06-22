import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('report_photos')
export class ReportPhoto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'report_id' })
  reportId: string;

  @Column({ name: 'photo_url' })
  photoUrl: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'taken_at', nullable: true })
  takenAt: Date;

  @Column({ name: 'uploaded_at', nullable: true })
  uploadedAt: Date;

}

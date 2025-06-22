import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('descriptifs')
export class Descriptif {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @Column({ name: 'lot_name' })
  lotName: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  budget: number;

  @Column({ nullable: true, type: 'jsonb' })
  travaux: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

}

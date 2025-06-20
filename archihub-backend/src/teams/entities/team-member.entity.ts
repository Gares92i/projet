import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('team_members')
export class TeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_clerk_id', nullable: true })
  userClerkId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_clerk_id' })
  userClerk: User;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true, length: 100 })
  role: string;

  @Column({ nullable: true, length: 50, default: 'active' })
  status: string;

  @Column({ nullable: true, name: 'avatar_url', type: 'text' })
  avatarUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

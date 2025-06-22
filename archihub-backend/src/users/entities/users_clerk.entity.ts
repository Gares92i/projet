import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users_clerk')
export class UsersClerk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'clerk_user_id' })
  clerkUserId: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

}

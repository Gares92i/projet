import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users_clerk')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'clerkId', unique: true }) // Nom correct de la colonne
  clerkId: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  profileImageUrl: string;

  @Column({ type: 'text', default: '[]' })
  roles: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

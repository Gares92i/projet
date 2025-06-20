import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByClerkId(clerkUserId: string): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({
        where: { clerkUserId },
      });

      if (!user) {
        throw new NotFoundException(`Utilisateur avec l'ID Clerk ${clerkUserId} non trouvé`);
      }

      return user;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la recherche de l'utilisateur par ID Clerk: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findById(id: string): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
      }

      return user;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la recherche de l'utilisateur par ID: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async create(user: Partial<User>): Promise<User> {
    try {
      const newUser = this.usersRepository.create(user);
      return await this.usersRepository.save(newUser);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la création de l'utilisateur: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOrCreate(clerkUser: { id: string; email?: string; name?: string }): Promise<User> {
    try {
      let user = await this.usersRepository.findOne({
        where: { clerkUserId: clerkUser.id },
      });

      if (!user) {
        user = await this.create({
          clerkUserId: clerkUser.id,
          email: clerkUser.email,
          name: clerkUser.name,
        });
      }

      return user;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la recherche ou création de l'utilisateur: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}

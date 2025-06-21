import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  /**
   * Trouver un utilisateur par son ID Clerk
   */
  async findByClerkId(clerkId: string): Promise<User | null> {
    try {
      return await this.usersRepository.findOne({ where: { clerkId } });
    } catch (error) {
      this.logger.error(
        `Erreur lors de la recherche de l'utilisateur par clerkId: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Créer un utilisateur à partir des informations Clerk
   */
  async createFromClerk(clerkId: string): Promise<User> {
    try {
      const secretKey = this.configService.get<string>('CLERK_SECRET_KEY');

      // Utiliser l'API REST de Clerk
      const response = await axios.get(`https://api.clerk.com/v1/users/${clerkId}`, {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      });

      const clerkUser = response.data;

      // Créer l'utilisateur dans notre base de données
      const user = new User();
      user.clerkId = clerkId;
      user.email = clerkUser.email_addresses?.[0]?.email_address || '';
      user.firstName = clerkUser.first_name || '';
      user.lastName = clerkUser.last_name || '';
      user.profileImageUrl = clerkUser.image_url || '';
      user.roles = ['user'];

      return await this.usersRepository.save(user);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la création de l'utilisateur depuis Clerk: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Mettre à jour un utilisateur
   */
  async update(id: string, updateData: Partial<User>): Promise<User | null> {
    try {
      await this.usersRepository.update(id, updateData);
      return this.usersRepository.findOne({ where: { id } });
    } catch (error) {
      this.logger.error(
        `Erreur lors de la mise à jour de l'utilisateur: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Attribuer un rôle à un utilisateur
   */
  async assignRole(userId: string, role: string): Promise<User | null> {
    try {
      const user = await this.usersRepository.findOne({ where: { id: userId } });

      if (!user) {
        throw new Error(`Utilisateur avec ID ${userId} non trouvé`);
      }

      if (!user.roles.includes(role)) {
        user.roles.push(role);
        return await this.usersRepository.save(user);
      }

      return user;
    } catch (error) {
      this.logger.error(`Erreur lors de l'attribution du rôle: ${error.message}`, error.stack);
      throw error;
    }
  }
}

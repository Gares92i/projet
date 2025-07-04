import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Trouver un utilisateur par son ID Clerk
   */
  async findByClerkId(clerkUserId: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({ where: { clerkUserId } });
    } catch (error) {
      this.logger.error(
        `Erreur lors de la recherche de l'utilisateur par clerkUserId: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  /**
   * Créer ou trouver un utilisateur par son ID Clerk
   */
  async findOrCreateByClerkId(clerkUserId: string): Promise<User | null> {
    if (!clerkUserId || clerkUserId === 'guest') {
      this.logger.warn(`Tentative de création/recherche d'un utilisateur Clerk sans ID valide: ${clerkUserId}`);
      return null;
    }
    try {
      let user = await this.findByClerkId(clerkUserId);

      if (!user) {
        this.logger.log(`Création d'un nouvel utilisateur pour clerkUserId: ${clerkUserId}`);
        user = this.userRepository.create({
          clerkUserId,
          roles: JSON.stringify(['user']),
        });
        await this.userRepository.save(user);
      }

      return user;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la création ou de la recherche de l'utilisateur: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Synchroniser un utilisateur à partir des données de Clerk
   */
  async syncUserFromClerk(clerkUserId: string, userProfile: any): Promise<User> {
    let user = await this.findByClerkId(clerkUserId);

    if (!user) {
      user = this.userRepository.create({
        clerkUserId,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.emailAddresses?.[0]?.emailAddress || userProfile.email,
        profileImageUrl: userProfile.imageUrl || userProfile.profileImageUrl,
        roles: JSON.stringify(['user']),
      });
    } else {
      // Mettre à jour les informations existantes
      user.firstName = userProfile.firstName;
      user.lastName = userProfile.lastName;
      user.email = userProfile.emailAddresses?.[0]?.emailAddress || userProfile.email;
      user.profileImageUrl = userProfile.imageUrl || userProfile.profileImageUrl;
      // etc.
    }

    return this.userRepository.save(user);
  }

  /**
   * Trouver un utilisateur par son ID
   */
  async findById(id: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({ where: { id } });
    } catch (error) {
      this.logger.error(`Erreur lors de la recherche de l'utilisateur par ID: ${error.message}`);
      return null;
    }
  }
}

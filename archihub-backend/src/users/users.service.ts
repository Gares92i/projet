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
  async findByClerkId(clerkId: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({ where: { clerkId } });
    } catch (error) {
      this.logger.error(
        `Erreur lors de la recherche de l'utilisateur par clerkId: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  /**
   * Créer ou trouver un utilisateur par son ID Clerk
   */
  async findOrCreateByClerkId(clerkId: string): Promise<User> {
    try {
      let user = await this.findByClerkId(clerkId);

      if (!user) {
        this.logger.log(`Création d'un nouvel utilisateur pour clerkId: ${clerkId}`);
        user = this.userRepository.create({
          clerkId,
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
  async syncUserFromClerk(clerkId: string, userProfile: any): Promise<User> {
    let user = await this.findByClerkId(clerkId);

    if (!user) {
      user = this.userRepository.create({
        clerkId,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.emailAddresses[0]?.emailAddress,
        profileImageUrl: userProfile.imageUrl,
        roles: JSON.stringify(['user']),
      });
    } else {
      // Mettre à jour les informations existantes
      user.firstName = userProfile.firstName;
      user.lastName = userProfile.lastName;
      user.email = userProfile.emailAddresses[0]?.emailAddress;
      user.profileImageUrl = userProfile.imageUrl;
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

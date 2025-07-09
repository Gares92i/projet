import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);

  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto, userId?: string): Promise<Client> {
    try {
      const client = this.clientsRepository.create({
        ...createClientDto,
        createdByUserId: userId,
      });
      return await this.clientsRepository.save(client);
    } catch (error) {
      this.logger.error(`Erreur lors de la création du client: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(userId?: string): Promise<Client[]> {
    try {
      const query = this.clientsRepository
        .createQueryBuilder('client')
        // .leftJoinAndSelect('client.projects', 'projects')
        .orderBy('client.name', 'ASC');

      // Si un userId est fourni, filtrer par ce userId
      if (userId) {
        query.where('client.created_by_user_id = :userId', { userId });
      }

      return await query.getMany();
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des clients: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOne(id: string): Promise<Client> {
    try {
      const client = await this.clientsRepository.findOne({
        where: { id },
        // relations: ['projects'],
      });

      if (!client) {
        throw new NotFoundException(`Client avec ID ${id} non trouvé`);
      }

      return client;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération du client: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    try {
      const client = await this.findOne(id);

      // Mettre à jour les propriétés du client
      Object.assign(client, updateClientDto);

      return await this.clientsRepository.save(client);
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour du client: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const client = await this.findOne(id);
      await this.clientsRepository.remove(client);
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression du client: ${error.message}`, error.stack);
      throw error;
    }
  }

  async search(query: string, userId?: string): Promise<Client[]> {
    try {
      const queryBuilder = this.clientsRepository
        .createQueryBuilder('client')
        .where(
          'client.name ILIKE :query OR client.company_name ILIKE :query OR client.email ILIKE :query',
          { query: `%${query}%` },
        );

      // Si un userId est fourni, filtrer par ce userId
      if (userId) {
        queryBuilder.andWhere('client.created_by_user_id = :userId', { userId });
      }

      return await queryBuilder.getMany();
    } catch (error) {
      this.logger.error(`Erreur lors de la recherche de clients: ${error.message}`, error.stack);
      throw error;
    }
  }
}

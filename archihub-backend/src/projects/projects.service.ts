import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: string): Promise<Project> {
    try {
      // Ne pas utiliser l'ID Clerk directement, enlevez le createdByUserId pour l'instant
      const project = this.projectRepository.create({
        ...createProjectDto,
        // createdByUserId: userId, // Commentez cette ligne
      });

      const savedProject = await this.projectRepository.save(project);

      // Invalider le cache
      await this.cacheManager.del(`projects_all_${userId}`);

      return savedProject;
    } catch (error) {
      this.logger.error(`Erreur lors de la création du projet: ${error.message}`);
      throw new InternalServerErrorException(
        `Erreur lors de la création du projet: ${error.message}`,
      );
    }
  }

  async findAll(userId?: string): Promise<Project[]> {
    try {
      let cacheKey = 'projects_all';
      if (userId) {
        cacheKey = `projects_all_${userId}`;
      }

      // Vérifier le cache
      const cachedProjects = await this.cacheManager.get<Project[]>(cacheKey);
      if (cachedProjects) {
        return cachedProjects;
      }

      // Construire la requête
      const queryBuilder = this.projectRepository.createQueryBuilder('project');

      // Commenter temporairement cette partie pour tester sans filtre utilisateur
      // if (userId) {
      //   queryBuilder.where('project.created_by_user_id = :userId', { userId });
      // }

      const projects = await queryBuilder.getMany();

      // Mettre en cache
      await this.cacheManager.set(cacheKey, projects, 300);

      return projects;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des projets: ${error.message}`);
      throw new InternalServerErrorException(
        `Erreur lors de la récupération des projets: ${error.message}`,
      );
    }
  }

  async findOne(id: string): Promise<Project> {
    try {
      const project = await this.projectRepository.findOne({ where: { id } });

      if (!project) {
        throw new NotFoundException(`Projet avec ID ${id} non trouvé`);
      }

      return project;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Erreur lors de la récupération du projet: ${error.message}`);
      throw new InternalServerErrorException(
        `Erreur lors de la récupération du projet: ${error.message}`,
      );
    }
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    try {
      const project = await this.findOne(id);

      // Mettre à jour les propriétés
      Object.assign(project, updateProjectDto);

      const updatedProject = await this.projectRepository.save(project);

      // Invalider le cache
      await this.cacheManager.del(`projects_all`);
      await this.cacheManager.del(`projects_all_${project.createdByUserId}`); // Utiliser createdByUserId

      return updatedProject;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Erreur lors de la mise à jour du projet: ${error.message}`);
      throw new InternalServerErrorException(
        `Erreur lors de la mise à jour du projet: ${error.message}`,
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const project = await this.findOne(id);

      await this.projectRepository.remove(project);

      // Invalider le cache
      await this.cacheManager.del(`projects_all`);
      await this.cacheManager.del(`projects_all_${project.createdByUserId}`); // Utiliser createdByUserId
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Erreur lors de la suppression du projet: ${error.message}`);
      throw new InternalServerErrorException(
        `Erreur lors de la suppression du projet: ${error.message}`,
      );
    }
  }
}

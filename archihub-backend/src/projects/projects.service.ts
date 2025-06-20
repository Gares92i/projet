import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // Créer un nouveau projet
  async create(createProjectDto: CreateProjectDto, userId?: string): Promise<Project> {
    try {
      const project = this.projectsRepository.create({
        ...createProjectDto,
        createdByUserId: userId,
      });

      const savedProject = await this.projectsRepository.save(project);

      // Invalider le cache lorsqu'un projet est créé
      await this.cacheManager.del('all_projects');
      if (createProjectDto.clientId) {
        await this.cacheManager.del(`client_projects_${createProjectDto.clientId}`);
      }

      return savedProject;
    } catch (error) {
      this.logger.error(`Erreur lors de la création du projet: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Récupérer tous les projets
  async findAll(clientId?: string, userId?: string): Promise<Project[]> {
    try {
      // Clé de cache différente selon les paramètres
      const cacheKey = clientId
        ? `client_projects_${clientId}`
        : userId
          ? `user_projects_${userId}`
          : 'all_projects';

      // Essayer d'abord de récupérer du cache
      const cachedProjects = await this.cacheManager.get<Project[]>(cacheKey);
      if (cachedProjects) {
        return cachedProjects;
      }

      // Si pas dans le cache, requêter la base de données
      const query = this.projectsRepository
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.client', 'client')
        .orderBy('project.createdAt', 'DESC');

      if (clientId) {
        query.where('project.clientId = :clientId', { clientId });
      }

      if (userId) {
        query.andWhere('project.createdByUserId = :userId', { userId });
      }

      const projects = await query.getMany();

      // Mettre en cache pour les futures requêtes
      await this.cacheManager.set(cacheKey, projects);

      return projects;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des projets: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // Récupérer un projet spécifique par ID
  async findOne(id: string): Promise<Project> {
    try {
      // Clé de cache pour un projet spécifique
      const cacheKey = `project_${id}`;

      // Essayer d'abord de récupérer du cache
      const cachedProject = await this.cacheManager.get<Project>(cacheKey);
      if (cachedProject) {
        return cachedProject;
      }

      const project = await this.projectsRepository.findOne({
        where: { id },
        relations: ['client'],
      });

      if (!project) {
        throw new NotFoundException(`Projet avec ID ${id} non trouvé`);
      }

      // Mettre en cache pour les futures requêtes
      await this.cacheManager.set(cacheKey, project);

      return project;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération du projet: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Mettre à jour un projet existant
  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    try {
      const project = await this.findOne(id);
      Object.assign(project, updateProjectDto);

      const updatedProject = await this.projectsRepository.save(project);

      // Invalider les caches
      await this.cacheManager.del(`project_${id}`);
      await this.cacheManager.del('all_projects');
      if (project.clientId) {
        await this.cacheManager.del(`client_projects_${project.clientId}`);
      }
      if (updateProjectDto.clientId && updateProjectDto.clientId !== project.clientId) {
        await this.cacheManager.del(`client_projects_${updateProjectDto.clientId}`);
      }

      return updatedProject;
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour du projet: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Supprimer un projet
  async remove(id: string): Promise<void> {
    try {
      const project = await this.findOne(id);

      await this.projectsRepository.remove(project);

      // Invalider les caches
      await this.cacheManager.del(`project_${id}`);
      await this.cacheManager.del('all_projects');
      if (project.clientId) {
        await this.cacheManager.del(`client_projects_${project.clientId}`);
      }
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression du projet: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Méthode de test de connexion
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const count = await this.projectsRepository.count();
      return {
        success: true,
        message: `Connexion réussie! Nombre de projets: ${count}`,
      };
    } catch (error: unknown) {
      console.error('Erreur de connexion:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      return {
        success: false,
        message: `Erreur de connexion: ${errorMessage}`,
      };
    }
  }
}

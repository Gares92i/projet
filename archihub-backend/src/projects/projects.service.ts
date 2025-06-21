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

  async create(createProjectDto: CreateProjectDto, userId: string): Promise<Project> {
    const project = this.projectsRepository.create({
      ...createProjectDto,
      ownerId: userId,
    });

    const savedProject = await this.projectsRepository.save(project);

    // Invalidate cache when creating new project
    await this.cacheManager.del(`projects_all_${userId}`);
    if (createProjectDto.clientId) {
      await this.cacheManager.del(`projects_client_${createProjectDto.clientId}`);
    }

    return savedProject;
  }

  async findAll(clientId?: string, userId?: string): Promise<Project[]> {
    try {
      // Cache key based on parameters
      const cacheKey = clientId ? `projects_client_${clientId}` : `projects_all_${userId}`;

      // Try to get from cache first
      const cachedProjects = await this.cacheManager.get<Project[]>(cacheKey);
      if (cachedProjects) {
        this.logger.log(`Retrieved projects from cache (${cacheKey})`);
        return cachedProjects;
      }

      // Query construction
      const queryBuilder = this.projectsRepository.createQueryBuilder('project');

      // Filter by client if provided
      if (clientId) {
        queryBuilder.where('project.clientId = :clientId', { clientId });
      }

      // Filter by owner if provided
      if (userId) {
        if (clientId) {
          queryBuilder.andWhere('project.ownerId = :userId', { userId });
        } else {
          queryBuilder.where('project.ownerId = :userId', { userId });
        }
      }

      queryBuilder.orderBy('project.updatedAt', 'DESC');

      const projects = await queryBuilder.getMany();

      // Store in cache for 5 minutes
      await this.cacheManager.set(cacheKey, projects, 300000);

      return projects;
    } catch (error) {
      this.logger.error(`Error fetching projects: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string): Promise<Project> {
    try {
      const cacheKey = `project_${id}`;

      // Try to get from cache first
      const cachedProject = await this.cacheManager.get<Project>(cacheKey);
      if (cachedProject) {
        this.logger.log(`Retrieved project from cache (${cacheKey})`);
        return cachedProject;
      }

      const project = await this.projectsRepository.findOne({
        where: { id },
        relations: ['client'],
      });

      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      // Store in cache for 5 minutes
      await this.cacheManager.set(cacheKey, project, 300000);

      return project;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching project ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    try {
      const project = await this.findOne(id);

      // Update the project
      await this.projectsRepository.update(id, updateProjectDto);

      // Invalidate caches
      await this.cacheManager.del(`project_${id}`);
      await this.cacheManager.del(`projects_all_${project.ownerId}`);
      if (project.clientId) {
        await this.cacheManager.del(`projects_client_${project.clientId}`);
      }

      // Get updated project
      return this.findOne(id);
    } catch (error) {
      this.logger.error(`Error updating project ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      // Get project before deletion to invalidate caches
      const project = await this.findOne(id);

      const result = await this.projectsRepository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      // Invalidate caches
      await this.cacheManager.del(`project_${id}`);
      await this.cacheManager.del(`projects_all_${project.ownerId}`);
      if (project.clientId) {
        await this.cacheManager.del(`projects_client_${project.clientId}`);
      }
    } catch (error) {
      this.logger.error(`Error removing project ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
}

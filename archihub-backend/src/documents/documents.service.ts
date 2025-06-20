import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
  ) {}

  async create(createDocumentDto: CreateDocumentDto): Promise<Document> {
    try {
      const document = this.documentsRepository.create(createDocumentDto);
      return await this.documentsRepository.save(document);
    } catch (error) {
      this.logger.error(`Erreur lors de la création du document: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(projectId?: string): Promise<Document[]> {
    try {
      const query = this.documentsRepository
        .createQueryBuilder('document')
        .leftJoinAndSelect('document.project', 'project')
        .leftJoinAndSelect('document.uploadedByUser', 'user')
        .orderBy('document.createdAt', 'DESC');

      if (projectId) {
        query.where('document.projectId = :projectId', { projectId });
      }

      return await query.getMany();
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des documents: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOne(id: string): Promise<Document> {
    try {
      const document = await this.documentsRepository.findOne({
        where: { id },
        relations: ['project', 'uploadedByUser'],
      });

      if (!document) {
        throw new NotFoundException(`Document avec ID ${id} non trouvé`);
      }

      return document;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération du document: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto): Promise<Document> {
    try {
      const document = await this.findOne(id);
      Object.assign(document, updateDocumentDto);
      return await this.documentsRepository.save(document);
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour du document: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const document = await this.findOne(id);
      await this.documentsRepository.remove(document);
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression du document: ${error.message}`, error.stack);
      throw error;
    }
  }
}

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamMember } from './entities/team-member.entity';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(
    @InjectRepository(TeamMember)
    private teamMembersRepository: Repository<TeamMember>,
  ) {}

  async create(createTeamMemberDto: CreateTeamMemberDto): Promise<TeamMember> {
    try {
      const teamMember = this.teamMembersRepository.create(createTeamMemberDto);
      return await this.teamMembersRepository.save(teamMember);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la création du membre d'équipe: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findAll(): Promise<TeamMember[]> {
    try {
      return await this.teamMembersRepository.find({
        order: { name: 'ASC' },
        // relations: ['workspace'],
      });
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des membres d'équipe: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOne(id: string): Promise<TeamMember> {
    try {
      const teamMember = await this.teamMembersRepository.findOne({
        where: { id },
        // relations: ['workspace'],
      });

      if (!teamMember) {
        throw new NotFoundException(`Membre d'équipe avec ID ${id} non trouvé`);
      }

      return teamMember;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération du membre d'équipe: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async update(id: string, updateTeamMemberDto: UpdateTeamMemberDto): Promise<TeamMember> {
    try {
      const teamMember = await this.findOne(id);
      Object.assign(teamMember, updateTeamMemberDto);
      return await this.teamMembersRepository.save(teamMember);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la mise à jour du membre d'équipe: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const teamMember = await this.findOne(id);
      await this.teamMembersRepository.remove(teamMember);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la suppression du membre d'équipe: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}

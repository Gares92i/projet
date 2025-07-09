import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgencyMember } from './entities/agency-member.entity';
import { CreateAgencyMemberDto } from './dto/create-agency-member.dto';
import { UpdateAgencyMemberDto } from './dto/update-agency-member.dto';
import { CompanySettings } from '../settings/entities/company-settings.entity';

@Injectable()
export class AgencyMembersService {
  constructor(
    @InjectRepository(AgencyMember)
    private readonly agencyMembersRepository: Repository<AgencyMember>,
    @InjectRepository(CompanySettings)
    private readonly companySettingsRepository: Repository<CompanySettings>,
  ) {}

  async findAll(ownerId: string): Promise<AgencyMember[]> {
    return this.agencyMembersRepository.find({ where: { ownerId } });
  }

  async findOne(id: string, ownerId: string): Promise<AgencyMember> {
    const member = await this.agencyMembersRepository.findOne({ where: { id, ownerId } });
    if (!member) throw new NotFoundException('Membre non trouvé');
    return member;
  }

  async create(ownerId: string, dto: CreateAgencyMemberDto): Promise<AgencyMember> {
    // Vérification de la limite d'abonnement
    const settings = await this.companySettingsRepository.findOne({ where: { ownerId } });
    if (settings && settings.maxMembersAllowed) {
      const count = await this.agencyMembersRepository.count({ where: { ownerId } });
      if (count >= settings.maxMembersAllowed) {
        throw new ForbiddenException('Limite de membres atteinte pour votre abonnement.');
      }
    }
    const member = this.agencyMembersRepository.create({ ...dto, ownerId });
    return this.agencyMembersRepository.save(member);
  }

  async update(id: string, ownerId: string, dto: UpdateAgencyMemberDto): Promise<AgencyMember> {
    const member = await this.findOne(id, ownerId);
    Object.assign(member, dto);
    return this.agencyMembersRepository.save(member);
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const member = await this.findOne(id, ownerId);
    await this.agencyMembersRepository.remove(member);
  }
} 
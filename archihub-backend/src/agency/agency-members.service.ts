import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgencyMember } from './entities/agency-member.entity';
import { CreateAgencyMemberDto } from './dto/create-agency-member.dto';
import { UpdateAgencyMemberDto } from './dto/update-agency-member.dto';
import { CompanySettings } from '../settings/entities/company-settings.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AgencyMembersService {
  constructor(
    @InjectRepository(AgencyMember)
    private readonly agencyMembersRepository: Repository<AgencyMember>,
    @InjectRepository(CompanySettings)
    private readonly companySettingsRepository: Repository<CompanySettings>,
    private readonly usersService: UsersService,
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

  async findByUserId(clerkId: string): Promise<AgencyMember | null> {
    // On suppose que UsersService est injecté dans ce service
    // (sinon il faudra l'ajouter dans le constructeur)
    const user = await this.usersService.findByClerkId(clerkId);
    if (!user) return null;
    
    let agencyMember = await this.agencyMembersRepository.findOne({ where: { userId: user.id } });
    
    // Si aucun membre d'agence trouvé, en créer un automatiquement avec toutes les permissions
    if (!agencyMember) {
      console.log(`Aucun membre d'agence trouvé pour ${clerkId}, création automatique...`);
      agencyMember = await this.create(user.id, {
        userId: user.id,
        role: 'admin',
        status: 'active',
        permissions: {
          clients: true,
          projects: true,
          stats: true,
          documents: true
        }
      });
      console.log(`Membre d'agence créé automatiquement: ${agencyMember.id}`);
    }
    
    return agencyMember;
  }
} 
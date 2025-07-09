import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanySettings } from './entities/company-settings.entity';
import { CreateCompanySettingsDto } from './dto/create-company-settings.dto';
import { UpdateCompanySettingsDto } from './dto/update-company-settings.dto';

@Injectable()
export class CompanySettingsService {
  constructor(
    @InjectRepository(CompanySettings)
    private readonly companySettingsRepository: Repository<CompanySettings>,
  ) {}

  async findByOwnerId(ownerId: string): Promise<CompanySettings> {
    const settings = await this.companySettingsRepository.findOne({ where: { ownerId } });
    if (!settings) throw new NotFoundException('Paramètres agence non trouvés');
    return settings;
  }

  async create(ownerId: string, dto: CreateCompanySettingsDto): Promise<CompanySettings> {
    const settings = this.companySettingsRepository.create({ ...dto, ownerId });
    return this.companySettingsRepository.save(settings);
  }

  async update(ownerId: string, dto: UpdateCompanySettingsDto): Promise<CompanySettings> {
    const settings = await this.findByOwnerId(ownerId);
    Object.assign(settings, dto);
    return this.companySettingsRepository.save(settings);
  }

  async getArchitectInfo(ownerId: string): Promise<any> {
    const settings = await this.findByOwnerId(ownerId);
    return settings.architectInfo || {};
  }

  async updateArchitectInfo(ownerId: string, architectInfo: any): Promise<any> {
    const settings = await this.findByOwnerId(ownerId);
    settings.architectInfo = architectInfo;
    return this.companySettingsRepository.save(settings);
  }
} 
import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CompanySettingsService } from './company-settings.service';
import { CreateCompanySettingsDto } from './dto/create-company-settings.dto';
import { UpdateCompanySettingsDto } from './dto/update-company-settings.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('company-settings')
@UseGuards(AuthGuard)
export class CompanySettingsController {
  constructor(private readonly companySettingsService: CompanySettingsService) {}

  @Get('me')
  async getMySettings(@Request() req) {
    // ownerId = utilisateur connecté
    return this.companySettingsService.findByOwnerId(req.user.id);
  }

  @Post()
  async create(@Request() req, @Body() dto: CreateCompanySettingsDto) {
    return this.companySettingsService.create(req.user.id, dto);
  }

  @Put()
  async update(@Request() req, @Body() dto: UpdateCompanySettingsDto) {
    return this.companySettingsService.update(req.user.id, dto);
  }
} 
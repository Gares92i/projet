import { Controller, Get, Post, Put, Body, UseGuards, Request } from '@nestjs/common';
import { CompanySettingsService } from './company-settings.service';
import { CreateCompanySettingsDto } from './dto/create-company-settings.dto';
import { UpdateCompanySettingsDto } from './dto/update-company-settings.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RequestWithAuth } from '../types/express';

@Controller('company-settings')
@UseGuards(AuthGuard)
export class CompanySettingsController {
  constructor(private readonly companySettingsService: CompanySettingsService) {}

  @Get('me')
  async getMySettings(@Request() req: RequestWithAuth) {
    return this.companySettingsService.findByOwnerId(req.auth!.userId);
  }

  @Post()
  async create(@Request() req: RequestWithAuth, @Body() dto: CreateCompanySettingsDto) {
    return this.companySettingsService.create(req.auth!.userId, dto);
  }

  @Put()
  async update(@Request() req: RequestWithAuth, @Body() dto: UpdateCompanySettingsDto) {
    return this.companySettingsService.update(req.auth!.userId, dto);
  }
} 
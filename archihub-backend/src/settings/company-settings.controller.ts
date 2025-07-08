import { Controller, Get, Post, Put, Body, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
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
    if (!req.auth?.userId) throw new UnauthorizedException();
    return this.companySettingsService.findByOwnerId(req.auth.userId);
  }

  @Post()
  async create(@Request() req: RequestWithAuth, @Body() dto: CreateCompanySettingsDto) {
    if (!req.auth?.userId) throw new UnauthorizedException();
    return this.companySettingsService.create(req.auth.userId, dto);
  }

  @Put()
  async update(@Request() req: RequestWithAuth, @Body() dto: UpdateCompanySettingsDto) {
    if (!req.auth?.userId) throw new UnauthorizedException();
    return this.companySettingsService.update(req.auth.userId, dto);
  }
} 
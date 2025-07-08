import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { AgencyMembersService } from './agency-members.service';
import { CreateAgencyMemberDto } from './dto/create-agency-member.dto';
import { UpdateAgencyMemberDto } from './dto/update-agency-member.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { OwnerGuard } from '../auth/guards/owner.guard';
import { OwnerOnly } from '../auth/decorators/owner-only.decorator';
import { RequestWithAuth } from '../types/express';

@Controller('agency-members')
@UseGuards(AuthGuard)
export class AgencyMembersController {
  constructor(private readonly agencyMembersService: AgencyMembersService) {}

  @Get()
  async findAll(@Request() req: RequestWithAuth) {
    if (!req.auth?.userId) throw new UnauthorizedException();
    return this.agencyMembersService.findAll(req.auth.userId);
  }

  @Get(':id')
  async findOne(@Request() req: RequestWithAuth, @Param('id') id: string) {
    if (!req.auth?.userId) throw new UnauthorizedException();
    return this.agencyMembersService.findOne(id, req.auth.userId);
  }

  @Post()
  @UseGuards(OwnerGuard)
  @OwnerOnly()
  async create(@Request() req: RequestWithAuth, @Body() dto: CreateAgencyMemberDto) {
    if (!req.auth?.userId) throw new UnauthorizedException();
    return this.agencyMembersService.create(req.auth.userId, dto);
  }

  @Put(':id')
  @UseGuards(OwnerGuard)
  @OwnerOnly()
  async update(@Request() req: RequestWithAuth, @Param('id') id: string, @Body() dto: UpdateAgencyMemberDto) {
    if (!req.auth?.userId) throw new UnauthorizedException();
    return this.agencyMembersService.update(id, req.auth.userId, dto);
  }

  @Delete(':id')
  @UseGuards(OwnerGuard)
  @OwnerOnly()
  async remove(@Request() req: RequestWithAuth, @Param('id') id: string) {
    if (!req.auth?.userId) throw new UnauthorizedException();
    return this.agencyMembersService.remove(id, req.auth.userId);
  }
} 
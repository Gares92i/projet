import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgencyMember } from './entities/agency-member.entity';
import { AgencyMembersService } from './agency-members.service';
import { AgencyMembersController } from './agency-members.controller';
import { CompanySettings } from '../settings/entities/company-settings.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([AgencyMember, CompanySettings]), UsersModule],
  providers: [AgencyMembersService],
  controllers: [AgencyMembersController],
  exports: [AgencyMembersService],
})
export class AgencyMembersModule {} 
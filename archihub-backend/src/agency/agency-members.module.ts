import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgencyMember } from './entities/agency-member.entity';
import { AgencyMembersService } from './agency-members.service';
import { AgencyMembersController } from './agency-members.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AgencyMember])],
  providers: [AgencyMembersService],
  controllers: [AgencyMembersController],
  exports: [AgencyMembersService],
})
export class AgencyMembersModule {} 
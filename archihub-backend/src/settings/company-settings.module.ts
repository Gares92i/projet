import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanySettings } from './entities/company-settings.entity';
import { CompanySettingsService } from './company-settings.service';
import { CompanySettingsController } from './company-settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CompanySettings])],
  providers: [CompanySettingsService],
  controllers: [CompanySettingsController],
  exports: [CompanySettingsService],
})
export class CompanySettingsModule {} 
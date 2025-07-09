import { IsString, IsOptional, IsInt, IsObject } from 'class-validator';

export class CreateCompanySettingsDto {
  @IsString()
  companyName: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  subscriptionPlan?: string;

  @IsString()
  @IsOptional()
  subscriptionStatus?: string;

  @IsInt()
  @IsOptional()
  maxMembersAllowed?: number;

  @IsString()
  @IsOptional()
  defaultUserRole?: string;

  @IsObject()
  @IsOptional()
  branding?: any;

  architectInfo?: any;
} 
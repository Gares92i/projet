import { IsString, IsOptional, IsUUID, IsNumber, IsDate, IsObject, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReportDto {
  @IsUUID()
  projectId: string;

  @IsString()
  @IsOptional()
  reportNumber?: string;

  @IsDate()
  @Type(() => Date)
  visitDate: Date;

  @IsString()
  @IsOptional()
  contractor?: string;

  @IsString()
  @IsOptional()
  inCharge?: string;

  @IsNumber()
  @IsOptional()
  progress?: number;

  @IsString()
  @IsOptional()
  weather?: string;

  @IsObject()
  @IsOptional()
  participants?: any;

  @IsObject()
  @IsOptional()
  observations?: any;

  @IsObject()
  @IsOptional()
  recommendations?: any;

  @IsObject()
  @IsOptional()
  reserves?: any;

  @IsString()
  @IsOptional()
  additionalDetails?: string;

  @IsUUID()
  @IsOptional()
  createdByUserId?: string;
}

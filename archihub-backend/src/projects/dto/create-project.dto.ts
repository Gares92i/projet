import { IsString, IsOptional, IsNumber, IsUUID, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  progress?: number;

  @IsOptional()
  @IsString()
  projectType?: string;

  @IsOptional()
  @IsNumber()
  projectArea?: number;

  @IsOptional()
  @IsNumber()
  roomCount?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

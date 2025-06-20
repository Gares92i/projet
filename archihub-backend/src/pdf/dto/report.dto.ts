import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsObject,
  IsDateString,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ArchitectInfoDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;
}

export class ProjectDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  client?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class ParticipantDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  contact?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  presence?: string;
}

export class TaskProgressDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsNumber()
  @IsOptional()
  progress?: number;

  @IsString()
  @IsOptional()
  color?: string;

  @IsNumber()
  @IsOptional()
  number?: number;
}

export class ReserveDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  documentName?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  lot?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  createdAt?: string;

  @IsDateString()
  @IsOptional()
  resolvedAt?: string;

  @IsArray()
  @IsOptional()
  photos?: string[];

  @IsString()
  @IsOptional()
  annotationId?: string;
}

export class AnnotationDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsObject()
  @IsOptional()
  position?: { x: number; y: number };

  @IsNumber()
  @IsOptional()
  x?: number;

  @IsNumber()
  @IsOptional()
  y?: number;

  @IsBoolean()
  @IsOptional()
  resolved?: boolean;

  @IsBoolean()
  @IsOptional()
  isResolved?: boolean;
}

export class DocumentWithAnnotationsDto {
  @IsString()
  @IsOptional()
  documentName?: string;

  @IsString()
  @IsOptional()
  documentId?: string;

  @IsString()
  @IsOptional()
  documentUrl?: string;

  @IsString()
  @IsOptional()
  capturedImageUrl?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AnnotationDto)
  annotations?: AnnotationDto[];
}

export class ObservationDto {
  @IsString()
  @IsOptional()
  item?: string;

  @IsString()
  @IsOptional()
  observation?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;
}

export class RecommendationDto {
  @IsString()
  @IsOptional()
  item?: string;

  @IsString()
  @IsOptional()
  observation?: string;

  @IsString()
  @IsOptional()
  action?: string;

  @IsString()
  @IsOptional()
  responsible?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;
}

export class ReportDto {
  @IsString()
  @IsOptional()
  reportId?: string;

  @IsString()
  @IsOptional()
  reportNumber?: string;

  @IsDateString()
  @IsOptional()
  visitDate?: string;

  @IsString()
  @IsOptional()
  inCharge?: string;

  @IsString()
  @IsOptional()
  contractor?: string;

  @IsNumber()
  @IsOptional()
  progress?: number;

  @IsString()
  @IsOptional()
  additionalDetails?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => ProjectDto)
  project?: ProjectDto;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => ArchitectInfoDto)
  architectInfo?: ArchitectInfoDto;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  participants?: ParticipantDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TaskProgressDto)
  taskProgress?: TaskProgressDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ReserveDto)
  reserves?: ReserveDto[];

  @IsObject()
  @IsOptional()
  annotationsByDocument?: Record<string, DocumentWithAnnotationsDto>;

  @IsArray()
  @IsOptional()
  photos?: string[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ObservationDto)
  observations?: ObservationDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RecommendationDto)
  recommendations?: RecommendationDto[];

  @IsArray()
  @IsOptional()
  attachments?: string[];
}

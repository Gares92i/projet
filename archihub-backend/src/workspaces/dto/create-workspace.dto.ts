import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceSubscriptionPlan } from '../entities/workspace.entity';

export class CreateWorkspaceDto {
  @ApiProperty({ description: 'Nom du workspace' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description du workspace', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'URL du logo', required: false })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty({ description: 'Plan d\'abonnement', enum: WorkspaceSubscriptionPlan, default: WorkspaceSubscriptionPlan.FREE })
  @IsOptional()
  @IsEnum(WorkspaceSubscriptionPlan)
  subscriptionPlan?: WorkspaceSubscriptionPlan;
} 
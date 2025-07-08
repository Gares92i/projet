import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateAgencyMemberDto {
  @IsString()
  userId: string;

  @IsString()
  @IsOptional()
  @IsIn(['member', 'admin'])
  role?: string;

  @IsString()
  @IsOptional()
  @IsIn(['pending', 'active', 'revoked'])
  status?: string;
} 
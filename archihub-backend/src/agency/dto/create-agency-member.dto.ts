import { IsString, IsOptional, IsIn, IsEmail } from 'class-validator';

export class CreateAgencyMemberDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @IsIn(['member', 'admin'])
  role?: string;

  @IsString()
  @IsOptional()
  @IsIn(['pending', 'active', 'revoked'])
  status?: string;

  @IsOptional()
  permissions?: Record<string, boolean>;
} 
import { IsString, IsEmail, IsOptional, IsUUID } from 'class-validator';

export class CreateTeamMemberDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsUUID()
  @IsOptional()
  userClerkId?: string;
}

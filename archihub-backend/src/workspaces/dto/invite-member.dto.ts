import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceMemberRole } from '../entities/workspace-member.entity';

export class InviteMemberDto {
  @ApiProperty({ description: 'Email de l\'utilisateur à inviter' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Rôle dans le workspace', enum: WorkspaceMemberRole, default: WorkspaceMemberRole.MEMBER })
  @IsOptional()
  @IsEnum(WorkspaceMemberRole)
  role?: WorkspaceMemberRole = WorkspaceMemberRole.MEMBER;
}

export default InviteMemberDto; 
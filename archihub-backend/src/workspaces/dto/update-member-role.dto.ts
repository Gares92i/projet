import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceMemberRole } from '../entities/workspace-member.entity';

export class UpdateMemberRoleDto {
  @ApiProperty({ description: 'Nouveau rôle du membre', enum: WorkspaceMemberRole })
  @IsEnum(WorkspaceMemberRole)
  role: WorkspaceMemberRole;
}

export default UpdateMemberRoleDto; 
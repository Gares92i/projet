import { PartialType } from '@nestjs/mapped-types';
import { CreateAgencyMemberDto } from './create-agency-member.dto';

export class UpdateAgencyMemberDto extends PartialType(CreateAgencyMemberDto) {} 
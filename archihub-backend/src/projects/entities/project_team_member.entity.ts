import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('project_team_members')
export class ProjectTeamMember {
  @PrimaryColumn({ name: 'project_id' })
  projectId: string;

  @PrimaryColumn({ name: 'team_member_id' })
  teamMemberId: string;

  @Column({ name: 'role_in_project', nullable: true })
  roleInProject: string;
}

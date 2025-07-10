import { Injectable, NestMiddleware } from '@nestjs/common';
import { AgencyMembersService } from '../../agency/agency-members.service';

@Injectable()
export class AgencyMemberMiddleware implements NestMiddleware {
  constructor(private readonly agencyMembersService: AgencyMembersService) {}

  async use(req: any, res: any, next: any) {
    try {
      const userId = req.auth?.userId;
      console.log('userId pour agencyMember:', userId);
      if (userId && userId !== 'guest') {
        const agencyMember = await this.agencyMembersService.findByUserId(userId);
        if (agencyMember !== null) {
          console.log('agencyMember trouvé:', agencyMember);
          req.agencyMember = agencyMember;
        } else {
          console.log('Aucun agencyMember trouvé pour userId:', userId);
        }
      }
    } catch (error) {
      req.agencyMember = undefined;
    }
    next();
  }
} 
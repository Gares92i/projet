import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {}

  getPublicKey(): string {
    return this.configService.get<string>('CLERK_PUBLISHABLE_KEY') || '';
  }
}

import { Controller, Post, Body, Get, Param, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RequestWithAuth } from '../types/express';

// DTO pour la synchronisation des utilisateurs
export class SyncUserDto {
  clerkUserId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImageUrl?: string;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/sync')
  async syncUser(@Body() userDto: SyncUserDto) {
    return this.usersService.syncUserFromClerk(userDto.clerkUserId, userDto);
  }

  @UseGuards(AuthGuard)
  @Get('/me')
  async getCurrentUser(@Request() req: RequestWithAuth) {
    if (!req.auth?.userId) {
      return null;
    }
    return this.usersService.findByClerkId(req.auth.userId);
  }

  @Get('/:id')
  async getUserById(@Param('id') id: string) {
    // Utilisez findByClerkId ou findById selon ce qui est disponible dans votre service
    return this.usersService.findByClerkId(id);
    // Si vous avez besoin de rechercher par UUID interne, utilisez une autre méthode:
    // return this.usersService.findById(id);
  }
}

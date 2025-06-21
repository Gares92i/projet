import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserClerkEntity } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserClerkEntity])],
  // If you have controllers/services for this module, add them here
  // controllers: [UsersController],
  // providers: [UsersService],
})
export class UsersModule {}

import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from 'src/shared/schema/repositories/user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema, Users } from 'src/shared/schema/users';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  imports: [
    MongooseModule.forFeature([
      {
        name: Users.name,
        schema: UserSchema,
      },
    ]),
  ],
})
export class UsersModule {}

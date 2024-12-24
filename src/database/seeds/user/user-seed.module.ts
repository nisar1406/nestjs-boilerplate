import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserSchema } from '../../../model';
import { USERS } from '../../../utils/constants/model-names';
import { UserSeedService } from './user-seed.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: USERS,
        schema: UserSchema,
      },
    ]),
  ],
  providers: [UserSeedService],
  exports: [UserSeedService],
})
export class UserSeedModule {}

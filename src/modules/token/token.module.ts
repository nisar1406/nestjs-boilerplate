import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TokenSchema } from '../../model';
import { TOKENS } from '../../utils/constants/model-names';
import { TokenService } from './token.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TOKENS,
        schema: TokenSchema,
      },
    ]),
  ],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FileSchema } from '../../model/file.model';
import { FILES } from '../../utils/constants/model-names';
import { FileController } from './file.controller';
import { FileService } from './file.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: FILES,
        schema: FileSchema,
      },
    ]),
  ],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}

import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { AllConfigType } from '../../configs';
import { IFile } from '../../model/file.model';
import { FILES } from '../../utils/constants/model-names';
import { CreateFileDto } from './dto/create-file.dto';

@Injectable()
export class FileService {
  private readonly s3: S3Client;
  private readonly bucketName: string;

  constructor(
    @InjectModel(FILES) private readonly fileModel: Model<IFile>,
    private readonly configService: ConfigService<AllConfigType>,
  ) {
    this.s3 = new S3Client({
      region: this.configService.get<string>('file.awsS3Region', {
        infer: true,
      }),
      credentials: {
        accessKeyId: this.configService.get<string>('file.accessKeyId', {
          infer: true,
        }),
        secretAccessKey: this.configService.get<string>(
          'file.secretAccessKey',
          { infer: true },
        ),
      },
    });
    this.bucketName = this.configService.getOrThrow<string>(
      'file.awsDefaultS3Bucket',
      { infer: true },
    );
  }

  async create(createFileDto: CreateFileDto) {
    try {
      const key = `${uuidv4()}-${createFileDto.originalname}`;
      const upload = new Upload({
        client: this.s3,
        params: {
          Bucket: this.bucketName,
          Key: key,
          Body: createFileDto.buffer,
          ContentType: createFileDto.mimetype,
        },
      });
      await upload.done();
      return { key };
    } catch (error) {
      throw new Error(error);
    }
  }

  async remove(key: string) {
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
      return {
        message: 'File deleted successfully',
      };
    } catch (error) {
      throw new Error(error);
    }
  }
}

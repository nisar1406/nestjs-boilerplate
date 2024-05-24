import * as Joi from '@hapi/joi';
import { registerAs } from '@nestjs/config';

export enum FileDriver {
  LOCAL = 'local',
  S3 = 's3',
  S3_PRESIGNED = 's3-presigned',
}

export type FileConfig = {
  driver: FileDriver;
  accessKeyId?: string;
  secretAccessKey?: string;
  awsDefaultS3Bucket?: string;
  awsS3Region?: string;
  maxFileSize: number;
};

const FileConfigSchema = Joi.object({
  driver: Joi.string()
    .valid(FileDriver.LOCAL, FileDriver.S3, FileDriver.S3_PRESIGNED)
    .required(),
  accessKeyId: Joi.string().when('driver', {
    is: Joi.valid(FileDriver.S3, FileDriver.S3_PRESIGNED),
    then: Joi.required(),
  }),
  secretAccessKey: Joi.string().when('driver', {
    is: Joi.valid(FileDriver.S3, FileDriver.S3_PRESIGNED),
    then: Joi.required(),
  }),
  awsDefaultS3Bucket: Joi.string().when('driver', {
    is: Joi.valid(FileDriver.S3, FileDriver.S3_PRESIGNED),
    then: Joi.required(),
  }),
  awsS3Region: Joi.string().when('driver', {
    is: Joi.valid(FileDriver.S3, FileDriver.S3_PRESIGNED),
    then: Joi.required(),
  }),
  maxFileSize: Joi.number().required(),
});

const config = {
  driver:
    (process.env.FILE_DRIVER as FileDriver | undefined) ?? FileDriver.LOCAL,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_S3_SECRET_KEY,
  awsDefaultS3Bucket: process.env.AWS_DEFAULT_S3_BUCKET,
  awsS3Region: process.env.AWS_DEFAULT_S3_REGION,
  maxFileSize: 5242880, // 5mb
};

const { error, value } = FileConfigSchema.validate(config, {
  abortEarly: false,
});

if (error) {
  throw new Error(`File configuration validation error: ${error.message}`);
}

export default registerAs<FileConfig>('file', () => value);

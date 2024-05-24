import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class CreateFileDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  buffer: Buffer;

  @ApiProperty({ description: 'Original name of the file' })
  originalname: string;

  @ApiProperty({ description: 'MIME type of the file' })
  mimetype: string;
}

export const CreateFileSchema = Joi.object({
  buffer: Joi.binary().required().messages({
    'any.required': 'Buffer is required',
  }),
  originalname: Joi.string().required().messages({
    'any.required': 'Original name is required',
  }),
  mimetype: Joi.string().required().messages({
    'any.required': 'MIME type is required',
  }),
});

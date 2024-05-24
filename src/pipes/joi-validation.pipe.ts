import * as Joi from '@hapi/joi';
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ObjectSchema } from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(
    private readonly paramSchema: any | null = null,
    private readonly bodySchema: ObjectSchema | null = null,
  ) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'param') {
      const { error } = this.paramSchema.validate(value);
      if (error) {
        throw new JoiValidationException(error.details);
      }
      return value;
    } else if (metadata.type === 'body') {
      const { error } = this.bodySchema.validate(value);
      if (error) {
        throw new JoiValidationException(error.details);
      }
      return value;
    }
  }
}

export class JoiValidationException extends BadRequestException {
  constructor(public readonly details: Joi.ValidationErrorItem[]) {
    super('Validation failed');
  }
}

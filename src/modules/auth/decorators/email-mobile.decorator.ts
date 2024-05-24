import { ValidationOptions, registerDecorator } from 'class-validator';

import { IS_EMAIL_OR_MOBILE } from '../../../utils/constants/validation';

export function IsEmailOrMobile(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isEmailOrMobile',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const mobileRegex = /^\+?\d{1,3}[- ]?\d{3,}$/;
          return !!value && (emailRegex.test(value) || mobileRegex.test(value));
        },
        defaultMessage() {
          return IS_EMAIL_OR_MOBILE;
        },
      },
    });
  };
}

import * as Joi from 'joi';

export const createUserSchema = Joi.object({
  firstName: Joi.string()
    .required()
    .pattern(new RegExp('^[a-zA-Z]+$'))
    .messages({
      'any.required': 'First Name is required',
      'string.pattern.base': 'First Name must only contain letters',
    }),
  lastName: Joi.string()
    .required()
    .pattern(new RegExp('^[a-zA-Z]+$'))
    .messages({
      'any.required': 'Last Name is required',
      'string.pattern.base': 'Last Name must only contain letters',
    }),
  mobile: Joi.string().pattern(new RegExp('^[0-9]{10}$')).required().messages({
    'any.required': 'Mobile number is required',
    'string.pattern.base':
      'Mobile number must be 10 digits long and contain only numbers',
  }),
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Please enter a valid email address',
  }),
  password: Joi.string().required().min(6).messages({
    'any.required': 'Password is required',
    'string.min': 'Password must be at least 6 characters long',
  }),
});

export const idParamSchema = Joi.string().required().messages({
  'any.required': 'ID parameter is required',
  'string.base': 'ID must be a string',
});

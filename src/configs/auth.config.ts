import * as Joi from '@hapi/joi';
import { registerAs } from '@nestjs/config';

export type AuthConfig = {
  secret: string;
  expires: string;
  refreshSecret: string;
  refreshExpires: string;
  forgotSecret: string;
  forgotExpires: string;
  confirmEmailSecret: string;
  confirmEmailExpires: string;
};

// Define Joi schema
const AuthConfigSchema = Joi.object({
  secret: Joi.string().required(),
  expires: Joi.string().required(),
  refreshSecret: Joi.string().required(),
  refreshExpires: Joi.string().required(),
  forgotSecret: Joi.string().required(),
  forgotExpires: Joi.string().required(),
  confirmEmailSecret: Joi.string().required(),
  confirmEmailExpires: Joi.string().required(),
});

// Validate the configuration and throw if invalid
const config = {
  secret: process.env.JWT_ACCESS_SECRET,
  expires: process.env.JWT_ACCESS_EXPIRE,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  refreshExpires: process.env.JWT_REFRESH_EXPIRE,
  forgotSecret: process.env.JWT_FORGOT_SECRET,
  forgotExpires: process.env.JWT_FORGOT_TOKEN_EXPIRES_IN,
  confirmEmailSecret: process.env.JWT_CONFIRM_EMAIL_SECRET,
  confirmEmailExpires: process.env.JWT_CONFIRM_EMAIL_TOKEN_EXPIRES_IN,
};

const { error, value } = AuthConfigSchema.validate(config, {
  abortEarly: false,
});
if (error) {
  throw new Error(`Auth configuration validation error: ${error.message}`);
}

export default registerAs<AuthConfig>('auth', () => value);

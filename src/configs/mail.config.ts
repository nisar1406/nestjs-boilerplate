import * as Joi from '@hapi/joi';
import { registerAs } from '@nestjs/config';

export type MailConfig = {
  port: number;
  host: string;
  user: string;
  password: string;
  defaultEmail: string;
  defaultName: string;
  rejectUnauthorized: boolean;
  secure: boolean;
  requireTLS: boolean;
};

// Define Joi schema
const MailConfigSchema = Joi.object({
  port: Joi.number().required(),
  host: Joi.string().required(),
  user: Joi.string().email().required(),
  password: Joi.string().required(),
  defaultEmail: Joi.string().email().required(),
  defaultName: Joi.string().required(),
  rejectUnauthorized: Joi.boolean().default(false),
  secure: Joi.boolean().default(false),
  requireTLS: Joi.boolean().default(true),
});

// Validate the configuration and throw if invalid
const config = {
  port: parseInt(process.env.MAIL_PORT, 10),
  host: process.env.MAIL_HOST,
  user: process.env.MAIL_USER,
  password: process.env.MAIL_PASSWORD,
  defaultEmail: process.env.MAIL_DEFAULT_EMAIL,
  defaultName: process.env.MAIL_DEFAULT_NAME,
  rejectUnauthorized: process.env.MAIL_REJECT_UNAUTHORIZED === 'true',
  secure: process.env.MAIL_SECURE === 'true',
  requireTLS: process.env.MAIL_REQUIRE_TLS === 'true',
};

const { error, value } = MailConfigSchema.validate(config, {
  abortEarly: false,
});
if (error) {
  throw new Error(`Mail configuration validation error: ${error.message}`);
}

export default registerAs<MailConfig>('mail', () => value);

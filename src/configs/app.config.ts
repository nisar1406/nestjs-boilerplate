import * as Joi from '@hapi/joi';
import { registerAs } from '@nestjs/config';

export type AppConfig = {
  nodeEnv: string;
  name: string;
  workingDirectory: string;
  frontendDomain: string;
  backendDomain: string;
  port: number;
  apiPrefix: string;
  fallbackLanguage: string;
  headerLanguage: string;
};

// Define Joi schema
const AppConfigSchema = Joi.object({
  nodeEnv: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  name: Joi.string().default('NestJS BOILERPLATE'),
  workingDirectory: Joi.string().required(),
  frontendDomain: Joi.string().uri().required(),
  backendDomain: Joi.string().uri().required(),
  port: Joi.number().default(3001),
  apiPrefix: Joi.string().default('api'),
  fallbackLanguage: Joi.string().default('en'),
  headerLanguage: Joi.string().default('x-custom-lang'),
});

// Validate the configuration and throw if invalid
const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  name: process.env.APP_NAME || 'NestJS BOILERPLATE',
  workingDirectory: process.env.PWD,
  frontendDomain: process.env.FRONTEND_DOMAIN,
  backendDomain: process.env.BACKEND_DOMAIN,
  port: parseInt(process.env.PORT, 10) || 3001,
  apiPrefix: process.env.API_PREFIX || 'api',
  fallbackLanguage: process.env.FALLBACK_LANGUAGE || 'en',
  headerLanguage: process.env.HEADER_LANGUAGE || 'x-custom-lang',
};

const { error, value } = AppConfigSchema.validate(config, {
  abortEarly: false,
});
if (error) {
  throw new Error(`App configuration validation error: ${error.message}`);
}

export default registerAs<AppConfig>('app', () => value);

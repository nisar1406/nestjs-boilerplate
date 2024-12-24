import * as Joi from '@hapi/joi';
import { registerAs } from '@nestjs/config';

export type DatabaseConfig = {
  host: string;
  username: string;
  password: string;
  name: string;
  port: number;
};

// Define Joi schema
const DatabaseConfigSchema = Joi.object({
  host: Joi.string().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
  name: Joi.string().required(),
  port: Joi.number().default(5432),
});

// Validate the configuration and throw if invalid
const config = {
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  name: process.env.DATABASE_NAME,
  port: process.env.DATABASE_PORT
    ? parseInt(process.env.DATABASE_PORT, 10)
    : 5432,
};

const { error, value } = DatabaseConfigSchema.validate(config, {
  abortEarly: false,
});

if (error) {
  throw new Error(`Database configuration validation error: ${error.message}`);
}
export default registerAs<DatabaseConfig>('database', () => value);

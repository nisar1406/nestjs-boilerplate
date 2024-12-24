import { AppConfig } from './app.config';
import { AuthConfig } from './auth.config';
import { DatabaseConfig } from './database.config';
import { FileConfig } from './file.config';

export type AllConfigType = {
  app: AppConfig;
  auth: AuthConfig;
  database: DatabaseConfig;
  file: FileConfig;
};

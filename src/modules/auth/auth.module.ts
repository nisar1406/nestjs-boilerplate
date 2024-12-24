import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { TokenModule } from '../token/token.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    // ConfigModule to load environment variables
    ConfigModule,

    // Asynchronous JWT Module configuration
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('auth.secret'), // Use a specific key from the environment
        signOptions: {
          expiresIn: configService.getOrThrow<string>('auth.expires'), // Use a specific key for expiration time
        },
      }),
    }),

    // Custom modules for tokens, users, and mail services
    TokenModule,
    UsersModule,
  ],
  controllers: [AuthController], // Auth controller handles endpoints for authentication
  providers: [
    AuthService, // Main authentication service
    JwtStrategy, // JWT strategy for validating tokens
    GoogleStrategy,
  ],
  exports: [AuthService], // Export AuthService for use in other modules
})
export class AuthModule {}

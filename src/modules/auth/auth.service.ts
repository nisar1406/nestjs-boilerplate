import {
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as JWT from 'jsonwebtoken';

import { AllConfigType } from '../../../src/configs';
import { IUser, TokenType } from '../../model';
import { TokenService } from '../token/token.service';
import { UsersService } from '../users/users.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  private secret: string;
  private refreshSecret: string;
  private expires: string;
  private refreshExpires: string;

  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UsersService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {
    this.secret = configService.getOrThrow<string>('auth.secret', {
      infer: true,
    });
    this.refreshSecret = configService.getOrThrow<string>(
      'auth.refreshSecret',
      {
        infer: true,
      },
    );
    this.expires = configService.getOrThrow<string>('auth.expires', {
      infer: true,
    });
    this.refreshExpires = configService.getOrThrow<string>(
      'auth.refreshExpires',
      {
        infer: true,
      },
    );
  }

  async signUp(signUpDto: SignUpDto) {
    const candidate = await this.userService.findOneByEmail(signUpDto.email);

    if (candidate) return null;

    const hashedPassword = await bcrypt.hash(signUpDto.password, 7);
    const user = await this.userService.create({
      ...signUpDto,
      password: hashedPassword,
      name: `${signUpDto.firstName} ${signUpDto.lastName}`,
    });
    const tokens = await this.generateTokens(user.id);

    return tokens;
  }

  async signIn(signInDto: SignInDto) {
    const user: IUser = await this.validateUser(signInDto);

    const { accessToken, refreshToken } = await this.generateTokens(user.id);

    return { user, accessToken, refreshToken };
  }

  async validateUser(signInDto: SignInDto): Promise<IUser> {
    const user = await this.userService.findOneByEmail(signInDto.email);

    if (!user) {
      throw new NotFoundException(
        `There is no user with email: ${signInDto.email}`,
      );
    }

    const passwordEquals = await bcrypt.compare(
      signInDto.password,
      user.password,
    );

    if (passwordEquals) return user;

    throw new UnauthorizedException({ message: 'Incorrect password' });
  }

  verifyAccessToken(accessToken: string) {
    try {
      const payload = JWT.verify(accessToken, this.secret);
      return payload;
    } catch (err) {
      return null;
    }
  }

  verifyRefreshToken(refreshToken: string) {
    const payload = JWT.verify(refreshToken, this.refreshSecret);
    return payload;
  }

  async updateAccessToken(refreshToken: string) {
    try {
      const storedRefreshToken =
        await this.tokenService.findByUserIdAndCheckValidity(
          refreshToken,
          TokenType.REFRESH,
        );

      if (!storedRefreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      const userId = this.verifyRefreshToken(refreshToken);

      const tokens = await this.generateTokens(userId.toString());

      return tokens.accessToken;
    } catch (e) {
      return null;
    }
  }

  private async generateTokens(id: string) {
    const payload = { id };
    // Fetch existing valid tokens for the user (both access and refresh)
    const [existingAccessToken, existingRefreshToken] = await Promise.all([
      this.tokenService.findByUserIdAndCheckValidity(id, TokenType.ACCESS),
      this.tokenService.findByUserIdAndCheckValidity(id, TokenType.REFRESH),
    ]);

    // Revoke old tokens if necessary
    await Promise.all([
      existingAccessToken
        ? this.tokenService.revokeToken(existingAccessToken.token)
        : null,
      existingRefreshToken
        ? this.tokenService.revokeToken(existingRefreshToken.token)
        : null,
    ]);

    const [accessToken, refreshToken] = await Promise.all([
      JWT.sign(payload, this.secret, {
        expiresIn: this.expires,
      }),
      JWT.sign(payload, this.refreshSecret, {
        expiresIn: this.refreshExpires,
      }),
    ]);

    // Define the expiration dates
    const accessTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Prepare the token DTOs
    const accessTokenDto = this.createTokenDto(
      accessToken,
      id,
      accessTokenExpiry,
      TokenType.ACCESS,
    );
    const refreshTokenDto = this.createTokenDto(
      refreshToken,
      id,
      refreshTokenExpiry,
      TokenType.REFRESH,
    );

    // Save new tokens to the database
    await Promise.all([
      this.tokenService.create(accessTokenDto),
      this.tokenService.create(refreshTokenDto),
    ]);

    return { accessToken, refreshToken };
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    // Add the token to the invalidated tokens collection
    const storedRefreshToken =
      await this.tokenService.findByUserIdAndCheckValidity(
        userId,
        TokenType.REFRESH,
      );

    if (storedRefreshToken) {
      const isValid = await this.tokenService.compareToken(
        refreshToken,
        storedRefreshToken,
      );
      if (isValid) {
        await this.tokenService.revokeToken(refreshToken);
      } else {
        throw new UnauthorizedException('Invalid refresh token');
      }
    } else {
      throw new UnauthorizedException('Refresh token not found or invalid');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          email: 'emailNotExists',
        },
      });
    }

    // const tokenExpiresIn = this.configService.getOrThrow('auth.forgotExpires', {
    //   infer: true,
    // });

    // const forgotSecret = this.configService.getOrThrow<string>(
    //   'auth.forgotSecret',
    //   {
    //     infer: true,
    //   },
    // );
  }

  async resetPassword(hash: string, password: string): Promise<void> {
    let userId: IUser['id'];

    try {
      const jwtData: any = await JWT.verify(
        hash,
        this.configService.getOrThrow<string>('auth.forgotSecret', {
          infer: true,
        }),
      );

      userId = jwtData.forgotUserId;
    } catch {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          hash: `invalidHash`,
        },
      });
    }

    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          hash: `notFound`,
        },
      });
    }

    user.password = password;

    // await this.sessionService.softDelete({
    //   user: {
    //     id: user.id,
    //   },
    // });

    await this.userService.update(user.id, user);
  }

  async handleGoogleLogin(userPayload: any) {
    try {
      // Verify the Google token using the OAuth2Client
      if (!userPayload) {
        throw new UnauthorizedException('Invalid Google token');
      }

      // Try to find the user by email
      let user: IUser = await this.userService.findOneByEmail(
        userPayload.email,
      );

      if (!user) {
        // If the user doesn't exist, create a new user from Google profile data
        user = await this.userService.createGoogleUser(userPayload);
      }

      // Generate JWT tokens for the user (ensure generateTokens is defined in your service)
      const tokens = await this.generateTokens(user.id);

      // Return the user object along with the generated tokens
      return { user, tokens };
    } catch (error) {
      // Log the error message for debugging purposes
      console.error('Google login failed', error);

      // Throw an UnauthorizedException if any error occurs during Google login process
      throw new UnauthorizedException('Google login failed');
    }
  }

  private createTokenDto(
    token: string,
    userId: string,
    expiresAt: Date,
    tokenType: TokenType,
  ) {
    return {
      token,
      userId,
      expiresAt,
      tokenType,
    };
  }
}

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
import { IToken, IUser, TokenType } from '../../model';
import { MailService } from '../../services/mail/mail.service';
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
    private readonly mailService: MailService,
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

  async singUp(signUpDto: SignUpDto) {
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
    const user: IUser = await this.userService.findOneByEmail(signInDto.email);

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
      const storedRefreshToken = await this.tokenService.getTokenByUserAndType(
        refreshToken,
        TokenType.REFRESH,
      );

      if (!storedRefreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      const userEmail = this.verifyRefreshToken(refreshToken);

      const tokens = await this.generateTokens(userEmail.toString());

      return tokens.accessToken;
    } catch (e) {
      return null;
    }
  }

  private async generateTokens(email: string) {
    const payload = { email };
    // Fetch existing valid tokens for the user (both access and refresh)
    const [existingAccessToken, existingRefreshToken] = await Promise.all([
      this.tokenService.getTokenByUserAndType(email, TokenType.ACCESS),
      this.tokenService.getTokenByUserAndType(email, TokenType.REFRESH),
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
    const accessTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 15 minutes
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Prepare the token DTOs
    const accessTokenDto: Partial<IToken> = this.createTokenDto(
      accessToken,
      email,
      accessTokenExpiry,
      TokenType.ACCESS,
    );
    const refreshTokenDto: Partial<IToken> = this.createTokenDto(
      refreshToken,
      email,
      refreshTokenExpiry,
      TokenType.REFRESH,
    );

    // Save new tokens to the database
    await Promise.all([
      this.tokenService.createToken(accessTokenDto),
      this.tokenService.createToken(refreshTokenDto),
    ]);

    return { accessToken, refreshToken };
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    // Add the token to the invalidated tokens collection
    const storedRefreshToken = await this.tokenService.getTokenByUserAndType(
      userId,
      TokenType.REFRESH,
    );

    if (storedRefreshToken) {
      if (storedRefreshToken.isValid) {
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

    const tokenExpiresIn = this.configService.getOrThrow('auth.forgotExpires', {
      infer: true,
    });

    const forgotSecret = this.configService.getOrThrow<string>(
      'auth.forgotSecret',
      {
        infer: true,
      },
    );

    const tokenExpires = Date.now() + 60000 * 30;
    try {
      const hash = await JWT.sign(
        {
          forgotUserId: user.id,
        },
        forgotSecret,
        {
          expiresIn: tokenExpiresIn,
        },
      );

      await this.mailService.forgotPassword({
        to: email,
        data: {
          hash,
          tokenExpires,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(hash: string, password: string): Promise<void> {
    let userId: IUser['id'];

    try {
      const jwtData = await JWT.verify<{
        forgotUserId: IUser['id'];
      }>(
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

  private createTokenDto(
    token: string,
    userId: string,
    expiresAt: Date,
    tokenType: TokenType,
  ): IToken {
    return {
      token,
      userId,
      expiresAt,
      tokenType,
      isValid: true,
    } as IToken;
  }
}

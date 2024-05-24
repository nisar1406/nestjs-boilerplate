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
import { IUser } from '../../model';
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
      const userId = this.verifyRefreshToken(refreshToken);

      const tokens = await this.generateTokens(userId.toString());

      return tokens.accessToken;
    } catch (e) {
      return null;
    }
  }

  private async generateTokens(id: string) {
    const payload = { id };
    console.log(payload, 'payload');

    const accessToken = JWT.sign(payload, this.secret, {
      expiresIn: this.expires,
    });

    const refreshToken = JWT.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpires,
    });

    await this.tokenService.create({ token: accessToken });
    const tokens = { accessToken, refreshToken };

    return tokens;
  }

  async logout(token: string): Promise<void> {
    // Add the token to the invalidated tokens collection
    await this.tokenService.create({ token });
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
}

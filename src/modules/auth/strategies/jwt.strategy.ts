import { AllConfigType } from '@/src/configs';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService<AllConfigType>,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('auth.secret', {
        infer: true,
      }),
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findOne(payload.id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    console.log('User attached in JwtS:', user);
    return user;
  }
}

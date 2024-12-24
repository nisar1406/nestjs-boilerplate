import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('auth.googleClientId'),
      clientSecret: configService.get<string>('auth.googleClientSecret'),
      callbackURL: configService.get<string>('auth.googleCallbackUrl'),
      scope: ['email', 'profile'],
      accessType: 'offline', // Offline access for refresh tokens
      prompt: 'consent',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos, id } = profile;
    console.log('accessToken', accessToken);
    console.log('refreshToken', refreshToken);

    console.log('profile', profile);

    const user = {
      email: emails[0].value,
      firstName: name?.givenName,
      lastName: name?.familyName,
      picture: photos[0].value,
      googleId: id,
      tokenId: accessToken, // Add the accessToken here as tokenId,
      password: '',
    };
    done(null, user);
    return user;
  }
}

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';

import { Public } from '../../decorators/common.decorators';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { GoogleAuthGuard } from '../../guards';
import { JoiValidationPipe } from '../../pipes';
import { createUserSchema } from '../users/validation/schema';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

// import { IGoogleUser } from './types/types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @Post('/signUp')
  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiBody({ type: SignUpDto, description: 'User sign-up data' })
  @ApiCreatedResponse({
    description: 'User signed up successfully',
  })
  @ApiBadRequestResponse({
    description: 'User already exists',
  })
  @UsePipes(new JoiValidationPipe(null, createUserSchema))
  async singUp(
    @Body() signUpDto: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.signUp(signUpDto);

    if (!tokens) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return tokens;
  }

  @Post('/signIn')
  @Public()
  @ApiOperation({ summary: 'Sign in an existing user' })
  @ApiBody({ type: SignInDto, description: 'User sign-in data' })
  @ApiOkResponse({
    description: 'User signed in successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async singIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.signIn(signInDto);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return tokens;
  }

  @Post('/refresh')
  @ApiOperation({ summary: 'Update access token using refresh token' })
  @ApiOkResponse({
    description: 'Access token updated successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updateTokens(@Req() req: Request) {
    const { refreshToken } = req.cookies;

    const accessToken = await this.authService.updateAccessToken(refreshToken);

    if (!accessToken) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return accessToken;
  }

  @Get('/logout')
  @ApiOperation({ summary: 'Logout the user' })
  @ApiOkResponse({
    description: 'User logged out successfully',
  })
  async logout(
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser() user: { id: string },
  ) {
    try {
      const cookiesString = req.headers?.cookie || req.body.refreshToken;

      if (!cookiesString) {
        console.log('No cookies found');
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      const refreshToken =
        cookiesString
          ?.split(';')
          .map((cookie) => cookie.trim())
          .find((cookie) => cookie.startsWith('refreshToken='))
          ?.split('=')[1] || req.body.refreshToken;

      if (!refreshToken) {
        console.log('Refresh Token not found');
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      if (refreshToken) {
        // Invalidate the refresh token in the database or your token store
        await this.authService.logout(user.id, refreshToken);
      }

      // Clear the refresh token cookie
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true, // Set this to true if using HTTPS
        sameSite: 'strict',
      });

      return { message: 'Logged out successfully' };
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error occurred during logout',
      });
    }
  }

  @Public()
  @Post('forgot/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Send forgot password email' })
  @ApiBody({ type: ForgotPasswordDto, description: 'Forgot password data' })
  @ApiNoContentResponse({
    description: 'Forgot password email sent successfully',
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<void> {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reset password' })
  @ApiBody({ type: ResetPasswordDto, description: 'Reset password data' })
  @ApiNoContentResponse({
    description: 'Password reset successfully',
  })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(
      resetPasswordDto.hash,
      resetPasswordDto.password,
    );
  }

  @Public()
  @Get('/google/login')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth' })
  @ApiOkResponse({ description: 'Redirect to Google login page' })
  async googleAuth() {
    // This method redirects the user to Google for login
  }

  @Public()
  @Get('/google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiOkResponse({
    description: 'Successfully authenticated with Google',
  })
  async googleAuthRedirect(
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser() user,
  ) {
    try {
      // const { tokenId } = req.user as IGoogleUser;
      // Handle Google login and generate tokens
      const { tokens } = await this.authService.handleGoogleLogin(user);
      console.log(tokens);

      // Set refreshToken as an HTTP-only cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.redirect(`http://localhost:3000?token=${tokens.accessToken}`);
    } catch (error) {
      throw new UnauthorizedException('Google authentication failed');
    }
  }

  @Get('/me')
  getData(@Req() req: Request) {
    return req.user;
  }
}

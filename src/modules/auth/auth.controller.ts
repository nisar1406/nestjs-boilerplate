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
import { JoiValidationPipe } from '../../pipes';
import { createUserSchema } from '../users/validation/schema';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    const tokens = await this.authService.singUp(signUpDto);

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

  @Post('/update')
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
  async logout(@Req() req: Request) {
    console.log(req);

    // Add the token to the invalidated tokens collection
    // const data = await this.authService.logout(token);
    // return data;
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
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { JoiValidationPipe } from '../../pipes';
import { SignUpDto } from '../auth/dto/sign-up.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserListDto } from './dto/list-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { createUserSchema, idParamSchema } from './validation/schema';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/create')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiBody({ type: SignUpDto, description: 'User sign-up data' })
  @ApiOkResponse({
    description: 'User signed up successfully',
  })
  @ApiConflictResponse({
    description: 'User already exists',
  })
  @UsePipes(new JoiValidationPipe(null, createUserSchema))
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({ description: 'List of all users' })
  async findAll(@Query() userListDto: UserListDto) {
    return this.usersService.findAll(userListDto);
  }

  @Get(':id')
  @UsePipes(new JoiValidationPipe(idParamSchema, null))
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiOkResponse({ description: 'User found' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @UsePipes(new JoiValidationPipe(idParamSchema, null))
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiBody({ type: UpdateUserDto, description: 'Update user data' })
  @ApiOkResponse({ description: 'User updated successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @UsePipes(new JoiValidationPipe(idParamSchema, null))
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiOkResponse({ description: 'User deleted successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @UsePipes(new JoiValidationPipe(idParamSchema, null))
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}

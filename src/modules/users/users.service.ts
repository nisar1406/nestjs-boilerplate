import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IUser } from '../../model';
import { USERS } from '../../utils/constants/model-names';
import { CreateUserDto } from './dto/create-user.dto';
import { UserListDto } from './dto/list-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(USERS)
    private readonly _userModel: Model<IUser>,
  ) {}

  create(createUserDto: CreateUserDto) {
    return this._userModel.create(createUserDto);
  }

  async findAll(userListDto: UserListDto) {
    let query = this._userModel.find().select('-password');

    // Apply filtering condition for name
    if (userListDto?.name) {
      query = query.where('name').regex(new RegExp(userListDto.name, 'i'));
    }

    // Apply sorting and pagination
    if (userListDto?.isRecent) {
      query = query.sort({ createdAt: -1 });
    }
    if (!userListDto?.all) {
      const limit = userListDto?.pageSize || 10;
      const page = userListDto?.page || 1;
      query = query.limit(limit).skip((page - 1) * limit);
    }

    // Execute query
    const users = await query.lean().exec();
    // const usersWithoutPassword = users.map((user: IUser) => {
    //   // Destructure the user object and remove the password property
    //   const { password, ...userWithoutPassword } = user;
    //   return userWithoutPassword;
    // });
    return users;
  }

  async findOne(id: string) {
    const user = await this._userModel.findOne({ _id: id });

    return user;
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user ${updateUserDto}`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async findOneByEmail(email: string) {
    const user = await this._userModel.findOne({ email });
    return user;
  }

  async findOneByEmailOrMobile(
    value1: string,
    value2: string = null,
  ): Promise<IUser | null> {
    let condition = [{ email: value1 }, { mobile: value1 }];
    if (value1 && value2) {
      condition = [{ email: value1 }, { mobile: value2 }];
    }
    // Use logical OR operator to find by either email or mobile number
    return this._userModel.findOne({ $or: condition }).exec();
  }
}

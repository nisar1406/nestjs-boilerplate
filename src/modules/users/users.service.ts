import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Query } from 'mongoose';

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

  async findAll(userListDto: UserListDto): Promise<IUser[]> {
    let query: Query<IUser[], IUser> = this._userModel
      .find()
      .select('-password');

    if (userListDto?.name) {
      query = query.where('name').regex(new RegExp(userListDto.name, 'i'));
    }

    if (userListDto?.isRecent) {
      query = query.sort({ createdAt: -1 });
    }

    if (userListDto?.all !== true) {
      const limit = userListDto?.pageSize || 10;
      const page = userListDto?.page || 1;
      query = query.limit(limit).skip((page - 1) * limit);
    }

    const users = await query.lean().exec();
    return users as any;
  }

  async findOne(id: string) {
    const user = await this._userModel.findOne({ _id: id });

    return user;
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user ${updateUserDto}`;
  }

  async remove(id: string) {
    return await this._userModel.deleteOne({ _id: id });
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

  async createGoogleUser(profile: any): Promise<IUser> {
    const { email, name, googleId, profilePicture, mobile, tokenId } = profile;

    // Check if the user already exists using googleId
    const user = await this._userModel
      .findOneAndUpdate(
        { googleId }, // Query to find user by Google ID
        {
          $setOnInsert: {
            email,
            name,
            googleId,
            tokenId,
            profilePicture,
            mobile,
            isGoogleUser: true,
            isVerified: true,
            isActive: true,
          },
        },
        { upsert: true, new: true, writeConcern: { w: 1 } }, // Options: upsert and return the new document
      )
      .exec();
    // Return the created or existing user
    return user;
  }
}

import { IUser } from '@/src/model';
import { USERS } from '@/src/utils/constants/model-names';
import { UserGender } from '@/src/utils/enums/user.enum';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

@Injectable()
export class UserSeedService {
  constructor(
    @InjectModel(USERS)
    private readonly model: Model<IUser>,
  ) {}

  async run() {
    const admin = await this.model.findOne({
      email: 'admin@example.com',
    });

    if (!admin) {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash('password', salt);

      const data = new this.model({
        name: 'Admin',
        email: 'admin@example.com',
        password: password,
        lastLogin: new Date(),
        mobile: '9999999999',
        isVerified: true,
        dateOfBirth: new Date('1990-01-01'),
        gender: UserGender.MALE,
        isActive: true,
      });
      await data.save();
    }

    const user = await this.model.findOne({
      email: 'jane.doe@example.com',
    });

    if (!user) {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash('secret', salt);

      const data = new this.model({
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        password: password,
        lastLogin: new Date(),
        mobile: '8888888888',
        isVerified: true,
        dateOfBirth: new Date('1990-01-01'),
        gender: UserGender.MALE,
        isActive: true,
      });

      await data.save();
    }
  }
}

import { Document, Schema, model } from 'mongoose';

import { USERS } from '../utils/constants/model-names';
import { UserGender } from '../utils/enums/user.enum';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  hasPassword: boolean;
  lastLogin: Date;
  mobile: string;
  isVerified: boolean;
  dateOfBirth?: Date;
  gender: UserGender;
  isActive: boolean;
}

export const UserSchema = new Schema<IUser>(
  {
    name: String,
    email: {
      type: String,
      lowercase: true,
      required: function (this: IUser) {
        return !this.mobile;
      },
      index: true,
      unique: true,
      sparse: true,
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: Object.values(UserGender),
      default: UserGender.UNSPECIFIED,
    },
    mobile: { type: String, index: true, unique: true, sparse: true },
    password: String,
    lastLogin: Date,
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

UserSchema.virtual('hasPassword').get(function (this: IUser) {
  return !!this.password;
});

UserSchema.virtual('token').get(function (this: IUser) {
  return { _id: this._id, email: this.email };
});

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
});

UserSchema.methods = {
  toJSON(this: IUser) {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
  },
};

export const UserModel = model<IUser>(USERS, UserSchema);

import { Document, Schema, model } from 'mongoose';

import { USERS } from '../utils/constants/model-names';
import { UserGender } from '../utils/enums/user.enum';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  googleId?: string; // New field for storing the Google ID
  tokenId?: string; // New field for storing the Google OAuth token
  profilePicture?: string; // New field for storing the Google profile picture
  hasPassword: boolean;
  lastLogin: Date;
  mobile: string;
  isVerified: boolean;
  dateOfBirth?: Date;
  gender: UserGender;
  isActive: boolean;
  isGoogleUser: boolean;
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
    googleId: { type: String, unique: true, sparse: true }, // Google ID for OAuth login
    tokenId: { type: String }, // Token ID for OAuth authentication
    profilePicture: String, // URL for the profile picture from Google
    lastLogin: Date,
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isGoogleUser: { type: Boolean, default: false },
  },
  { timestamps: true },
);

UserSchema.virtual('hasPassword').get(function (this: IUser) {
  return !!this.password;
});

UserSchema.virtual('token').get(function (this: IUser) {
  return { _id: this._id, email: this.email };
});

// This pre-save hook checks if a password is being set, and processes accordingly
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  // Hash password logic can go here if needed (bcrypt, etc.)
  next();
});

// This method removes the password before returning the user data
UserSchema.methods = {
  toJSON(this: IUser) {
    const userObject = this.toObject();
    delete userObject.password; // Don't expose password in the response
    return userObject;
  },
};

export const UserModel = model<IUser>(USERS, UserSchema);

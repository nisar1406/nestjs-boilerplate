import * as bcrypt from 'bcrypt';
import { Document, Schema, Types, model } from 'mongoose';

import { TOKENS, USERS } from '../utils/constants/model-names';

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

export interface IToken extends Document {
  token: string;
  userId: Types.ObjectId;
  isValid: boolean;
  revokedAt: Date;
  expiresAt: Date;
  tokenType: TokenType;
}

export const TokenSchema = new Schema<IToken>(
  {
    token: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: USERS,
      required: true,
    },
    isValid: {
      type: Boolean,
      default: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    tokenType: {
      type: String,
      enum: Object.values(TokenType),
      required: true,
    },
  },
  { timestamps: true },
);

// Add an index on createdAt for sorting
TokenSchema.index({ createdAt: 1 });

// Hash the token before saving
TokenSchema.pre('save', async function (next) {
  if (this.isModified('token')) {
    const hashedToken = await bcrypt.hash(this.token, 10);
    this.token = hashedToken;
  }
  next();
});

// Method to compare provided token with the stored hash
TokenSchema.methods.compareToken = async function (
  token: string,
): Promise<boolean> {
  return bcrypt.compare(token, this.token);
};

export const TokenModel = model<IToken>(TOKENS, TokenSchema);

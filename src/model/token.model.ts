import { Document, Schema, model } from 'mongoose';

import { TOKENS } from '../utils/constants/model-names';

export interface IToken extends Document {
  token: string;
  userId: string;
  isValid: boolean;
  expiredAt: Date;
}

export const TokenSchema = new Schema<IToken>(
  {
    token: String,
    userId: String,
    isValid: Boolean,
    expiredAt: Date,
  },
  { timestamps: true },
);

export const TokenModel = model<IToken>(TOKENS, TokenSchema);

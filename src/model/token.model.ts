import { Document, Schema, model } from 'mongoose';

import { TOKENS } from '../utils/constants/model-names';

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

export interface IToken extends Document {
  token: string;
  userId: string;
  isValid: boolean;
  revokedAt?: Date | null; // Optional and can be null
  expiresAt: Date;
  tokenType: TokenType;
}

export const TokenSchema = new Schema<IToken>(
  {
    token: { type: String, required: true }, // Ensure the token field is required
    userId: { type: String, required: true }, // Ensure the userId field is required
    isValid: { type: Boolean, default: true }, // Default to true when creating a token
    revokedAt: { type: Date, default: null }, // Default to null if not revoked
    expiresAt: { type: Date, required: true }, // Ensure expiration date is required
    tokenType: {
      type: String,
      enum: Object.values(TokenType), // Ensure it matches the TokenType enum
      required: true,
    },
  },
  { timestamps: true }, // Adds `createdAt` and `updatedAt` fields automatically
);

export const TokenModel = model<IToken>(TOKENS, TokenSchema);

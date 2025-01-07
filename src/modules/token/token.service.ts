import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IToken, TokenType } from '../../model';
import { TOKENS } from '../../utils/constants/model-names';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(TOKENS)
    private readonly _tokenModel: Model<IToken>,
  ) {}
  /**
   * Create a new token for a user
   * @param tokenData - The token data to create
   * @returns The created token data
   */
  async createToken(tokenData): Promise<IToken> {
    const createdToken = new this._tokenModel({
      token: tokenData.token,
      userId: tokenData.userId,
      isValid: tokenData.isValid,
      revokedAt: null,
      expiresAt: tokenData.expiresAt,
      tokenType: tokenData.tokenType,
      createdAt: new Date(),
    });

    await createdToken.save();
    return createdToken.toObject() as IToken;
  }

  /**
   * Retrieve a token by user ID and token type
   * @param userId - The user ID to search for
   * @param tokenType - The type of token (ACCESS or REFRESH)
   * @returns The token data if found, otherwise null
   */
  async getTokenByUserAndType(
    userId: string,
    tokenType: TokenType,
  ): Promise<IToken | null> {
    const token = await this._tokenModel
      .findOne({
        userId,
        tokenType,
        isValid: true, // Only retrieve valid tokens
      })
      .exec();

    return token ? (token.toObject() as IToken) : null;
  }

  /**
   * Mark a token as revoked
   * @param tokenId - The token ID to revoke
   * @returns The updated token data
   */
  async revokeToken(tokenId: string): Promise<IToken | null> {
    const token = await this._tokenModel.findById(tokenId).exec();

    if (!token) {
      return null; // Token not found
    }

    token.revokedAt = new Date(); // Set revoked time
    token.isValid = false; // Mark token as invalid
    await token.save();

    return token.toObject() as IToken;
  }

  /**
   * Check if a token is still valid by its ID
   * @param tokenId - The token ID to check
   * @returns The token if valid, otherwise null
   */
  async validateToken(tokenId: string): Promise<IToken | null> {
    const token = await this._tokenModel.findById(tokenId).exec();

    if (!token) {
      return null; // Token not found
    }

    if (token.isValid && token.expiresAt > new Date()) {
      return token.toObject() as IToken; // Token is valid
    }

    return null; // Token is either revoked or expired
  }
}

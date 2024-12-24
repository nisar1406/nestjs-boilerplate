import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

import { IToken, TokenType } from '../../model';
import { TOKENS } from '../../utils/constants/model-names';
import { CreateTokenDto } from './dto/create-token.dto';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(TOKENS)
    private readonly _tokenModel: Model<IToken>,
  ) {}

  // Check if a token is revoked
  async isTokenRevoked(token: string): Promise<boolean> {
    const revokedToken = await this._tokenModel.findOne({ token }).exec();
    return revokedToken !== null && revokedToken.isValid === false;
  }

  // Revoke a token by marking it as invalid
  async revokeToken(token: string): Promise<void> {
    const existingToken = await this._tokenModel.findOne({ token }).exec();
    if (existingToken) {
      existingToken.isValid = false;
      existingToken.revokedAt = new Date();
      await existingToken.save();
    } else {
      throw new NotFoundException('Token not found');
    }
  }

  // Create a new token record (Hash the token before saving)
  async create(createTokenDto: CreateTokenDto): Promise<IToken> {
    const tokenToCreate = await this._tokenModel.create(createTokenDto);
    return tokenToCreate;
  }

  // Find a token by userId and token type, check if valid
  async findByUserIdAndCheckValidity(
    userId: string,
    tokenType: TokenType,
  ): Promise<IToken | null> {
    try {
      const token = await this._tokenModel
        .findOne({ userId, tokenType, isValid: true })
        .sort({ createdAt: -1 })
        .exec();
      if (!token) {
        return null;
      }

      return token;
    } catch (error) {
      console.log(error);
    }
  }

  // Compare a given token with the stored hash in the database
  async compareToken(token: string, storedToken: IToken): Promise<boolean> {
    return bcrypt.compare(token, storedToken.token);
  }

  // Remove a token by its ID
  async remove(id: string): Promise<void> {
    const token = await this._tokenModel.findByIdAndDelete(id).exec();
    if (!token) {
      throw new NotFoundException(`Token with id ${id} not found`);
    }
  }
}

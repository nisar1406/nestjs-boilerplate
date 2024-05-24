import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IToken } from '../../model';
import { TOKENS } from '../../utils/constants/model-names';
import { CreateTokenDto } from './dto/create-token.dto';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(TOKENS)
    private readonly _tokenModel: Model<IToken>,
  ) {}
  create(createTokenDto: CreateTokenDto) {
    return this._tokenModel.create(createTokenDto);
  }

  findAll() {
    return `This action returns all token`;
  }

  findOne(id: number) {
    return `This action returns a #${id} token`;
  }

  remove(id: number) {
    return `This action removes a #${id} token`;
  }
}

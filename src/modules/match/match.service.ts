import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateMatchDto } from './dto/create-match.dto';
import { Match } from './match.schema';
import { Model } from 'mongoose';

@Injectable()
export class MatchService {
  private logger = new Logger(MatchService.name);
  constructor(@InjectModel(Match.name) private matchModel: Model<Match>) {}

  async findById(id: string): Promise<Match> {
    return await this.matchModel.findById(id);
  }

  async create(data: CreateMatchDto) {
    return await this.matchModel.create({
      opponent1: data.opponent1,
      opponent2: data.opponent2,
      result: data.result,
      leage: data.leage,
    });
  }

  async delete(id: string) {
    return await this.matchModel.findByIdAndDelete(id);
  }
}

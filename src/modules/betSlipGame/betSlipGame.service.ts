import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BetSlipGame } from './betSlipGame.schema';
import { UserFilterParams } from '@modules/user/dto/user-params.dto';
import { MatchService } from '@modules/match/match.service';
import { MatchResult } from '@modules/match/match.schema';
import { BetSlipService } from '@modules/betslip/betSlip.service';
import { UserService } from '@modules/user/user.service';
import { TransactionService } from '@modules/transaction/transaction.service';
import {
  TransactionResult,
  TransactionType,
} from '@modules/transaction/transaction.schema';

const x = 100;

@Injectable()
export class BetSlipGameService {
  private logger = new Logger(BetSlipGameService.name);
  constructor(
    @InjectModel(BetSlipGame.name) private betSlipGameModel: Model<BetSlipGame>,
    private readonly betSlipService: BetSlipService,
    private readonly matchService: MatchService,
    private readonly userService: UserService,
    private readonly transactionService: TransactionService,
  ) {}

  async findAll(query: UserFilterParams) {
    const users = await this.betSlipGameModel.find(
      { deletedAt: null },
      { skip: query?.skip, take: query?.take },
    );

    return users;
  }

  async findById(id: string) {
    const betSlipGame = await this.betSlipGameModel.findById(id);
    if (!betSlipGame) {
      throw new NotFoundException(`BetSlipGame with id ${id} not found`);
    } else return betSlipGame;
  }

  async updateBalance(id: string, depositedAmount: string) {
    return await this.betSlipGameModel.findByIdAndUpdate(
      id,
      {
        $inc: { tokenAmount: Number(depositedAmount), numberOfParticipants: 1 },
      },
      { new: true },
    );
  }

  async delete(id: string) {
    try {
      const user = await this.betSlipGameModel.findByIdAndDelete(id, {
        deletedAt: new Date(),
      });

      return user;
    } catch {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  async resolve(id: string) {
    const betSlipGame = await this.findById(id);
    const matches = await Promise.all(
      betSlipGame.matchIds.map((matchId) =>
        this.matchService.findById(matchId.toString()),
      ),
    );

    const betSlipPromises = betSlipGame.betSlipIds.map(async (betSlipId) => {
      const betSlip = await this.betSlipService.findById(betSlipId.toString());
      let n = 0;
      for (let i = 0; i < 13; i++) {
        const matchResult = matches[i].result;
        const { first, equal, second } = betSlip.status[i];
        if (
          (matchResult === MatchResult.First && first) ||
          (matchResult === MatchResult.Equal && equal) ||
          (matchResult === MatchResult.Second && second)
        ) {
          n++;
        }
      }

      const updateData = {};
      if (n === 13) updateData['$inc'] = { p13Right: 1 };
      else if (n === 12) updateData['$inc'] = { p12Right: 1 };
      else if (n === 11) updateData['$inc'] = { p11Right: 1 };
      if (Object.keys(updateData).length) {
        await this.betSlipGameModel.findByIdAndUpdate(betSlipId, updateData);
      }
      return betSlip.userId;
    });
    const userIds = await Promise.all(betSlipPromises);

    const amount13 = (betSlipGame.tokenAmount * 40) / 100;
    const amount12 = (betSlipGame.tokenAmount * 15) / 100;
    const amount11 = (betSlipGame.tokenAmount * 12) / 100;

    if (betSlipGame.p13Right === 1) {
      this.distribution(Math.max(amount13, x), userIds);
    } else {
      this.sendToPool();
    }

    if (betSlipGame.p12Right) {
      const distributeAmount =
        Math.max(amount12, 2) / betSlipGame.p12Right >
        amount13 / betSlipGame.p13Right
          ? amount12
          : amount13;
      this.distribution(distributeAmount, userIds);
    } else {
      this.sendToPool();
    }

    if (betSlipGame.p11Right) {
      const distributeAmount =
        Math.max(amount11, 2) / betSlipGame.p11Right >
        amount12 / betSlipGame.p12Right
          ? amount11
          : amount12;
      this.distribution(distributeAmount, userIds);
    } else {
      this.sendToPool();
    }

    return true;
  }

  async distribution(amount: number, userIds: Types.ObjectId[]) {
    // to do list
    // withdraw sol
    userIds.map(async (userId) => {
      const user = await this.userService.findById(userId.toString());
      // send(user.walletAddress)
      this.transactionService.create({
        userId: userId.toString(),
        type: TransactionType.Distrubute,
        amount: amount.toString(),
        hash: '',
        result: TransactionResult.Completed,
      });
    });
  }

  async sendToPool(amount?: number) {}
}

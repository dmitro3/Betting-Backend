import {
  NotAcceptableException,
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserPredictionDto } from './dto/user-prediction.dto';
import { BetSlip } from './betSlip.schema';
import { BetSlipGameService } from '@modules/betSlipGame/betSlipGame.service';
import { UserService } from '@modules/user/user.service';
import { confirmTransaction, decodeTransaction } from '@utils/transactions';
import { TransactionService } from '@modules/transaction/transaction.service';
import {
  TransactionResult,
  TransactionType,
} from '@modules/transaction/transaction.schema';

@Injectable()
export class BetSlipService {
  private logger = new Logger(BetSlipService.name);
  constructor(
    @InjectModel(BetSlip.name) private betSlipModel: Model<BetSlip>,
    private readonly betSlipGameService: BetSlipGameService,
    private readonly userService: UserService,
    private readonly transactionService: TransactionService,
  ) {}

  submitPrediction = async (
    { betSlipGameId, encodedTx, predictions }: UserPredictionDto,
    walletAddress: string,
  ) => {
    try {
      const betSlipGame = await this.betSlipGameService.findById(betSlipGameId);

      const user = await this.userService.findByWalletAddress(walletAddress);

      const promises = betSlipGame.betSlipIds.map(async (betSlipId) => {
        const betSlip = await this.betSlipModel.findById(betSlipId);
        return betSlip.userId === user._id;
      });

      const results = await Promise.all(promises);

      if (results.some((result) => result)) {
        throw new NotAcceptableException(
          `You(${walletAddress}) have already bet on this game.`,
        );
      }

      const tx = decodeTransaction(encodedTx);

      const depositedAmount = tx.instructions[3].data.toString('base64');

      const payer = tx.feePayer?.toBase58();
      if (user.walletAddress !== payer.toLowerCase())
        throw new NotAcceptableException(`Invalid Transaction.`);

      try {
        const { confirmed, signature } = await confirmTransaction(tx);
        if (!confirmed || confirmed.value.err)
          throw new BadRequestException('Transaction not confirmed');

        this.transactionService.create({
          userId: user._id.toString(),
          type: TransactionType.Deposit,
          amount: depositedAmount,
          hash: signature,
          result: TransactionResult.Completed,
        });
      } catch (e) {
        throw new BadRequestException(e);
      }

      await this.betSlipModel.create({
        userId: user._id,
        totalWager: depositedAmount,
        status: predictions,
      });

      await this.betSlipGameService.updateBalance(
        betSlipGame.id,
        depositedAmount,
      );

      return true;
    } catch (e) {
      this.logger.error(e);
      return false;
    }
  };

  async findById(id: string): Promise<BetSlip> {
    const betSlip = await this.betSlipModel.findById(id);
    if (!betSlip) {
      throw new NotFoundException(`BetSlip with id ${id} not found`);
    } else return betSlip;
  }
}

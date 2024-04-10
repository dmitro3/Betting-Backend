import { NotAcceptableException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { UserPredictionDto } from './dto/user-prediction.dto';
import { uuid } from '@utils/generator';
import { BetSlipStatusType } from '@prisma/client';

@Injectable()
export class BetService {
  private logger = new Logger(BetService.name);
  constructor(private readonly prisma: PrismaService) {}

  submitPrediction = async (
    userExpectationDto: UserPredictionDto,
    userId: string,
  ) => {
    try {
      const betSlipGame = await this.prisma.betSlipGame.findUnique({
        where: { id: userExpectationDto.betSlipGameId },
      });
      // if (user) {
      //   throw new NotAcceptableException(
      //     'You have already made predictions for this week.',
      //   );
      // }

      const neccessaryMoney = 0;
      const tokenAddress = '';
      const splToken = await this.prisma.splToken.findUnique({
        where: {
          address: tokenAddress,
        },
      });
      // to do list
      // check amount of according games

      let predictionIds: string[] = [];

      await Promise.all(
        userExpectationDto.expections.map(async (expectation) => {
          const prediction = await this.prisma.prediction.create({
            data: {
              id: uuid(),
              first: expectation.first,
              equal: expectation.equal,
              second: expectation.second,
            },
          });
          predictionIds.push(prediction.id); // Push only the ID of the prediction
        }),
      );

      await this.prisma.betSlip.create({
        data: {
          id: uuid(),
          userId,
          betSlipGameId: userExpectationDto.betSlipGameId,
          totalWager: neccessaryMoney,
          status: BetSlipStatusType.Deposited,
          finalResults: [],
          totalWin: 0,
          predictions: {
            // Using object notation to ensure proper relation with predictions
            connect: predictionIds.map((id) => ({ id })),
          },
        },
      });
      await this.prisma.betSlipGame.update({
        where: { id: betSlipGame.id },
        data: {
          tokenAmounts: { ...tokenAmounts, tokenAmount },
        },
      });

      return true;
    } catch (e) {
      this.logger.error(e);
      return false;
    }
  };
}

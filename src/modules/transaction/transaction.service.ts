import { NotAcceptableException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { uuid } from '@utils/generator';
import { BetSlipStatusType } from '@prisma/client';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionService {
  private logger = new Logger(TransactionService.name);
  constructor(private readonly prisma: PrismaService) {}

  findOne = async (transactionId: string) => {
    return await this.prisma.transaction.findUnique({
      where: {
        id: transactionId,
      },
    });
  };

  createTransaction = async (userId: string, type: string, amount: number) => {
    return await this.prisma.transaction.create({
      data: {
        id: uuid(),
        user: {
          connect: { id: userId },
        },
        type,
        amount,
      },
    });
  };

  updateTransaction = async (id: string, { type }: UpdateTransactionDto) => {
    return await this.prisma.transaction.update({
      where: {
        id,
      },
      data: {
        type,
      },
    });
  };

  deleteTransaction = async (transactionId: string) => {
    return await this.prisma.transaction.delete({
      where: {
        id: transactionId,
      },
    });
  };
}

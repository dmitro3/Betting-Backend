import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction } from './transaction.schema';
import { Model } from 'mongoose';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionService {
  private logger = new Logger(TransactionService.name);
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
  ) {}

  async findById(id: string) {
    return await this.transactionModel.findById(id);
  }

  async create(data: CreateTransactionDto) {
    return await this.transactionModel.create(data);
  }
}

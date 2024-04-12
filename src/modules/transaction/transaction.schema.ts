import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TransactionDocument = HydratedDocument<Transaction>;

export enum TransactionType {
  Deposit,
  Withdraw,
  Distrubute,
}

export enum TransactionResult {
  Pending,
  Completed,
  Reverted,
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Transaction {
  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  type: TransactionType;

  @Prop({ required: true })
  amount: string;

  @Prop({ required: true })
  hash: string;

  @Prop({ required: true, default: Date.now() })
  timestamp: Date;

  @Prop({ required: true, default: TransactionResult.Pending })
  result: TransactionResult;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

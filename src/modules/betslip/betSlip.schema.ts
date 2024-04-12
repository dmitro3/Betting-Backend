import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BetSlipDocument = HydratedDocument<BetSlip>;

export type BetSlipStatus = {
  first: boolean;
  equal: boolean;
  second: boolean;
};

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class BetSlip {
  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  totalWager: string;

  @Prop({ required: true, default: [] })
  status: BetSlipStatus[];

  @Prop({ required: true, default: 0 })
  finalResult: number;

  @Prop({ required: true, default: 0 })
  totalWin: number;
}

export const BetSlipSchema = SchemaFactory.createForClass(BetSlip);

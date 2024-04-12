import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BetSlipGameDocument = HydratedDocument<BetSlipGame>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class BetSlipGame {
  @Prop({ required: true, default: false })
  home: boolean;

  @Prop({ required: true, default: false })
  away: boolean;

  @Prop({ required: true, default: false })
  draw: boolean;

  @Prop({ required: true, default: false })
  result: boolean;

  @Prop({ required: true, default: [] })
  betSlipIds: Types.ObjectId[];

  @Prop({ required: false, default: [] })
  matchIds: Types.ObjectId[];

  @Prop({ required: true, default: 0 })
  numberOfParticipants: number;

  @Prop({ required: true, default: 0 })
  tokenAmount: number;

  @Prop({ required: true, default: 0 })
  p13Right: number;

  @Prop({ required: true, default: 0 })
  p12Right: number;

  @Prop({ required: true, default: 0 })
  p11Right: number;

  @Prop({ required: true, default: 0 })
  p10Right: number;
}

export const BetSlipGameSchema = SchemaFactory.createForClass(BetSlipGame);

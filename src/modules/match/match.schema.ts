import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MatchDocument = HydratedDocument<Match>;

export enum MatchResult {
  First,
  Equal,
  Second,
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Match {
  @Prop({ required: true })
  betSlipGameId: Types.ObjectId;

  @Prop({ required: true })
  opponent1: string;

  @Prop({ required: true })
  opponent2: string;

  @Prop({ required: true, default: Date.now() })
  dateTime: Date;

  @Prop({ required: true, default: MatchResult.Equal })
  result: MatchResult;

  @Prop({ required: true })
  leage: string;
}

export const MatchSchema = SchemaFactory.createForClass(Match);

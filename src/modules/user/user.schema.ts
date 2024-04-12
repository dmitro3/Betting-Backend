import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum Role {
  Superadmin,
  Admin,
  Tester,
  User,
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User {
  @Prop({ required: true, unique: true })
  walletAddress: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  nonce: string;

  @Prop({ required: true, default: Role.User })
  role: Role;

  @Prop({ required: true, default: Date.now() })
  lastLogin: Date;

  @Prop({ required: false })
  deletedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.path('walletAddress').set(function (
  this: UserDocument,
  walletAddress: string,
) {
  return walletAddress.toLowerCase();
});

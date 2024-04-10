import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { IsRightArray } from '@decorators/IsRightArray';
import { Transaction } from '@solana/web3.js';
import { BetPrediction } from 'src/types/expectation';

export class UserPredictionDto {
  @ApiProperty({
    required: true,
    type: 'array',
    description: 'Expected results by user',
  })
  @IsArray()
  @IsRightArray(13)
  @IsNotEmpty()
  expections: Array<BetPrediction>;

  @ApiProperty({
    required: true,
    type: 'transaction',
    description: 'Send transaction',
  })
  @IsArray()
  @IsRightArray(13)
  @IsNotEmpty()
  transaction: Transaction;

  @ApiProperty({
    required: true,
    type: 'string',
    description: 'betSlipGameId',
  })
  @IsString()
  @IsNotEmpty()
  betSlipGameId: string;
}

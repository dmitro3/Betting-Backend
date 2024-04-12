import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { TransactionResult, TransactionType } from '../transaction.schema';

export class CreateTransactionDto {
  @ApiProperty({
    required: true,
    type: 'Types.ObjectId',
    description: 'userId',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    required: true,
    type: 'string',
    description: 'transaction Type',
  })
  @IsString()
  @IsNotEmpty()
  type: TransactionType;

  @ApiProperty({
    required: true,
    type: 'number',
    description: 'amount',
  })
  @IsString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty({
    required: true,
    type: 'string',
    description: 'transaction hash',
  })
  @IsString()
  @IsNotEmpty()
  hash: string;

  @ApiProperty({
    required: true,
    type: 'string',
    description: 'transaction result',
  })
  @IsString()
  @IsNotEmpty()
  result?: TransactionResult;
}

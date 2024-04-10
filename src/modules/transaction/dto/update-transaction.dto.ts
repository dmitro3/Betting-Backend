import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTransactionDto {
  @ApiProperty({
    required: true,
    type: 'string',
    description: 'transaction Type',
  })
  @IsString()
  @IsNotEmpty()
  type: string;
}

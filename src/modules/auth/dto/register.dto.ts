import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    required: true,
    type: 'string',
    description: 'Wallet address',
  })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;
}

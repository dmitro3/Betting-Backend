import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResolveGameDto {
  @ApiProperty({
    required: true,
    type: 'string',
    description: 'betSlipGameId',
  })
  @IsString()
  @IsNotEmpty()
  betSlipGameId: string;
}

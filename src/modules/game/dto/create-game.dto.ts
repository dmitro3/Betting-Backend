import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGameDto {
  @ApiProperty({
    required: true,
    type: 'string',
    description: 'Team A',
  })
  @IsString()
  @IsNotEmpty()
  opponent1: string;

  @ApiProperty({
    required: true,
    type: 'string',
    description: 'Team B',
  })
  @IsString()
  @IsNotEmpty()
  opponent2: string;

  @ApiProperty({
    required: true,
    type: 'string',
    description: 'Result',
  })
  @IsString()
  @IsNotEmpty()
  result: string;

  @ApiProperty({
    required: true,
    type: 'string',
    description: 'Leage',
  })
  @IsString()
  @IsNotEmpty()
  leage: string;
}

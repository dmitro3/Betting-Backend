import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { With } from 'src/types/shared';
import { Role, User } from '../user.schema';

export class UserDto {
  @IsString()
  walletAddress: string;

  @IsString()
  name: string;

  @IsEnum(Role)
  @ApiProperty({ enum: Role })
  role: Role;
}

export type UserInput = With<[User]>;

export function toUserDto(user: User) {
  const plainUserDto: UserDto = {
    walletAddress: user.walletAddress,
    name: user.name,
    role: user.role,
  };

  const userDto = plainToInstance(UserDto, plainUserDto);
  return userDto;
}

export const toUserDtoArray = (users: UserInput[]) => {
  return users.map(toUserDto);
};

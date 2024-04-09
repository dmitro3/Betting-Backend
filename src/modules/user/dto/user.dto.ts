import { IsEnum, IsString } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { User, Role } from '@prisma/client';
import { With } from 'src/types/shared';

export class UserDto {
  @IsString()
  id: String;

  @IsString()
  name: string;

  @IsEnum(Role)
  @ApiProperty({ enum: Role })
  role: Role;
}

export type UserInput = With<[User]>;

export function toUserDto(user: User) {
  const plainUserDto: UserDto = {
    id: user.id,
    name: user.name,
    role: user.role,
  };

  const userDto = plainToInstance(UserDto, plainUserDto);
  return userDto;
}

export const toUserDtoArray = (users: UserInput[]) => {
  return users.map(toUserDto);
};

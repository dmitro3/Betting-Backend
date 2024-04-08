import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
} from 'class-validator';
import { Type, plainToInstance } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { User, Role } from '@prisma/client';
import { With } from 'src/types/shared';

export class UserDto {
  @IsPositive()
  id: number;

  @IsEmail()
  email: string;

  @IsBoolean()
  isEmailVerified: boolean;

  @IsString()
  name: string;

  @IsEnum(Role)
  @ApiProperty({ enum: Role })
  role: Role;

  @IsBoolean()
  hasPassword: boolean;
}

export type UserInput = With<[User]>;

export function toUserDto(user: User) {
  const plainUserDto: UserDto = {
    id: user.id,
    email: user.email,
    isEmailVerified: !!user.emailVerifiedAt,
    name: user.name,
    role: user.role,
    hasPassword: user.password.length > 0,
  };

  const userDto = plainToInstance(UserDto, plainUserDto);
  return userDto;
}

export const toUserDtoArray = (users: UserInput[]) => {
  return users.map(toUserDto);
};

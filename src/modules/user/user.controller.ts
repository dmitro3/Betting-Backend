import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UserPayload } from '@modules/auth/dto/authorization.dto';
import { UserAuth } from '@guards/user-auth.guard';
import { UserOwnerAuth } from '@guards/user-owner.guard';
import { UserEntity } from '@decorators/user.decorator';
import { AdminGuard } from '@guards/roles.guard';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterParams } from './dto/user-params.dto';
import { toUserDto, toUserDtoArray, UserDto } from './dto/user.dto';

@UseGuards(ThrottlerGuard)
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /* Get user data from auth token */
  @UserAuth()
  @Get('get/me')
  async findMe(@UserEntity() user: UserPayload): Promise<UserDto> {
    const me = await this.userService.findMe(user.id);
    return toUserDto(me);
  }

  /* Get all users */
  @AdminGuard()
  @Get('get')
  async findAll(@Query() query: UserFilterParams): Promise<UserDto[]> {
    const users = await this.userService.findAll(query);
    return toUserDtoArray(users);
  }

  /* Get specific user unique id */
  @AdminGuard()
  @Get('get/:id')
  async findOne(@Param('id') id: string): Promise<UserDto> {
    const user = await this.userService.findOne(id);
    return toUserDto(user);
  }

  /* Update specific user */
  @UserOwnerAuth()
  @Patch('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    const user = await this.userService.update(id, updateUserDto);
    return toUserDto(user);
  }

  /* Pseudo delete genre */
  @UserOwnerAuth()
  @Patch('delete/:id')
  async pseudoDelete(@Param('id') id: string) {
    await this.userService.pseudoDelete(id);
  }

  /* Recover genre */
  @UserOwnerAuth()
  @Patch('recover/:id')
  async pseudoRecover(@Param('id') id: string) {
    await this.userService.pseudoRecover(id);
  }
}

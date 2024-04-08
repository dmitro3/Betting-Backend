import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from '../types/update-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { toUserDto, toUserDtoArray, UserDto } from './dto/user.dto';
import {
  RequestPasswordResetDto,
  ResetPasswordDto,
  UpdatePasswordDto,
} from 'src/types/update-password.dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { UserPayload } from 'src/auth/dto/authorization.dto';
import { memoizeThrottle } from 'src/utils/lodash';
import { UserAuth } from 'src/guards/user-auth.guard';
import { UserOwnerAuth } from 'src/guards/user-owner.guard';
import { UserEntity } from 'src/decorators/user.decorator';
import { WalletDto, toWalletDtoArray } from 'src/wallet/dto/wallet.dto';
import { AdminGuard } from 'src/guards/roles.guard';
import { UserFilterParams } from './dto/user-params.dto';
import { RequestEmailChangeDto } from 'src/types/request-email-change.dto';

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
    const user = await this.userService.findOne(+id);
    return toUserDto(user);
  }

  /* Get all wallets connected to the user */
  @Get('get/:id/wallets')
  async getWallets(@Param('id') id: string): Promise<WalletDto[]> {
    const wallets = await this.userService.getWallets(+id);
    return toWalletDtoArray(wallets);
  }

  /* Update specific user */
  @UserOwnerAuth()
  @Patch('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    const user = await this.userService.update(+id, updateUserDto);
    return toUserDto(user);
  }

  /* Update specific user's password */
  @UserOwnerAuth()
  @Patch('update-password/:id')
  async updatePassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    await this.userService.updatePassword(+id, updatePasswordDto);
  }

  private throttledRequestPasswordReset = memoizeThrottle(
    (email: string) => {
      return this.userService.requestPasswordReset(email);
    },
    3 * 60 * 1000, // cache for 3 minutes
  );

  @Patch('request-password-reset')
  async requestPasswordReset(
    @Body() requestPasswordResetDto: RequestPasswordResetDto,
  ) {
    return this.throttledRequestPasswordReset(
      requestPasswordResetDto.nameOrEmail,
    );
  }

  @Patch('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.userService.resetPassword(resetPasswordDto);
  }

  private throttledRequestEmailChange = memoizeThrottle(
    (user: UserPayload, newEmail: string) => {
      return this.userService.requestEmailChange(user, newEmail);
    },
    10 * 60 * 1000, // cache for 10 minutes
  );

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UserOwnerAuth()
  @Patch('request-email-change')
  async requestEmailChange(
    @UserEntity() user: UserPayload,
    @Body() { newEmail }: RequestEmailChangeDto,
  ) {
    return this.throttledRequestEmailChange(user, newEmail);
  }

  private throttledRequestEmailVerification = memoizeThrottle(
    (email: string) => this.userService.requestEmailVerification(email),
    10 * 60 * 1000, // cache for 10 minutes
  );

  /* Verify your email address */
  @UserOwnerAuth()
  @Patch('request-email-verification')
  async requestEmailVerification(@UserEntity() user: UserPayload) {
    return this.throttledRequestEmailVerification(user.email);
  }

  /* Verify an email address */
  @Patch('verify-email/:verificationToken')
  async verifyEmail(
    @Param('verificationToken') verificationToken: string,
  ): Promise<UserDto> {
    const user = await this.userService.verifyEmail(verificationToken);
    return toUserDto(user);
  }

  /* Pseudo delete genre */
  @UserOwnerAuth()
  @Patch('delete/:id')
  async pseudoDelete(@Param('id') id: string) {
    await this.userService.pseudoDelete(+id);
  }

  /* Recover genre */
  @UserOwnerAuth()
  @Patch('recover/:id')
  async pseudoRecover(@Param('id') id: string) {
    await this.userService.pseudoRecover(+id);
  }
}

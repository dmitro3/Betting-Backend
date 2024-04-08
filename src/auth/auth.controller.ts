import {
  Controller,
  Get,
  Post,
  Param,
  Patch,
  UseGuards,
  Body,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle, Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';
import { UserService } from '../user/user.service';
import { validateEmail, validateName } from '../utils/user';
import { LoginDto } from '../types/login.dto';
import { RegisterDto } from '../types/register.dto';
import { Authorization, UserPayload } from './dto/authorization.dto';
import { UserAuth } from '../guards/user-auth.guard';
import { UserEntity } from '../decorators/user.decorator';
@UseGuards(ThrottlerGuard)
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly passwordService: PasswordService,
  ) {}

  // USER ENDPOINTS
  @SkipThrottle()
  @Get('user/validate-name/:name')
  async validateUserName(@Param('name') name: string) {
    validateName(name);
    return await this.userService.throwIfNameTaken(name);
  }

  @SkipThrottle()
  @Get('user/validate-email/:email')
  async validateUserEmail(@Param('email') email: string) {
    validateEmail(email);
    return await this.userService.throwIfEmailTaken(email);
  }

  /* Register a new user */
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('user/register')
  async registerUser(@Body() registerDto: RegisterDto): Promise<Authorization> {
    const user = await this.userService.register(registerDto);
    return this.authService.authorizeUser(user);
  }

  /* Login as a user */
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Patch('user/login')
  async loginUser(@Body() loginDto: LoginDto): Promise<Authorization> {
    const user = await this.userService.login(loginDto);
    return this.authService.authorizeUser(user);
  }

  /* Refresh access token */
  @SkipThrottle()
  @Patch('user/refresh-token/:refreshToken')
  async reauthorizeUser(@Param('refreshToken') refreshToken: string) {
    return await this.authService.refreshAccessToken(refreshToken);
  }

  // Should this be an authorized endpoint? How do refresh tokens actually work??
  /* Refresh access token */
  @SkipThrottle()
  @Patch('creator/refresh-token/:refreshToken')
  async reauthorizeCreator(@Param('refreshToken') refreshToken: string) {
    return await this.authService.refreshAccessToken(refreshToken);
  }

  // WALLET ENDPOINTS
  @Throttle({ default: { limit: 5, ttl: 30000 } })
  @UserAuth()
  /* Request a new one time password for your wallet to sign */
  @Patch('wallet/request-password/:address')
  async requestPassword(@UserEntity() user: UserPayload) {
    return await this.passwordService.generateOneTimePassword(user.id);
  }

  /* Connect your wallet with a signed and encoded one time password */
  @UserAuth()
  @Patch('wallet/connect/:address/:encoding')
  async connectWallet(
    @Param('address') address: string,
    @Param('encoding') encoding: string,
    @UserEntity() user: UserPayload,
  ) {
    await this.authService.connectWallet(user.id, address, encoding);
  }

  /* Disconnect your wallet */
  @UserAuth()
  @Patch('wallet/disconnect/:address')
  async disconnectWallet(@Param('address') address: string) {
    await this.authService.disconnectWallet(address);
  }
}

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
import { UserService } from '../user/user.service';
import { validateName } from '@utils/user';
import { Authorization } from './dto/authorization.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserAuth } from '@guards/user-auth.guard';
@UseGuards(ThrottlerGuard)
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  // USER ENDPOINTS
  @SkipThrottle()
  @Get('user/validate-name/:name')
  async validateUserName(@Param('name') name: string) {
    validateName(name);
    return await this.userService.throwIfNameTaken(name);
  }

  /* Register a new user */
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('user/register')
  async registerUser(@Body() registerDto: RegisterDto): Promise<string> {
    const nonce = await this.userService.register(registerDto);
    return nonce;
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
}

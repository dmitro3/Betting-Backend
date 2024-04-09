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
import { BetService } from './bet.service';

@UseGuards(ThrottlerGuard)
@ApiTags('Bet')
@Controller('bet')
export class UserController {
  constructor(private readonly betService: BetService) {}
}

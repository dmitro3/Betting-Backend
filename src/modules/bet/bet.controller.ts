import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { UserPayload } from '@modules/auth/dto/authorization.dto';
import { UserAuth } from '@guards/user-auth.guard';
import { UserOwnerAuth } from '@guards/user-owner.guard';
import { UserEntity } from '@decorators/user.decorator';
import { AdminGuard } from '@guards/roles.guard';
import { BetService } from './bet.service';
import { UserPredictionDto } from './dto/user-prediction.dto';

@UseGuards(ThrottlerGuard)
@ApiTags('Bet')
@Controller('bet')
export class BetController {
  constructor(private readonly betService: BetService) {}

  /* Get user data from auth token */
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UserAuth()
  @Post('submit')
  async submitPrediction(
    @Body() userExpectationDto: UserPredictionDto,
    @UserEntity() user: UserPayload,
  ): Promise<boolean> {
    const status = await this.betService.submitPrediction(
      userExpectationDto,
      user.id,
    );
    return status;
  }
}

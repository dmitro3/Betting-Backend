import { Controller, Body, UseGuards, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { UserPayload } from '@modules/auth/dto/authorization.dto';
import { UserAuth } from '@guards/user-auth.guard';
import { UserEntity } from '@decorators/user.decorator';
import { BetSlipService } from './betSlip.service';
import { UserPredictionDto } from './dto/user-prediction.dto';

@UseGuards(ThrottlerGuard)
@ApiTags('BetSlip')
@Controller('betSlip')
export class BetSlipController {
  constructor(private readonly betSlipService: BetSlipService) {}

  /* Get user data from auth token */
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UserAuth()
  @Post('submit')
  async submitPrediction(
    @Body() userExpectationDto: UserPredictionDto,
    @UserEntity() user: UserPayload,
  ): Promise<boolean> {
    const status = await this.betSlipService.submitPrediction(
      userExpectationDto,
      user.walletAddress,
    );
    return status;
  }
}

import { Controller, Body, UseGuards, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { BetSlipGameService } from './betSlipGame.service';
import { AdminGuard } from '@guards/roles.guard';
import { ResolveGameDto } from './dto/resolve-betSlipGame.dto';

@UseGuards(ThrottlerGuard)
@ApiTags('BetSlipGame')
@Controller('betSlipGame')
export class BetSlipGameController {
  constructor(private readonly betSlipGameService: BetSlipGameService) {}

  /* Get user data from auth token */
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @AdminGuard()
  @Post('resolve')
  async submitPrediction(@Body() data: ResolveGameDto): Promise<boolean> {
    const status = await this.betSlipGameService.resolve(data.betSlipGameId);
    return status;
  }
}

import { Module } from '@nestjs/common';
import { BetSlipGameController } from './betSlipGame.controller';
import { BetSlipGameService } from './betSlipGame.service';

@Module({
  providers: [BetSlipGameService],
  controllers: [BetSlipGameController],
})
export class BetModule {}

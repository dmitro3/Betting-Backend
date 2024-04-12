import { Module } from '@nestjs/common';
import { BetSlipController } from './betSlip.controller';
import { BetSlipService } from './betSlip.service';

@Module({
  controllers: [BetSlipController],
  providers: [BetSlipService],
})
export class BetModule {}

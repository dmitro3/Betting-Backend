import { Module } from '@nestjs/common';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';

@Module({
  providers: [MatchService],
  controllers: [MatchController],
})
export class GameModule {}

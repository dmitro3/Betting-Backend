import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GameService } from './game.service';
import { AdminGuard } from '@guards/roles.guard';
import { CreateGameDto } from './dto/create-game.dto';

@UseGuards(ThrottlerGuard)
@ApiTags('Game')
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  /* Get specific game unique id */
  @Get('get/:id')
  async findOne(@Param('id') id: string): Promise<any> {
    const game = await this.gameService.findOne(id);
    return game;
  }

  /* Create new game */
  @AdminGuard()
  @Post('create')
  async create(@Body() data: CreateGameDto): Promise<any> {
    const game = await this.gameService.create(data);
    return game;
  }

  /* Delete game */
  @AdminGuard()
  @Patch('delete/:id')
  async delete(@Param('id') id: string) {
    return await this.gameService.delete(id);
  }
}

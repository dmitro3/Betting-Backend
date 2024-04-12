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
import { AdminGuard } from '@guards/roles.guard';
import { CreateMatchDto } from './dto/create-match.dto';
import { MatchService } from './match.service';

@UseGuards(ThrottlerGuard)
@ApiTags('Match')
@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  /* Get specific game unique id */
  @Get('get/:id')
  async findOne(@Param('id') id: string): Promise<any> {
    const game = await this.matchService.findById(id);
    return game;
  }

  /* Create new game */
  @AdminGuard()
  @Post('create')
  async create(@Body() data: CreateMatchDto): Promise<any> {
    const game = await this.matchService.create(data);
    return game;
  }

  /* Delete game */
  @AdminGuard()
  @Patch('delete/:id')
  async delete(@Param('id') id: string) {
    return await this.matchService.delete(id);
  }
}

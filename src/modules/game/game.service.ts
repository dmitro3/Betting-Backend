import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { uuid } from '@utils/generator';
import { CreateGameDto } from './dto/create-game.dto';

@Injectable()
export class GameService {
  private logger = new Logger(GameService.name);
  constructor(private readonly prisma: PrismaService) {}

  findOne = async (gameId: string) => {
    return await this.prisma.game.findUnique({
      where: {
        id: gameId,
      },
    });
  };

  create = async (data: CreateGameDto) => {
    return await this.prisma.game.create({
      data: {
        id: uuid(),
        opponent1: data.opponent1,
        opponent2: data.opponent2,
        result: data.result,
        leage: data.leage,
      },
    });
  };

  delete = async (gameId: string) => {
    return await this.prisma.game.delete({
      where: {
        id: gameId,
      },
    });
  };
}

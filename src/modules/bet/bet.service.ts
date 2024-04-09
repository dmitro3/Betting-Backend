import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class BetService {
  private logger = new Logger(BetService.name);
  constructor(private readonly prisma: PrismaService) {}
}

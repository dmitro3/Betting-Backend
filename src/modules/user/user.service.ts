import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'nestjs-prisma';
import { subDays } from 'date-fns';
import { UpdateUserDto } from '@modules/user/dto/update-user.dto';
import { validateName } from '@utils/user';
import { AuthService } from '../auth/auth.service';
import { insensitive } from '@utils/lodash';
import { UserFilterParams } from './dto/user-params.dto';
import { EmailPayload, UserPayload } from '../auth/dto/authorization.dto';
import { generateRandomNonce, uuid } from '@utils/generator';
import { RegisterDto } from '@modules/auth/dto/register.dto';
import { LoginDto } from '@modules/auth/dto/login.dto';
import { validateEd25519Address, verifySignature } from '@utils/solana';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async register({ walletAddress }: RegisterDto) {
    this.logger.log(
      `${'*'.repeat(20)} register(${walletAddress}) ${'*'.repeat(20)}`,
    );

    const isValid = validateEd25519Address(walletAddress);
    if (!isValid)
      throw new BadRequestException('Provided wallet address is invalid.');

    const nonce = generateRandomNonce();

    let user = await this.prisma.user.findUnique({
      where: {
        walletAddress,
      },
    });
    if (user) {
      await this.prisma.user.update({
        where: { walletAddress },
        data: { nonce },
      });
    } else {
      const newUserId = uuid();
      await this.prisma.user.create({
        data: {
          id: newUserId,
          name: newUserId,
          nonce: nonce,
          walletAddress: walletAddress,
        },
      });
    }

    return nonce;
  }

  async login(loginDto: LoginDto) {
    const { walletAddress, signature } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user)
      throw new BadRequestException('Provided walletAddress is invalid.');

    const isValid = await verifySignature(
      user.walletAddress,
      user.nonce,
      signature,
    );
    if (!isValid)
      throw new HttpException(
        'Provided signature is invalid',
        HttpStatus.EXPECTATION_FAILED,
      );

    return this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });
  }

  async findAll(query: UserFilterParams) {
    const users = await this.prisma.user.findMany({
      skip: query?.skip,
      take: query?.take,
      where: { deletedAt: null },
    });

    return users;
  }

  async findMe(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user;
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    } else return user;
  }

  async findByName(name: string) {
    const user = await this.prisma.user.findFirst({
      where: { name: insensitive(name) },
    });

    if (!user) {
      throw new NotFoundException(`User with name ${name} does not exist`);
    } else return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { name } = updateUserDto;

    const user = await this.findOne(id);
    const isNameUpdated = name && user.name !== name;

    if (isNameUpdated) {
      validateName(name);
      await this.throwIfNameTaken(name);
      await this.prisma.user.update({
        where: { id },
        data: { name },
      });
    }

    const updatedUser = await this.prisma.user.findUnique({ where: { id } });
    return updatedUser;
  }

  async throwIfNameTaken(name: string) {
    const user = await this.prisma.user.findFirst({
      where: { name: insensitive(name) },
    });

    if (user) throw new BadRequestException(`${name} already taken`);
  }

  async pseudoDelete(id: string) {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return user;
    } catch {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  async pseudoRecover(id: string) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: { deletedAt: null },
      });
    } catch {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  protected async bumpNewUsersWithUnverifiedEmails() {
    const newUnverifiedUsers = await this.prisma.user.findMany({
      where: {
        AND: [
          // created more than 3 days ago
          { createdAt: { lte: subDays(new Date(), 3) } },
          // created not longer than 4 days ago
          { createdAt: { gte: subDays(new Date(), 4) } },
        ],
      },
    });

    return newUnverifiedUsers;
  }
}

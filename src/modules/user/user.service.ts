import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { subDays } from 'date-fns';
import { UpdateUserDto } from '@modules/user/dto/update-user.dto';
import { validateName } from '@utils/user';
import { insensitive } from '@utils/lodash';
import { UserFilterParams } from './dto/user-params.dto';
import { generateRandomNonce, uuid } from '@utils/generator';
import { RegisterDto } from '@modules/auth/dto/register.dto';
import { LoginDto } from '@modules/auth/dto/login.dto';
import { validateEd25519Address, verifySignature } from '@utils/solana';
import { User } from './user.schema';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async register({ walletAddress }: RegisterDto) {
    this.logger.log(
      `${'*'.repeat(20)} register(${walletAddress}) ${'*'.repeat(20)}`,
    );

    const isValid = validateEd25519Address(walletAddress);
    if (!isValid)
      throw new BadRequestException('Provided wallet address is invalid.');

    const nonce = generateRandomNonce();

    let user = await this.userModel.findOne({
      walletAddress,
    });
    if (user) {
      await this.userModel.findOneAndUpdate({ walletAddress }, { nonce });
    } else {
      const name = uuid();
      // this.userModel.crea
      await this.userModel.create({
        walletAddress,
        name,
        nonce,
      });
    }

    return nonce;
  }

  async login(loginDto: LoginDto) {
    const { walletAddress, signature } = loginDto;

    const user = await this.userModel.findOne({
      walletAddress,
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

    return this.userModel.findByIdAndUpdate(
      user.id,
      {
        lastLogin: new Date(),
      },
      { new: true },
    );
  }

  async findAll(query: UserFilterParams) {
    const users = await this.userModel.find(
      { deletedAt: null },
      { skip: query?.skip, take: query?.take },
    );

    return users;
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    } else return user;
  }

  async findByWalletAddress(walletAddress: string) {
    const user = await this.userModel.findOne({
      walletAddress: walletAddress.toLowerCase(),
    });

    if (!user) {
      throw new NotFoundException(
        `User with wallet ${walletAddress} does not exist`,
      );
    } else return user;
  }

  async findByName(name: string) {
    const user = await this.userModel.findOne({
      name: insensitive(name),
    });

    if (!user) {
      throw new NotFoundException(`User with name ${name} does not exist`);
    } else return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { name } = updateUserDto;

    const user = await this.findById(id);
    const isNameUpdated = name && user.name !== name;

    if (isNameUpdated) {
      validateName(name);
      await this.throwIfNameTaken(name);
      const updatedUser = await this.userModel.findByIdAndUpdate(
        id,
        { name },
        { new: true },
      );
      return updatedUser;
    } else throw new BadRequestException(`${name} is invalid`);
  }

  async throwIfNameTaken(name: string) {
    const user = await this.userModel.findOne({
      name: insensitive(name),
    });

    if (user) throw new BadRequestException(`${name} already taken`);
  }

  async delete(id: string) {
    try {
      const user = await this.userModel.findByIdAndDelete(id, {
        deletedAt: new Date(),
      });

      return user;
    } catch {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  async recover(id: string) {
    try {
      return await this.userModel.findByIdAndUpdate(id, { deletedAt: null });
    } catch {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  protected async bumpNewUsersWithUnverifiedEmails() {
    const newUnverifiedUsers = await this.userModel.find({
      // created more than 3 days ago && not longer than 4 days ago
      createdAt: { lte: subDays(new Date(), 3), gte: subDays(new Date(), 4) },
    });

    return newUnverifiedUsers;
  }
}

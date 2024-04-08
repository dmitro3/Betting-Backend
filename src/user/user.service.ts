import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'nestjs-prisma';
import { User } from '@prisma/client';
import { isEmail } from 'class-validator';
import { subDays } from 'date-fns';
import { UpdateUserDto } from '../types/update-user.dto';
import { RegisterDto } from '../types/register.dto';
import { LoginDto } from '../types/login.dto';
import {
  ResetPasswordDto,
  UpdatePasswordDto,
} from '../types/update-password.dto';
import { validateEmail, validateName } from '../utils/user';
import { WalletService } from '../wallet/wallet.service';
import { PasswordService } from '../auth/password.service';
import { AuthService } from '../auth/auth.service';
import { insensitive } from '../utils/lodash';
import { UserFilterParams } from './dto/user-params.dto';
import { EmailPayload, UserPayload } from '../auth/dto/authorization.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly passwordService: PasswordService,
    private readonly authService: AuthService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;

    validateName(name);
    validateEmail(email);

    const [hashedPassword] = await Promise.all([
      password && this.passwordService.hash(password),
      this.throwIfNameTaken(name),
      this.throwIfEmailTaken(email),
    ]);

    const user = await this.prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    return user;
  }

  async login(loginDto: LoginDto) {
    const { nameOrEmail, password } = loginDto;

    if (!nameOrEmail) {
      throw new BadRequestException('Please provide email or username');
    }

    let user: User;
    if (isEmail(nameOrEmail)) {
      user = await this.findByEmail(nameOrEmail);
    } else {
      user = await this.findByName(nameOrEmail);
    }

    if (!user.password.length) {
      throw new BadRequestException(
        'This account is already linked to a Google Account. Please use google sign in.',
      );
    }

    await this.passwordService.validate(password, user.password);
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

  async findMe(id: number) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { lastActiveAt: new Date() },
    });

    return user;
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    } else return user;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email: insensitive(email) },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} does not exist`);
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

  async getWallets(userId: number) {
    const wallets = await this.prisma.wallet.findMany({
      where: { userId },
      orderBy: { address: 'asc' },
    });

    return wallets;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { name, email } = updateUserDto;

    const user = await this.findOne(id);
    const isEmailUpdated = email && user.email !== email;
    const isNameUpdated = name && user.name !== name;

    if (isEmailUpdated) {
      validateEmail(email);
      await this.throwIfEmailTaken(email);

      await this.prisma.user.update({
        where: { id },
        data: { email, emailVerifiedAt: null },
      });
    }

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

  async updatePassword(id: number, updatePasswordDto: UpdatePasswordDto) {
    const { oldPassword, newPassword } = updatePasswordDto;

    const user = await this.findOne(id);

    const [hashedPassword] = await Promise.all([
      this.passwordService.hash(newPassword),
      this.passwordService.validate(oldPassword, user.password),
    ]);

    if (oldPassword === newPassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return updatedUser;
  }

  async requestPasswordReset(nameOrEmail: string) {
    let user: User;
    if (isEmail(nameOrEmail)) {
      user = await this.findByEmail(nameOrEmail);
    } else {
      user = await this.findByName(nameOrEmail);
    }

    const verificationToken = this.authService.generateEmailToken(
      user.id,
      user.email,
      '10min',
    );
    return verificationToken;
  }

  async resetPassword({ verificationToken, newPassword }: ResetPasswordDto) {
    let payload: EmailPayload;

    try {
      payload = this.authService.verifyEmailToken(verificationToken);
    } catch (e) {
      // resend 'request password reset' email if token verification failed
      this.requestPasswordReset(payload.email);
      throw e;
    }

    const user = await this.findOne(payload.id);

    const hashedPassword = await this.passwordService.hash(newPassword);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return user;
  }

  async requestEmailVerification(email: string) {
    const user = await this.findByEmail(email);

    if (!!user.emailVerifiedAt) {
      throw new BadRequestException('Email already verified');
    }

    return true;
  }

  async requestEmailChange({ email, id }: UserPayload, newEmail: string) {
    if (email === newEmail) {
      throw new BadRequestException(
        `Email must be different from the current email.`,
      );
    }
    validateEmail(newEmail);
    await this.throwIfEmailTaken(newEmail);

    const user = await this.findOne(id);

    return user;
  }

  async verifyEmail(verificationToken: string) {
    let payload: EmailPayload;

    try {
      payload = this.authService.verifyEmailToken(verificationToken);
    } catch (e) {
      // resend 'request email verification' email if token verification failed
      this.requestEmailVerification(payload.email);
      throw e;
    }

    const user = await this.findOne(payload.id);
    validateEmail(payload.email);

    // if verificationToken holds the new email address, user has updated it
    const isEmailUpdated = user.email !== payload.email;
    if (isEmailUpdated) {
      await this.throwIfEmailTaken(payload.email); // make sure new email is not taken
    } else if (!!user.emailVerifiedAt) {
      // if email is not updated, stop here if it's already verified
      throw new BadRequestException('Email already verified');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: payload.id },
      data: { email: payload.email, emailVerifiedAt: new Date() },
    });

    if (isEmailUpdated) {
      // to-do list
    }

    return updatedUser;
  }

  async throwIfNameTaken(name: string) {
    const user = await this.prisma.user.findFirst({
      where: { name: insensitive(name) },
    });

    if (user) throw new BadRequestException(`${name} already taken`);
  }

  async throwIfEmailTaken(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email: insensitive(email) },
    });

    if (user) throw new BadRequestException(`${email} already taken`);
  }

  async validateSagaUser(id: number) {
    const wallets = await this.prisma.wallet.findMany({
      where: { user: { id } },
    });

    let userHasSaga = false;
    for (const wallet of wallets) {
      const walletHasSaga = await this.walletService.hasSagaGenesisToken(
        wallet.address,
      );

      if (walletHasSaga) {
        userHasSaga = true;
        break;
      }
    }

    if (!userHasSaga) throw new BadRequestException('No SGT Token found');
  }

  async pseudoDelete(id: number) {
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

  async pseudoRecover(id: number) {
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
    // const newUnverifiedUsers = await this.prisma.user.findMany({
    //   where: {
    //     emailVerifiedAt: null,
    //     createdAt: { lte: subDays(new Date(), 3), gte: subDays(new Date(), 4) },
    //   },
    // });

    const newUnverifiedUsers = await this.prisma.user.findMany({
      where: {
        AND: [
          { emailVerifiedAt: null },
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

import {
  UnauthorizedException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'nestjs-prisma';
import { User } from '@prisma/client';
import { pick } from 'lodash';
import { JwtDto, JwtPayload } from './dto/authorization.dto';
import { ConfigService } from '@nestjs/config';
import { SecurityConfig } from '@configs/config.interface';

const sanitizePayload = (payload: JwtPayload) => {
  return pick(payload, 'type', 'id', 'email', 'name', 'role');
};

// One day  we can consider splitting this into two passport strategies
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  authorizeUser(user: User) {
    return {
      accessToken: this.generateAccessToken({ ...user, type: 'user' }),
      refreshToken: this.generateRefreshToken({ ...user, type: 'user' }),
    };
  }

  private generateAccessToken(payload: JwtPayload): string {
    const sanitizedPayload = sanitizePayload(payload);
    const accessToken = `Bearer ${this.jwtService.sign(sanitizedPayload)}`;
    return accessToken;
  }

  private generateRefreshToken(payload: JwtPayload): string {
    const sanitizedPayload = sanitizePayload(payload);
    const securityConfig = this.configService.get<SecurityConfig>('security');

    const refreshToken = this.jwtService.sign(sanitizedPayload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: securityConfig.refreshIn,
    });

    return refreshToken;
  }

  async refreshAccessToken(token: string) {
    let jwtDto: JwtDto;
    try {
      jwtDto = this.jwtService.verify<JwtDto>(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Authorization expired');
    }

    if (jwtDto.type === 'user') {
      const user = await this.prisma.user.update({
        where: { id: jwtDto.id },
        data: { lastLogin: new Date() },
      });

      return this.generateAccessToken({ ...user, type: 'user' });
    }
  }

  async validateJwt(jwtDto: JwtDto): Promise<JwtPayload> {
    if (jwtDto.type === 'user') {
      const user = await this.prisma.user.findUnique({
        where: { id: jwtDto.id },
      });

      if (!user) throw new NotFoundException('User not found');
      return { ...user, type: 'user' };
    } else {
      throw new ForbiddenException('Authorization type unknown');
    }
  }
}

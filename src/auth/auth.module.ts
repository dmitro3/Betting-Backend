import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { SecurityConfig, ThrottleConfig } from '../configs/config.interface';
import { PasswordService } from './password.service';
import { UserService } from '../user/user.service';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const securityConfig = configService.get<SecurityConfig>('security');
        return {
          secret: configService.get<string>('JWT_ACCESS_SECRET'),
          signOptions: { expiresIn: securityConfig.expiresIn },
        };
      },
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const throttleConfig = configService.get<ThrottleConfig>('throttle');
        return [
          {
            ttl: throttleConfig.ttl,
            limit: throttleConfig.limit,
            ignoreUserAgents: throttleConfig.ignoreUserAgents,
          },
        ];
      },
    }),
    WalletModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, PasswordService, JwtStrategy, UserService],
  exports: [AuthService, PasswordService, JwtStrategy],
})
export class AuthModule {}

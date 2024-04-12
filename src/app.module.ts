import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '@modules/auth/auth.module';
import config from '@configs/config';
import { SecurityConfig, ThrottleConfig } from '@configs/config.interface';
import { UserModule } from '@modules/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { BetModule } from '@modules/betslip/betSlip.module';
import { BetSlipGame } from '@modules/betSlipGame/betSlipGame.schema';
import { Match } from '@modules/match/match.schema';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
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
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return configService.get('database');
      },
    }),
    ScheduleModule.forRoot(),
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
    UserModule,
    BetModule,
    BetSlipGame,
    Match,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

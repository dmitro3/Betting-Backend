import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiTags } from '@nestjs/swagger';
import { toWalletDto, toWalletDtoArray, WalletDto } from './dto/wallet.dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { memoizeThrottle } from '../utils/lodash';
import { WalletOwnerAuth } from '../guards/wallet-owner.guard';
import { UpdateWalletDto } from './dto/update-wallet.dto';

@UseGuards(ThrottlerGuard)
@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  /* Get all wallets */
  @Get('get')
  async findAll(): Promise<WalletDto[]> {
    const wallets = await this.walletService.findAll();
    return toWalletDtoArray(wallets);
  }

  /* Get specific wallet by unique address */
  @Get('get/:address')
  async findOne(@Param('address') address: string): Promise<WalletDto> {
    const wallet = await this.walletService.findOne(address);
    return toWalletDto(wallet);
  }

  /* Update specific wallet */
  @WalletOwnerAuth()
  @Patch('update/:address')
  async update(
    @Param('address') address: string,
    @Body() updateWalletDto: UpdateWalletDto,
  ): Promise<WalletDto> {
    const wallet = await this.walletService.update(address, updateWalletDto);
    return toWalletDto(wallet);
  }
}

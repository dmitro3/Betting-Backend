import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Metaplex, isMetadata } from '@metaplex-foundation/js';
import { PublicKey } from '@solana/web3.js';
import { fetchOffChainMetadata } from '../utils/nft-metadata';
import {
  FREE_MINT_GROUP_LABEL,
  REFERRAL_REWARD_GROUP_LABEL,
  REFERRAL_REWARD_THRESHOLD,
  SAGA_COLLECTION_ADDRESS,
} from '../constants';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { hasCompletedSetup } from '../utils/user';

@Injectable()
export class WalletService {
  private readonly metaplex: Metaplex;

  constructor(private readonly prisma: PrismaService) {}

  async update(address: string, updateWalletDto: UpdateWalletDto) {
    try {
      const updatedWallet = await this.prisma.wallet.update({
        where: { address },
        data: updateWalletDto,
      });

      return updatedWallet;
    } catch {
      throw new NotFoundException(`Wallet with address ${address} not found`);
    }
  }

  async findAll() {
    const wallets = await this.prisma.wallet.findMany();
    return wallets;
  }

  async findOne(address: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { address },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet ${address} not found`);
    } else return wallet;
  }

  /** Check if wallet has SGT NFT */
  async hasSagaGenesisToken(address: string) {
    const nfts = await this.metaplex
      .nfts()
      .findAllByOwner({ owner: new PublicKey(address) });

    const sagaToken = nfts.find(
      (nft) =>
        nft.collection &&
        nft.collection.address.toString() === SAGA_COLLECTION_ADDRESS &&
        nft.collection.verified,
    );

    return !!sagaToken;
  }
}

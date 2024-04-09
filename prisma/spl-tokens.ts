import { WRAPPED_SOL_MINT } from '@metaplex-foundation/js';
import { Prisma } from '@prisma/client';

export const splTokensToSeed: Prisma.SplTokenCreateManyArgs['data'] = [
  {
    id: 'ua73-ad8j-a82j-kkk2',
    name: 'Wrapped Sol',
    address: WRAPPED_SOL_MINT.toBase58(),
    priority: 1,
    symbol: '$SOL',
    decimals: 9,
    icon: 'spl-tokens/wrapped-sol/icon.png',
  },
  {
    id: 'ua73-ad8j-a82j-kkk2',
    name: 'USD Coin',
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    priority: 2,
    symbol: '$USDC',
    decimals: 6,
    icon: 'spl-tokens/usd-coin/icon.png',
  },
  {
    id: 'ua73-ad8j-a82j-kkk2',
    name: 'NANA Token',
    address: 'HxRELUQfvvjToVbacjr9YECdfQMUqGgPYB68jVDYxkbr',
    priority: 3,
    symbol: '$NANA',
    decimals: 9,
    icon: 'spl-tokens/nana-token/icon.png',
  },
  {
    id: 'ua73-ad8j-a82j-kkk2',
    name: 'COCO Token',
    address: '74DSHnK1qqr4z1pXjLjPAVi8XFngZ635jEVpdkJtnizQ',
    priority: 3,
    symbol: '$COCO',
    decimals: 5,
    icon: 'spl-tokens/coco-token/icon.png',
  },
];

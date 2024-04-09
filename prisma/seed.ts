import { PrismaClient } from '@prisma/client';
import { usersToSeed } from './users';
import { splTokensToSeed } from './spl-tokens';

const prisma = new PrismaClient();
const isDevnet = process.env.SOLANA_CLUSTER === 'devnet';

async function main() {
  if (!isDevnet) {
    throw new Error(`Are you seeding on mainnet 😨 ? I can't allow that.`);
  }
  if (!process.env.WEBHOOK_ID) {
    throw new Error('process.env.WEBHOOK_ID undefined');
  }

  console.info('Emptying the database...');
  await prisma.user.deleteMany();
  await prisma.splToken.deleteMany();
  console.info('Emptied database!');

  // SEED USERS
  await prisma.user.createMany({ data: await usersToSeed() });
  console.info('Added users');

  // SEED SUPPORTED SPL TOKENS
  await prisma.splToken.createMany({ data: splTokensToSeed });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

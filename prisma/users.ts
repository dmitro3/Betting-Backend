import { Prisma, Role } from '@prisma/client';
import { faker } from '@faker-js/faker';
import config from '../src/configs/config';
import * as bcrypt from 'bcrypt';

const saltOrRound = config().security.bcryptSaltOrRound;
const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, saltOrRound);
};

// Don't worry champs, these passwords are used only for localhost seeding
export const usersToSeed = async (): Promise<
  Prisma.UserCreateManyArgs['data']
> => [
  {
    id: 'ua73-ad8j-a82j-kkk2',
    walletAddress: '5x4DyBUsJFYuBFBUstXVraoGG9RtzPEJqaL4F8u637vt',
    name: 'superadmin',
    role: Role.Superadmin,
  },
  {
    id: 'A98Z-a82j-kkk2-ad8j',
    walletAddress: 'F2pmrUchaCWys2G5XDpAAdd1wKPcrBkbQWCTAWwTAJ7B',
    name: 'admin',
    role: Role.Admin,
  },
  {
    id: 'B98Z-a82j-kkk2-ad8j',
    walletAddress: '6AtKiRvb9jJxcdwpYVYH6V7YvrCf66nurFoPBhZDB9vh',
    name: 'josip',
  },
  {
    id: 'C98Z-a82j-kkk2-ad8j',
    walletAddress: '3kyio5QtGG3gwJnqAReWjSWNyc8ssQv6qFsp3MVZ2dqw',
    name: 'luka',
  },
  {
    id: 'D98Z-a82j-kkk2-ad8j',
    walletAddress: '8EoHYKeNj6CUX2gKaTAYVd6d9FsfGaoUyQh1csxSx9qd',
    name: 'testgoogleplay',
  },
];

const generateDummyUserData = (): Prisma.UserCreateArgs['data'] => {
  return {
    id: faker.database.mongodbObjectId(),
    walletAddress: faker.finance.bitcoinAddress(),
    name: faker.internet.userName(),
  };
};

export const generateDummyUsersData = (
  count: number,
): Prisma.UserCreateArgs['data'][] => {
  return faker.helpers.multiple(generateDummyUserData, { count });
};

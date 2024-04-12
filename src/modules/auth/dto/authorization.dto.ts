import { User } from '@modules/user/user.schema';

export class Authorization {
  accessToken: string;
  refreshToken: string;
}

export type BaseJwtPayload = {
  /** Issued at */
  iat: number;
  /** Expiration time */
  exp: number;
};

export type UserPayload = {
  walletAddress: User['walletAddress'];
  name: User['name'];
  role: User['role'];
};

export type JwtPayload = UserPayload;
export type JwtDto = JwtPayload & BaseJwtPayload;

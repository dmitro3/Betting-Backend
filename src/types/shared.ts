import {
  DefaultCandyGuardSettings,
  MetaplexFile,
  UploadMetadataOutput,
} from '@metaplex-foundation/js';
import { User } from '@modules/user/user.schema';

export type PickByType<T, V> = {
  [P in keyof T as T[P] extends V | undefined ? P : never]: T[P];
};

export type CoverFiles = {
  usedSigned: MetaplexFile;
  unusedSigned: MetaplexFile;
  usedUnsigned: MetaplexFile;
  unusedUnsigned: MetaplexFile;
};

export type ItemMetadata = {
  metadata: UploadMetadataOutput;
  isUsed: boolean;
  isSigned: boolean;
};

export type PickFields<T, K extends keyof T> = K;

export type LegacyGuardGroup = {
  label: string;
  guards: Partial<DefaultCandyGuardSettings>;
};

export type Merge<T, U> = Omit<T, keyof U> & U;

export type With<T extends any[]> = T extends [infer First, ...infer Rest]
  ? Merge<First, With<Rest>>
  : object;

export type Referee = User;

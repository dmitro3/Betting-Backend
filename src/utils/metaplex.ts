import { MetaplexFile } from '@metaplex-foundation/js';
import { Connection } from '@solana/web3.js';

export type MetdataFile = {
  type?: string;
  uri?: MetaplexFile | string;
  [key: string]: unknown;
};

export function getConnection(customEndpoint?: string) {
  const endpoint = customEndpoint;
  const connection = new Connection(endpoint, 'confirmed');
  return connection;
}

export function writeFiles(...files: MetaplexFile[]): MetdataFile[] {
  return files.map((file) => ({
    uri: file,
    type: file.contentType,
  }));
}

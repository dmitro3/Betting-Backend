import { PublicKey } from '@solana/web3.js';

export const validateEd25519Address = (address: string) => {
  try {
    const isValidAddress = PublicKey.isOnCurve(address);
    if (isValidAddress) return true;
    else return false;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const verifySignature = (
  address: string,
  nonce: string,
  signature: string,
) => {
  // to do list
  return true;
};

/*
  Warnings:

  - You are about to drop the column `vaultId` on the `BetSlip` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Vault" DROP CONSTRAINT "Vault_betSlipId_fkey";

-- AlterTable
ALTER TABLE "BetSlip" DROP COLUMN "vaultId";

-- AlterTable
ALTER TABLE "BetSlipGame" ADD COLUMN     "vaultId" INTEGER;

-- AlterTable
ALTER TABLE "Vault" ADD COLUMN     "betSlipGameId" TEXT;

-- AddForeignKey
ALTER TABLE "Vault" ADD CONSTRAINT "Vault_betSlipGameId_fkey" FOREIGN KEY ("betSlipGameId") REFERENCES "BetSlipGame"("id") ON DELETE SET NULL ON UPDATE CASCADE;

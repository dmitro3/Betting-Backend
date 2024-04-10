/*
  Warnings:

  - You are about to drop the column `splTokenId` on the `BetSlip` table. All the data in the column will be lost.
  - You are about to drop the column `betSlipId` on the `BetSlipGame` table. All the data in the column will be lost.
  - You are about to drop the column `vaultId` on the `BetSlipGame` table. All the data in the column will be lost.
  - You are about to drop the `Vault` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `splTokenId` to the `BetSlipGame` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenAmount` to the `BetSlipGame` table without a default value. This is not possible if the table is not empty.
  - Added the required column `v10Right` to the `BetSlipGame` table without a default value. This is not possible if the table is not empty.
  - Added the required column `v11Right` to the `BetSlipGame` table without a default value. This is not possible if the table is not empty.
  - Added the required column `v12Right` to the `BetSlipGame` table without a default value. This is not possible if the table is not empty.
  - Added the required column `v13Right` to the `BetSlipGame` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BetSlip" DROP CONSTRAINT "BetSlip_splTokenId_fkey";

-- DropForeignKey
ALTER TABLE "Vault" DROP CONSTRAINT "Vault_betSlipGameId_fkey";

-- AlterTable
ALTER TABLE "BetSlip" DROP COLUMN "splTokenId";

-- AlterTable
ALTER TABLE "BetSlipGame" DROP COLUMN "betSlipId",
DROP COLUMN "vaultId",
ADD COLUMN     "numberOfParticipants" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "splTokenId" TEXT NOT NULL,
ADD COLUMN     "tokenAmount" INTEGER NOT NULL,
ADD COLUMN     "v10Right" INTEGER NOT NULL,
ADD COLUMN     "v11Right" INTEGER NOT NULL,
ADD COLUMN     "v12Right" INTEGER NOT NULL,
ADD COLUMN     "v13Right" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Vault";

-- AddForeignKey
ALTER TABLE "BetSlipGame" ADD CONSTRAINT "BetSlipGame_splTokenId_fkey" FOREIGN KEY ("splTokenId") REFERENCES "SplToken"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[address]` on the table `SplToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "Prediction" (
    "id" TEXT NOT NULL,
    "first" BOOLEAN NOT NULL,
    "equal" BOOLEAN NOT NULL,
    "second" BOOLEAN NOT NULL,
    "betSlipId" TEXT,

    CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Prediction_id_key" ON "Prediction"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SplToken_address_key" ON "SplToken"("address");

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_betSlipId_fkey" FOREIGN KEY ("betSlipId") REFERENCES "BetSlip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

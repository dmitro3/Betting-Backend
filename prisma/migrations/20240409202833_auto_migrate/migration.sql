-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Superadmin', 'Admin', 'Tester', 'User');

-- CreateEnum
CREATE TYPE "GlobalStatusType" AS ENUM ('Success', 'Info', 'Warning', 'Maintenance');

-- CreateEnum
CREATE TYPE "BetSlipStatusType" AS ENUM ('Deposited', 'Pending', 'Resolved');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'User',
    "deletedAt" TIMESTAMP(3),
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BetSlipGame" (
    "id" TEXT NOT NULL,
    "betSlipId" INTEGER,
    "gameId" INTEGER,
    "home" BOOLEAN NOT NULL,
    "away" BOOLEAN NOT NULL,
    "draw" BOOLEAN NOT NULL,
    "gameResult" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BetSlipGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BetSlip" (
    "id" TEXT NOT NULL,
    "totalWager" DOUBLE PRECISION NOT NULL,
    "status" "BetSlipStatusType" NOT NULL,
    "finalResults" INTEGER[],
    "userId" TEXT,
    "splTokenId" TEXT NOT NULL,
    "betSlipGameId" TEXT,
    "vaultId" INTEGER,
    "totalWin" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BetSlip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vault" (
    "id" TEXT NOT NULL,
    "numberOfParticipants" INTEGER NOT NULL DEFAULT 0,
    "tokenAmount" INTEGER NOT NULL,
    "v13Right" INTEGER NOT NULL,
    "v12Right" INTEGER NOT NULL,
    "v11Right" INTEGER NOT NULL,
    "v10Right" INTEGER NOT NULL,
    "betSlipId" TEXT,

    CONSTRAINT "Vault_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "betSlipGameId" TEXT,
    "opponent1" TEXT NOT NULL,
    "opponent2" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result" TEXT NOT NULL,
    "leage" TEXT NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leaderboard" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "points" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SplToken" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "symbol" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "icon" TEXT NOT NULL,

    CONSTRAINT "SplToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNotification" (
    "userId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "UserNotification_pkey" PRIMARY KEY ("userId","notificationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_nonce_key" ON "User"("nonce");

-- CreateIndex
CREATE UNIQUE INDEX "BetSlipGame_id_key" ON "BetSlipGame"("id");

-- CreateIndex
CREATE UNIQUE INDEX "BetSlip_id_key" ON "BetSlip"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Vault_id_key" ON "Vault"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Game_id_key" ON "Game"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Leaderboard_id_key" ON "Leaderboard"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_id_key" ON "Transaction"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SplToken_id_key" ON "SplToken"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_id_key" ON "Notification"("id");

-- AddForeignKey
ALTER TABLE "BetSlip" ADD CONSTRAINT "BetSlip_splTokenId_fkey" FOREIGN KEY ("splTokenId") REFERENCES "SplToken"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BetSlip" ADD CONSTRAINT "BetSlip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BetSlip" ADD CONSTRAINT "BetSlip_betSlipGameId_fkey" FOREIGN KEY ("betSlipGameId") REFERENCES "BetSlipGame"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vault" ADD CONSTRAINT "Vault_betSlipId_fkey" FOREIGN KEY ("betSlipId") REFERENCES "BetSlip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_betSlipGameId_fkey" FOREIGN KEY ("betSlipGameId") REFERENCES "BetSlipGame"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leaderboard" ADD CONSTRAINT "Leaderboard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotification" ADD CONSTRAINT "UserNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotification" ADD CONSTRAINT "UserNotification_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

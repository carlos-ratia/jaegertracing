/*
  Warnings:

  - You are about to drop the `Trace` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `Trace`;

-- CreateTable
CREATE TABLE `ReportTrace` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `eType` VARCHAR(191) NOT NULL,
    `eId` VARCHAR(191) NOT NULL,
    `trace` JSON NOT NULL,
UNIQUE INDEX `idxInsert`(`eType`, `eId`),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

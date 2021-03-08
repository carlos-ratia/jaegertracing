-- CreateTable
CREATE TABLE `Tracer` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `eType` VARCHAR(191) NOT NULL,
    `eId` VARCHAR(191) NOT NULL,
    `trace` JSON NOT NULL,
UNIQUE INDEX `idxInsert`(`eType`, `eId`),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

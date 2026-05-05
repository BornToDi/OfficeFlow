-- CreateTable
CREATE TABLE `SupervisorChangeRequest` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `currentSupervisorId` VARCHAR(191) NULL,
    `newSupervisorId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `reason` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `approvedAt` DATETIME(3) NULL,
    `approvedById` VARCHAR(191) NULL,

    INDEX `SupervisorChangeRequest_employeeId_idx`(`employeeId`),
    INDEX `SupervisorChangeRequest_currentSupervisorId_idx`(`currentSupervisorId`),
    INDEX `SupervisorChangeRequest_newSupervisorId_idx`(`newSupervisorId`),
    INDEX `SupervisorChangeRequest_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SupervisorChangeRequest` ADD CONSTRAINT `SupervisorChangeRequest_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupervisorChangeRequest` ADD CONSTRAINT `SupervisorChangeRequest_currentSupervisorId_fkey` FOREIGN KEY (`currentSupervisorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupervisorChangeRequest` ADD CONSTRAINT `SupervisorChangeRequest_newSupervisorId_fkey` FOREIGN KEY (`newSupervisorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupervisorChangeRequest` ADD CONSTRAINT `SupervisorChangeRequest_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

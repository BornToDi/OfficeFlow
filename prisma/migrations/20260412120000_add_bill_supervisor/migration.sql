-- Add supervisorId to Bill and FK to User
ALTER TABLE `Bill` ADD COLUMN `supervisorId` VARCHAR(191) NULL;
CREATE INDEX `Bill_supervisorId_idx` ON `Bill`(`supervisorId`);
ALTER TABLE `Bill` ADD CONSTRAINT `Bill_supervisorId_fkey` FOREIGN KEY (`supervisorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

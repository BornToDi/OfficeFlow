-- DropForeignKey
ALTER TABLE `billhistory` DROP FOREIGN KEY `BillHistory_billId_fkey`;

-- DropForeignKey
ALTER TABLE `billitem` DROP FOREIGN KEY `BillItem_billId_fkey`;

-- CreateIndex
CREATE INDEX `BillItem_date_idx` ON `BillItem`(`date`);

-- AddForeignKey
ALTER TABLE `BillItem` ADD CONSTRAINT `BillItem_billId_fkey` FOREIGN KEY (`billId`) REFERENCES `Bill`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillHistory` ADD CONSTRAINT `BillHistory_billId_fkey` FOREIGN KEY (`billId`) REFERENCES `Bill`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- -- RedefineIndex
-- CREATE INDEX `Bill_employeeId_idx` ON `Bill`(`employeeId`);
-- DROP INDEX `Bill_employeeId_fkey` ON `bill`;

-- -- RedefineIndex
-- CREATE INDEX `BillHistory_actorId_idx` ON `BillHistory`(`actorId`);
-- DROP INDEX `BillHistory_actorId_fkey` ON `billhistory`;

-- -- RedefineIndex
-- CREATE INDEX `BillHistory_billId_idx` ON `BillHistory`(`billId`);
-- DROP INDEX `BillHistory_billId_fkey` ON `billhistory`;

-- -- RedefineIndex
-- CREATE INDEX `BillItem_billId_idx` ON `BillItem`(`billId`);
-- DROP INDEX `BillItem_billId_fkey` ON `billitem`;

-- -- RedefineIndex
-- CREATE INDEX `User_supervisorId_idx` ON `User`(`supervisorId`);
-- DROP INDEX `User_supervisorId_fkey` ON `user`;

-- RedefineIndex
CREATE INDEX `Bill_employeeId_idx` ON `Bill`(`employeeId`);

-- RedefineIndex
CREATE INDEX `BillHistory_actorId_idx` ON `BillHistory`(`actorId`);

-- RedefineIndex
CREATE INDEX `BillHistory_billId_idx` ON `BillHistory`(`billId`);

-- RedefineIndex
CREATE INDEX `BillItem_billId_idx` ON `BillItem`(`billId`);

-- RedefineIndex
CREATE INDEX `User_supervisorId_idx` ON `User`(`supervisorId`);

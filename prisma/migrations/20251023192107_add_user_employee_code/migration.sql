/*
  Warnings:

  - A unique constraint covering the columns `[employeeCode]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `billhistory` MODIFY `comment` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `employeeCode` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_employeeCode_key` ON `User`(`employeeCode`);

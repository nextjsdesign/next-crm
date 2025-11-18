/*
  Warnings:

  - Made the column `formCode` on table `Device` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Device" ALTER COLUMN "formCode" SET NOT NULL;

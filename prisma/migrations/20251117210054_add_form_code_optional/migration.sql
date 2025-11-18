/*
  Warnings:

  - A unique constraint covering the columns `[formCode]` on the table `Device` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "formCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Device_formCode_key" ON "Device"("formCode");

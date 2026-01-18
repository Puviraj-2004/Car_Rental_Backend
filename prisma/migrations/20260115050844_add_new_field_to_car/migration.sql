/*
  Warnings:

  - Added the required column `brandId` to the `Car` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Car" ADD COLUMN     "brandId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Car_brandId_idx" ON "Car"("brandId");

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `userId` on the `DocumentVerification` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bookingId]` on the table `DocumentVerification` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bookingId` to the `DocumentVerification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DocumentVerification" DROP CONSTRAINT "DocumentVerification_userId_fkey";

-- DropIndex
DROP INDEX "DocumentVerification_userId_idx";

-- DropIndex
DROP INDEX "DocumentVerification_userId_key";

-- AlterTable
ALTER TABLE "DocumentVerification" DROP COLUMN "userId",
ADD COLUMN     "bookingId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DocumentVerification_bookingId_key" ON "DocumentVerification"("bookingId");

-- CreateIndex
CREATE INDEX "DocumentVerification_bookingId_idx" ON "DocumentVerification"("bookingId");

-- AddForeignKey
ALTER TABLE "DocumentVerification" ADD CONSTRAINT "DocumentVerification_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

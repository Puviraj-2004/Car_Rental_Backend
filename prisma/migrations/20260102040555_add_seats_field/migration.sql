/*
  Warnings:

  - You are about to drop the column `dropoffLocation` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `pickupLocation` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `rentalType` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `seats` to the `Car` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BookingStatus" ADD VALUE 'DRAFT';
ALTER TYPE "BookingStatus" ADD VALUE 'VERIFIED';

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "dropoffLocation",
DROP COLUMN "pickupLocation",
DROP COLUMN "rentalType";

-- AlterTable
ALTER TABLE "Car" ADD COLUMN     "seats" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "RentalType";

-- CreateTable
CREATE TABLE "BookingVerification" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookingVerification_bookingId_key" ON "BookingVerification"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "BookingVerification_token_key" ON "BookingVerification"("token");

-- AddForeignKey
ALTER TABLE "BookingVerification" ADD CONSTRAINT "BookingVerification_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

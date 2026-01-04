-- CreateEnum
CREATE TYPE "RentalType" AS ENUM ('HOUR', 'DAY', 'KM');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "dropoffLocation" TEXT,
ADD COLUMN     "pickupLocation" TEXT,
ADD COLUMN     "rentalType" "RentalType" NOT NULL DEFAULT 'DAY',
ADD COLUMN     "surchargeAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;

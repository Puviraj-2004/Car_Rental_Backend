-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('RENTAL', 'REPLACEMENT');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "bookingType" "BookingType" NOT NULL DEFAULT 'RENTAL',
ADD COLUMN     "repairOrderId" TEXT;

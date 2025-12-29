/*
  Warnings:

  - The values [KM] on the enum `RentalType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RentalType_new" AS ENUM ('HOUR', 'DAY');
ALTER TABLE "Booking" ALTER COLUMN "rentalType" TYPE "RentalType_new" USING ("rentalType"::text::"RentalType_new");
ALTER TYPE "RentalType" RENAME TO "RentalType_old";
ALTER TYPE "RentalType_new" RENAME TO "RentalType";
DROP TYPE "RentalType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "allowedKm" DOUBLE PRECISION,
ADD COLUMN     "endMeter" DOUBLE PRECISION,
ADD COLUMN     "extraKmCharge" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "extraKmUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "startMeter" DOUBLE PRECISION,
ADD COLUMN     "totalFinalPrice" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Car" ADD COLUMN     "currentMileage" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "dailyKmLimit" DOUBLE PRECISION,
ADD COLUMN     "extraKmCharge" DOUBLE PRECISION;

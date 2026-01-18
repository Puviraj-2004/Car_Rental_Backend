/*
  Warnings:

  - The `fuelType` column on the `Car` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `transmission` on the `Car` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'LPG', 'CNG');

-- CreateEnum
CREATE TYPE "Transmission" AS ENUM ('MANUAL', 'AUTOMATIC', 'CVT', 'DCT');

-- AlterTable
ALTER TABLE "Car" DROP COLUMN "transmission",
ADD COLUMN     "transmission" "Transmission" NOT NULL,
DROP COLUMN "fuelType",
ADD COLUMN     "fuelType" "FuelType";

-- AlterTable
ALTER TABLE "DocumentVerification" ADD COLUMN     "addressProofUrl" TEXT,
ADD COLUMN     "idExpiry" TIMESTAMP(3),
ADD COLUMN     "idNumber" TEXT,
ADD COLUMN     "licenseExpiry" TIMESTAMP(3),
ADD COLUMN     "licenseNumber" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "fullAddress" TEXT;

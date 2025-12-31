-- CreateEnum
CREATE TYPE "LicenseCategory" AS ENUM ('AM', 'A', 'B', 'C', 'D');

-- AlterTable
ALTER TABLE "Car" ADD COLUMN     "requiredLicenseCategory" "LicenseCategory" NOT NULL DEFAULT 'B';

-- AlterTable
ALTER TABLE "DriverProfile" ADD COLUMN     "licenseCategory" "LicenseCategory";

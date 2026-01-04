-- CreateEnum
CREATE TYPE "LicenseCategory" AS ENUM ('AM', 'A', 'B', 'C', 'D');

-- AlterTable
ALTER TABLE "Car" ADD COLUMN     "requiredLicense" "LicenseCategory" NOT NULL DEFAULT 'B';

-- AlterTable
ALTER TABLE "DocumentVerification" ADD COLUMN     "licenseCategory" "LicenseCategory" NOT NULL DEFAULT 'B';

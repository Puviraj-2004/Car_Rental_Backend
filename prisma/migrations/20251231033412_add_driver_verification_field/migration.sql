-- AlterTable
ALTER TABLE "DriverProfile" ADD COLUMN     "licenseCategories" "LicenseCategory"[],
ADD COLUMN     "restrictsToAutomatic" BOOLEAN NOT NULL DEFAULT false;

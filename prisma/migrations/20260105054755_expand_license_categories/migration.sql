-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LicenseCategory" ADD VALUE 'A1';
ALTER TYPE "LicenseCategory" ADD VALUE 'A2';
ALTER TYPE "LicenseCategory" ADD VALUE 'B1';
ALTER TYPE "LicenseCategory" ADD VALUE 'BE';
ALTER TYPE "LicenseCategory" ADD VALUE 'C1';
ALTER TYPE "LicenseCategory" ADD VALUE 'C1E';
ALTER TYPE "LicenseCategory" ADD VALUE 'CE';
ALTER TYPE "LicenseCategory" ADD VALUE 'D1';
ALTER TYPE "LicenseCategory" ADD VALUE 'D1E';
ALTER TYPE "LicenseCategory" ADD VALUE 'DE';

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "surchargeAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "DriverProfile" ADD COLUMN     "licenseIssueDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PlatformSettings" ADD COLUMN     "noviceLicenseYears" INTEGER DEFAULT 2,
ADD COLUMN     "youngDriverFee" DOUBLE PRECISION DEFAULT 30.0,
ADD COLUMN     "youngDriverMinAge" INTEGER DEFAULT 25;

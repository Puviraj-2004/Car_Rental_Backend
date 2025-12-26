-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "logoPublicId" TEXT;

-- AlterTable
ALTER TABLE "CarImage" ADD COLUMN     "publicId" TEXT;

-- AlterTable
ALTER TABLE "DriverProfile" ADD COLUMN     "addressProofPublicId" TEXT,
ADD COLUMN     "idProofPublicId" TEXT,
ADD COLUMN     "licenseBackPublicId" TEXT,
ADD COLUMN     "licenseFrontPublicId" TEXT;

-- CreateTable
CREATE TABLE "PlatformSettings" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL DEFAULT 'My Car Rental',
    "description" TEXT,
    "logoUrl" TEXT,
    "logoPublicId" TEXT,
    "supportEmail" TEXT,
    "supportPhone" TEXT,
    "termsAndConditions" TEXT,
    "privacyPolicy" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "taxPercentage" DOUBLE PRECISION NOT NULL DEFAULT 20.0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSettings_pkey" PRIMARY KEY ("id")
);

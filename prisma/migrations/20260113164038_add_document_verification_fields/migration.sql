/*
  Warnings:

  - You are about to drop the column `licenseCategory` on the `DocumentVerification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DocumentVerification" DROP COLUMN "licenseCategory",
ADD COLUMN     "driverDob" TIMESTAMP(3),
ADD COLUMN     "idCardBackUrl" TEXT,
ADD COLUMN     "licenseCategories" "LicenseCategory"[],
ADD COLUMN     "licenseIssueDate" TIMESTAMP(3),
ADD COLUMN     "verifiedAddress" TEXT;

/*
  Warnings:

  - You are about to drop the column `availability` on the `Car` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CarStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'MAINTENANCE');

-- AlterTable
ALTER TABLE "Car" DROP COLUMN "availability",
ADD COLUMN     "status" "CarStatus" NOT NULL DEFAULT 'AVAILABLE';

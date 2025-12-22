/*
  Warnings:

  - Changed the type of `critAirRating` on the `Car` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Car" DROP COLUMN "critAirRating",
ADD COLUMN     "critAirRating" "CritAirCategory" NOT NULL;

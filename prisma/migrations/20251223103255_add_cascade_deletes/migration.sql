-- DropForeignKey
ALTER TABLE "Car" DROP CONSTRAINT "Car_brandId_fkey";

-- DropForeignKey
ALTER TABLE "Car" DROP CONSTRAINT "Car_modelId_fkey";

-- DropForeignKey
ALTER TABLE "Model" DROP CONSTRAINT "Model_brandId_fkey";

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

-- CreateIndex
CREATE INDEX "Booking_carId_idx" ON "Booking"("carId");

-- CreateIndex
CREATE INDEX "Booking_startDate_idx" ON "Booking"("startDate");

-- CreateIndex
CREATE INDEX "Car_modelId_idx" ON "Car"("modelId");

-- CreateIndex
CREATE INDEX "Car_pricePerDay_idx" ON "Car"("pricePerDay");

-- CreateIndex
CREATE INDEX "DocumentVerification_userId_idx" ON "DocumentVerification"("userId");

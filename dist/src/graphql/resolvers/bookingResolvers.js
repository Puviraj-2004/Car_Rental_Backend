"use strict";
// backend/src/graphql/resolvers/bookingResolvers.ts
// Force TypeScript recheck
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingResolvers = void 0;
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../../utils/database"));
// Temporary fix: cast to any to bypass TypeScript issue with bookingVerification
const prismaClient = database_1.default;
const authguard_1 = require("../../utils/authguard");
const cloudinary_1 = require("../../utils/cloudinary");
// 🔍 Helper function to check car availability
const checkCarAvailabilityForBooking = async (carId, startDate, endDate) => {
    const conflictingBookings = await database_1.default.booking.findMany({
        where: {
            AND: [
                { carId },
                {
                    OR: [
                        { status: 'CONFIRMED' },
                        { status: 'AWAITING_PAYMENT' },
                        { status: 'AWAITING_VERIFICATION' },
                        { status: 'ONGOING' }
                        // Note: DRAFT bookings are NOT considered conflicts
                        // Users can have multiple DRAFT bookings, only confirmed ones block
                    ]
                },
                {
                    OR: [
                        {
                            AND: [
                                { startDate: { lte: startDate } },
                                { endDate: { gt: startDate } }
                            ]
                        },
                        {
                            AND: [
                                { startDate: { lt: endDate } },
                                { endDate: { gte: endDate } }
                            ]
                        },
                        {
                            AND: [
                                { startDate: { gte: startDate } },
                                { endDate: { lte: endDate } }
                            ]
                        }
                    ]
                }
            ]
        },
        include: {
            user: {
                select: { username: true }
            }
        },
        orderBy: { startDate: 'asc' }
    });
    return {
        available: conflictingBookings.length === 0,
        conflictingBookings
    };
};
// 📅 Date parsing helper
const parseBookingDates = (input) => ({
    startDate: new Date(input.startDate),
    endDate: new Date(input.endDate)
});
// 🎫 Booking fetching helper
const getBookingById = async (id) => {
    const booking = await database_1.default.booking.findUnique({ where: { id } });
    if (!booking)
        throw new Error('Booking not found');
    return booking;
};
// Cleanup orphaned verification documents from Cloudinary
const cleanupVerificationDocuments = async (userId) => {
    try {
        const driverProfile = await database_1.default.driverProfile.findUnique({
            where: { userId },
            select: {
                licenseFrontPublicId: true,
                licenseBackPublicId: true,
                idProofPublicId: true,
                addressProofPublicId: true
            }
        });
        if (driverProfile) {
            const publicIds = [
                driverProfile.licenseFrontPublicId,
                driverProfile.licenseBackPublicId,
                driverProfile.idProofPublicId,
                driverProfile.addressProofPublicId
            ].filter(Boolean);
            // Delete images from Cloudinary
            for (const publicId of publicIds) {
                if (publicId) {
                    await (0, cloudinary_1.deleteFromCloudinary)(publicId);
                }
            }
            // Clear URLs from driver profile
            await database_1.default.driverProfile.update({
                where: { userId },
                data: {
                    licenseFrontUrl: null,
                    licenseFrontPublicId: null,
                    licenseBackUrl: null,
                    licenseBackPublicId: null,
                    idProofUrl: null,
                    idProofPublicId: null,
                    addressProofUrl: null,
                    addressProofPublicId: null,
                    status: 'NOT_UPLOADED'
                }
            });
            console.log(`🧹 Cleaned up verification documents for user ${userId}`);
        }
    }
    catch (error) {
        console.error('Error cleaning up verification documents:', error);
    }
};
// Calculate younger driver surcharge based on platform settings
const calculateYoungerDriverSurcharge = async (booking) => {
    try {
        // Get platform settings for younger driver configuration
        const platformSettings = await database_1.default.platformSettings.findFirst();
        const minAge = platformSettings?.youngDriverMinAge || 25;
        const fee = platformSettings?.youngDriverFee || 30.0;
        // Check if driver has date of birth
        const driverProfile = booking.user?.driverProfile;
        if (!driverProfile?.dateOfBirth) {
            return 0; // No DOB available, no surcharge
        }
        // Calculate driver's age
        const today = new Date();
        const birthDate = new Date(driverProfile.dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        // Adjust age if birthday hasn't occurred this year
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        // Apply surcharge if driver is younger than minimum age
        if (age < minAge) {
            console.log(`Younger driver surcharge applied: Age ${age} < ${minAge}, fee: €${fee}`);
            return fee;
        }
        return 0; // No surcharge for older drivers
    }
    catch (error) {
        console.error('Error calculating younger driver surcharge:', error);
        return 0; // Return 0 on error to avoid blocking booking
    }
};
// 🔄 Status update helper
const updateBookingStatus = async (id, status) => {
    return await database_1.default.booking.update({
        where: { id },
        data: { status }
    });
};
// 📊 Common booking includes
const BOOKING_INCLUDES = {
    basic: {
        car: { include: { brand: true, model: true } },
        payment: true
    },
    detailed: {
        user: { include: { driverProfile: true } },
        car: { include: { brand: true, model: true, images: true } },
        payment: true,
        verification: true
    },
    admin: {
        user: true,
        car: { include: { brand: true, model: true } },
        payment: true
    }
};
exports.bookingResolvers = {
    Query: {
        // 🛡️ Admin: Ella bookings-aiyum paarkka
        bookings: async (_, __, context) => {
            (0, authguard_1.isAdmin)(context);
            return await database_1.default.booking.findMany({
                include: BOOKING_INCLUDES.admin,
                orderBy: { createdAt: 'desc' },
            });
        },
        // 👤 User: Thannudaiya bookings-ai paarkka
        myBookings: async (_, __, context) => {
            (0, authguard_1.isAuthenticated)(context);
            return await database_1.default.booking.findMany({
                where: { userId: context.userId },
                include: BOOKING_INCLUDES.detailed,
                orderBy: { createdAt: 'desc' },
            });
        },
        // 🔍 Check car availability for specific dates
        checkCarAvailability: async (_, { carId, startDate, endDate }) => {
            const { startDate: start, endDate: end } = parseBookingDates({ startDate, endDate });
            return await checkCarAvailabilityForBooking(carId, start, end);
        },
        // 🔍 Single Booking: Details paarkka (Owner or Admin only)
        booking: async (_, { id }, context) => {
            const booking = await getBookingById(id);
            (0, authguard_1.isOwnerOrAdmin)(context, booking.userId);
            const detailedBooking = await database_1.default.booking.findUnique({
                where: { id },
                include: BOOKING_INCLUDES.detailed,
            });
            // Calculate younger driver surcharge if booking is AWAITING_PAYMENT and surcharge not set
            if (detailedBooking && detailedBooking.status === 'AWAITING_PAYMENT' && detailedBooking.surchargeAmount === 0) {
                const surcharge = await calculateYoungerDriverSurcharge(detailedBooking);
                if (surcharge > 0) {
                    // Update booking with surcharge
                    await database_1.default.booking.update({
                        where: { id },
                        data: {
                            surchargeAmount: surcharge,
                            totalFinalPrice: (detailedBooking.totalFinalPrice || detailedBooking.totalPrice) + surcharge
                        }
                    });
                    // Update the returned booking object
                    detailedBooking.surchargeAmount = surcharge;
                    detailedBooking.totalFinalPrice = (detailedBooking.totalFinalPrice || detailedBooking.totalPrice) + surcharge;
                }
            }
            return detailedBooking;
        },
        // 📊 Admin: Oru specific user-oda bookings-ai paarkka
        userBookings: async (_, { userId }, context) => {
            (0, authguard_1.isAdmin)(context);
            return await database_1.default.booking.findMany({
                where: { userId },
                include: BOOKING_INCLUDES.basic
            });
        }
    },
    Mutation: {
        // 🆕 Step 1: User creates a draft booking
        createBooking: async (_, { input }, context) => {
            (0, authguard_1.isAuthenticated)(context);
            // Security check: Only admins can create REPLACEMENT bookings
            if (input.bookingType === 'REPLACEMENT' && context.userRole !== 'ADMIN') {
                throw new Error('Unauthorized: Only administrators can create courtesy car bookings');
            }
            // 🚨 Parse booking dates
            const { startDate, endDate } = parseBookingDates(input);
            // ⏰ Validate booking dates
            const now = new Date();
            const minPickupTime = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // At least 2 hours from now
            if (startDate <= minPickupTime) {
                throw new Error('Pickup date must be at least 2 hours in the future');
            }
            const minEndDate = new Date(startDate.getTime() + (1 * 60 * 60 * 1000)); // At least 1 hour after pickup
            if (endDate <= minEndDate) {
                throw new Error('Return date must be at least 1 hour after pickup date');
            }
            // 📏 Calculate allowed KM based on car limits and booking duration
            let calculatedAllowedKm;
            if (input.allowedKm === undefined) {
                // Auto-calculate if not provided
                const car = await database_1.default.car.findUnique({
                    where: { id: input.carId },
                    select: { dailyKmLimit: true }
                });
                if (car?.dailyKmLimit) {
                    if (input.rentalType === 'HOUR') {
                        // For HOUR rentals: calculate hours and divide daily limit by 24
                        const bookingHours = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
                        const hourlyKmLimit = car.dailyKmLimit / 24; // Convert daily limit to hourly
                        calculatedAllowedKm = hourlyKmLimit * bookingHours;
                    }
                    else {
                        // For DAY rentals: use existing day-based calculation
                        const bookingDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                        calculatedAllowedKm = car.dailyKmLimit * bookingDays;
                    }
                }
            }
            // Force zero pricing for REPLACEMENT bookings
            const finalInput = {
                ...input,
                ...(input.bookingType === 'REPLACEMENT' && {
                    basePrice: 0,
                    taxAmount: 0,
                    totalPrice: 0,
                    surchargeAmount: 0,
                    depositAmount: 0
                })
            };
            // Check if user already has a DRAFT booking for this car
            const existingDraftBooking = await database_1.default.booking.findFirst({
                where: {
                    userId: context.userId,
                    carId: input.carId,
                    status: 'DRAFT'
                }
            });
            let booking;
            if (existingDraftBooking) {
                // Update existing DRAFT booking (no availability check needed - updating our own booking)
                booking = await database_1.default.booking.update({
                    where: { id: existingDraftBooking.id },
                    data: {
                        startDate,
                        endDate,
                        allowedKm: calculatedAllowedKm || input.allowedKm,
                        basePrice: finalInput.basePrice,
                        taxAmount: finalInput.taxAmount,
                        totalPrice: finalInput.totalPrice,
                        depositAmount: finalInput.depositAmount,
                        surchargeAmount: finalInput.surchargeAmount || 0,
                        rentalType: input.rentalType,
                        bookingType: input.bookingType || 'RENTAL',
                        repairOrderId: input.repairOrderId,
                        pickupLocation: input.pickupLocation,
                        dropoffLocation: input.dropoffLocation,
                    },
                    include: {
                        car: { include: { brand: true, model: true } },
                    },
                });
            }
            else {
                // 🔍 Check car availability before creating NEW booking (exclude user's own DRAFT bookings)
                const availability = await checkCarAvailabilityForBooking(input.carId, startDate, endDate);
                if (!availability.available) {
                    throw new Error('Car is not available for the selected dates');
                }
                // Create new DRAFT booking
                booking = await database_1.default.booking.create({
                    data: {
                        userId: context.userId,
                        carId: input.carId,
                        startDate,
                        endDate,
                        allowedKm: calculatedAllowedKm || input.allowedKm,
                        basePrice: finalInput.basePrice,
                        taxAmount: finalInput.taxAmount,
                        totalPrice: finalInput.totalPrice,
                        depositAmount: finalInput.depositAmount,
                        surchargeAmount: finalInput.surchargeAmount || 0,
                        rentalType: input.rentalType,
                        bookingType: input.bookingType || 'RENTAL',
                        repairOrderId: input.repairOrderId,
                        pickupLocation: input.pickupLocation,
                        dropoffLocation: input.dropoffLocation,
                        status: 'DRAFT',
                    },
                    include: {
                        car: { include: { brand: true, model: true } },
                    },
                });
            }
            return booking;
        },
        // ✅ Step 2: Confirm DRAFT booking and send verification link
        confirmBooking: async (_, { bookingId }, context) => {
            const booking = await getBookingById(bookingId);
            // Validate ownership
            (0, authguard_1.isOwnerOrAdmin)(context, booking.userId);
            // Validate booking status
            if (booking.status !== 'DRAFT') {
                throw new Error('Only DRAFT bookings can be confirmed');
            }
            // Final availability check before confirmation
            const availability = await checkCarAvailabilityForBooking(booking.carId, booking.startDate, booking.endDate);
            if (!availability.available) {
                throw new Error('Car is no longer available for the selected dates');
            }
            const token = (0, uuid_1.v4)(); // Unique token generation
            const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour expiry
            console.log(`🎫 Generated verification token for booking ${bookingId}:`, {
                token: token.substring(0, 8) + '...',
                expiresAt: expiresAt.toISOString()
            });
            // Use transaction to update booking and create verification in one go
            await database_1.default.$transaction(async (tx) => {
                // Update booking status and set expiration
                await tx.booking.update({
                    where: { id: bookingId },
                    data: {
                        status: 'AWAITING_VERIFICATION',
                        expiresAt: expiresAt // Set 1-hour expiration on booking
                    }
                });
                // Create or update verification token
                await tx.bookingVerification.upsert({
                    where: { bookingId },
                    update: { token, expiresAt, isVerified: false },
                    create: { bookingId, token, expiresAt }
                });
            });
            // Fetch the updated booking with verification data
            const result = await database_1.default.booking.findUnique({
                where: { id: bookingId },
                include: BOOKING_INCLUDES.detailed
            });
            return {
                success: true,
                message: "Booking confirmed and verification link generated successfully.",
                booking: result
            };
        },
        // 📧 Legacy: System verification link anuppudhal (for existing confirmed bookings)
        sendBookingVerificationLink: async (_, { bookingId }, context) => {
            const booking = await getBookingById(bookingId);
            (0, authguard_1.isOwnerOrAdmin)(context, booking.userId);
            // 🔍 Double-check car availability before proceeding with verification
            const availability = await checkCarAvailabilityForBooking(booking.carId, booking.startDate, booking.endDate);
            if (!availability.available) {
                throw new Error('Car is no longer available for the selected dates');
            }
            const token = (0, uuid_1.v4)(); // Unique token generation
            const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour expiry
            // Token-ai save seiyyal
            await prismaClient.bookingVerification.upsert({
                where: { bookingId },
                update: { token, expiresAt, isVerified: false },
                create: { bookingId, token, expiresAt }
            });
            // Status-ai update seiyyal
            await database_1.default.booking.update({
                where: { id: bookingId },
                data: { status: 'AWAITING_VERIFICATION' }
            });
            // 💡 Inge dhaan neenga email anuppum function-ai (eg: sendEmail) call seiyyanum
            // Token expires in 1 hour
            console.log(`Verification Token for Booking ${bookingId}: ${token}`);
            return {
                success: true,
                message: "Verification link generated and sent successfully.",
                bookingId
            };
        },
        // 🔗 Step 3: Magic link token-ai verify seiyyal (Public Route)
        verifyBookingToken: async (_, { token }) => {
            console.log(`🔍 ===== VERIFICATION ATTEMPT =====`);
            console.log(`🔍 Received token:`, {
                value: token,
                length: token?.length,
                type: typeof token,
                isValid: token && token.length > 10
            });
            const verification = await prismaClient.bookingVerification.findUnique({
                where: { token },
                include: {
                    booking: {
                        select: { status: true, id: true, expiresAt: true }
                    }
                }
            });
            console.log(`📊 Database lookup:`, {
                found: !!verification,
                verificationId: verification?.id,
                tokenMatches: verification?.token === token,
                bookingId: verification?.bookingId,
                bookingStatus: verification?.booking?.status,
                expiresAt: verification?.expiresAt,
                currentTime: new Date().toISOString(),
                isExpired: verification?.expiresAt ? new Date() > new Date(verification.expiresAt) : null
            });
            if (!verification) {
                console.log(`❌ ===== TOKEN NOT FOUND IN DATABASE =====`);
                // Check total tokens in DB for debugging
                const totalTokens = await prismaClient.bookingVerification.count();
                console.log(`📊 Total verification tokens in database: ${totalTokens}`);
                // Show a sample of existing tokens (first few chars)
                const sampleTokens = await prismaClient.bookingVerification.findMany({
                    take: 3,
                    select: { token: true }
                });
                console.log(`📊 Sample tokens in DB:`, sampleTokens.map((t) => t.token.substring(0, 8) + '...'));
                throw new Error("Invalid or broken verification link.");
            }
            // 🚨 IMMEDIATE EXPIRY CHECK: If token is expired, cancel booking immediately
            const now = new Date();
            const expiresAt = new Date(verification.expiresAt);
            if (now > expiresAt) {
                console.log(`⏰ ===== TOKEN EXPIRED - AUTO CANCELLING BOOKING =====`);
                console.log(`⏰ Token expired at: ${expiresAt.toISOString()}`);
                console.log(`⏰ Current time: ${now.toISOString()}`);
                console.log(`⏰ Booking ID to cancel: ${verification.bookingId}`);
                try {
                    // Auto-cancel the expired booking
                    await prismaClient.$transaction(async (tx) => {
                        // Update booking status to CANCELLED
                        await tx.booking.update({
                            where: { id: verification.bookingId },
                            data: {
                                status: 'CANCELLED',
                                updatedAt: now
                            }
                        });
                        // Delete the expired verification token
                        await tx.bookingVerification.delete({
                            where: { id: verification.id }
                        });
                        // Log the auto-cancellation
                        await tx.auditLog.create({
                            data: {
                                userId: verification.booking?.userId || 'system-expiration-service',
                                action: 'AUTO_BOOKING_EXPIRATION_ON_VERIFY',
                                details: {
                                    bookingId: verification.bookingId,
                                    previousStatus: verification.booking?.status,
                                    tokenExpiredAt: expiresAt.toISOString(),
                                    verifiedAt: now.toISOString(),
                                    reason: 'Token expired when user tried to verify'
                                }
                            }
                        });
                    });
                    // Cleanup orphaned verification documents
                    if (verification.booking?.userId) {
                        await cleanupVerificationDocuments(verification.booking.userId);
                    }
                    console.log(`✅ ===== BOOKING AUTO-CANCELLED =====`);
                    throw new Error("Verification link has expired. This booking has been cancelled for security reasons.");
                }
                catch (error) {
                    console.error(`❌ Failed to auto-cancel expired booking:`, error);
                    throw new Error("Verification link has expired. Please contact support if you believe this is an error.");
                }
            }
            // Check if booking is cancelled (read-only restriction)
            if (verification.booking?.status === 'CANCELLED') {
                throw new Error("This booking session has expired and is now cancelled. You can only view the details.");
            }
            // Check if verification link has expired
            if (new Date() > verification.expiresAt) {
                // Only delete the expired verification token, keep the booking
                console.log(`🗑️ Deleting expired verification token for booking ${verification.bookingId}`);
                await database_1.default.$transaction(async (tx) => {
                    // Delete only the verification token
                    await tx.bookingVerification.delete({
                        where: { id: verification.id }
                    });
                    // Log the cleanup (booking stays in AWAITING_VERIFICATION status)
                    await tx.auditLog.create({
                        data: {
                            userId: 'system-expiry-cleanup', // System operation
                            action: 'EXPIRED_VERIFICATION_TOKEN_CLEANUP',
                            details: {
                                bookingId: verification.bookingId,
                                verificationId: verification.id,
                                reason: 'Verification token expired, booking preserved'
                            }
                        }
                    });
                });
                throw new Error("Verification link has expired. Please request a new verification link from your booking records.");
            }
            // DB updates
            await database_1.default.$transaction([
                prismaClient.bookingVerification.update({
                    where: { id: verification.id },
                    data: { isVerified: true, verifiedAt: new Date() }
                }),
                database_1.default.booking.update({
                    where: { id: verification.bookingId },
                    data: { status: 'AWAITING_PAYMENT' }
                })
            ]);
            return {
                success: true,
                message: "Booking verified. You can now proceed to payment.",
                bookingId: verification.bookingId
            };
        },
        // ⚙️ Admin: Status-ai manual-aaga update seiyya (eg: CONFIRMED after payment)
        // 👤 Users can update their own DRAFT bookings to AWAITING_VERIFICATION
        updateBookingStatus: async (_, { id, status }, context) => {
            // Allow users to update their own DRAFT bookings to AWAITING_VERIFICATION
            if (status === 'AWAITING_VERIFICATION') {
                (0, authguard_1.isAuthenticated)(context);
                // Check if user owns this booking
                const booking = await getBookingById(id);
                if (booking.userId !== context.userId) {
                    throw new Error('Unauthorized: You can only update your own bookings');
                }
                if (booking.status !== 'DRAFT') {
                    throw new Error('Can only confirm draft bookings');
                }
            }
            else {
                // Other status updates require admin
                (0, authguard_1.isAdmin)(context);
            }
            return await updateBookingStatus(id, status);
        },
        // ❌ Cancel Booking: User or Admin can cancel
        cancelBooking: async (_, { id }, context) => {
            const booking = await getBookingById(id);
            (0, authguard_1.isOwnerOrAdmin)(context, booking.userId);
            await updateBookingStatus(id, 'CANCELLED');
            return true;
        },
        // 🗑️ Delete Booking: Admin only
        deleteBooking: async (_, { id }, context) => {
            (0, authguard_1.isAdmin)(context);
            await database_1.default.booking.delete({ where: { id } });
            return true;
        },
        // 📏 Update Meter Readings (Start/End)
        updateMeterReadings: async (_, { bookingId, input }, context) => {
            const booking = await getBookingById(bookingId);
            (0, authguard_1.isOwnerOrAdmin)(context, booking.userId);
            // Validate booking status for meter updates
            if (booking.status !== 'ONGOING' && booking.status !== 'CONFIRMED') {
                throw new Error('Meter readings can only be updated for ongoing or confirmed bookings');
            }
            return await database_1.default.booking.update({
                where: { id: bookingId },
                data: {
                    startMeter: input.startMeter !== undefined ? input.startMeter : booking.startMeter,
                    endMeter: input.endMeter !== undefined ? input.endMeter : booking.endMeter,
                },
                include: BOOKING_INCLUDES.detailed
            });
        },
        // 🔄 Resend Verification Link for Expired Tokens
        resendVerificationLink: async (_, { bookingId }, context) => {
            (0, authguard_1.isAuthenticated)(context);
            const booking = await getBookingById(bookingId);
            (0, authguard_1.isOwnerOrAdmin)(context, booking.userId);
            // Check if booking is in AWAITING_VERIFICATION status
            if (booking.status !== 'AWAITING_VERIFICATION') {
                throw new Error('Booking is not awaiting verification.');
            }
            // Check if there's already a valid verification token
            const existingVerification = await prismaClient.bookingVerification.findFirst({
                where: {
                    bookingId,
                    expiresAt: { gt: new Date() } // Still valid
                }
            });
            if (existingVerification) {
                throw new Error('A valid verification link already exists for this booking.');
            }
            // Create new verification token
            const token = (0, uuid_1.v4)();
            const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour expiry
            await prismaClient.bookingVerification.create({
                data: {
                    bookingId,
                    token,
                    expiresAt
                }
            });
            // Log the resend action
            await database_1.default.auditLog.create({
                data: {
                    userId: context.userId,
                    action: 'VERIFICATION_LINK_RESENT',
                    details: { bookingId }
                }
            });
            return {
                success: true,
                message: "New verification link sent successfully.",
                expiresAt: expiresAt.toISOString()
            };
        },
        // 🏁 Finalize Booking Return with KM Calculations
        finalizeBookingReturn: async (_, { bookingId }, context) => {
            const booking = await getBookingById(bookingId);
            (0, authguard_1.isOwnerOrAdmin)(context, booking.userId);
            // Validate required data
            if (!booking.startMeter || !booking.endMeter) {
                throw new Error('Start and end meter readings are required to finalize booking');
            }
            if (booking.status !== 'ONGOING') {
                throw new Error('Only ongoing bookings can be finalized');
            }
            // Calculate extra KM used
            const totalKmUsed = booking.endMeter - booking.startMeter;
            const allowedKm = booking.allowedKm || 0;
            const extraKmUsed = Math.max(0, totalKmUsed - allowedKm);
            // Calculate extra charges
            const car = await database_1.default.car.findUnique({
                where: { id: booking.carId },
                select: { extraKmCharge: true }
            });
            const extraKmCharge = extraKmUsed * (car?.extraKmCharge || 0);
            const totalFinalPrice = booking.totalPrice + extraKmCharge;
            // Update booking with final calculations
            return await database_1.default.booking.update({
                where: { id: bookingId },
                data: {
                    extraKmUsed,
                    extraKmCharge,
                    totalFinalPrice,
                    status: 'COMPLETED'
                },
                include: BOOKING_INCLUDES.detailed
            });
        }
    }
};
//# sourceMappingURL=bookingResolvers.js.map
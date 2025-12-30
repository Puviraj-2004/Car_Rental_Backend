"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userResolvers = void 0;
const google_auth_library_1 = require("google-auth-library");
const database_1 = __importDefault(require("../../utils/database"));
const auth_1 = require("../../utils/auth");
const sendEmail_1 = require("../../utils/sendEmail");
const validation_1 = require("../../utils/validation");
const authguard_1 = require("../../utils/authguard");
const cloudinary_1 = require("../../utils/cloudinary");
const ocrService_1 = require("../../services/ocrService");
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.userResolvers = {
    Query: {
        me: async (_, __, context) => {
            (0, authguard_1.isAuthenticated)(context);
            return await database_1.default.user.findUnique({
                where: { id: context.userId },
                include: { driverProfile: true, bookings: true }
            });
        },
        user: async (_, { id }, context) => {
            (0, authguard_1.isAdmin)(context); // பொதுவாக அட்மின் மட்டுமே பிற யூசர்களைப் பார்க்க வேண்டும்
            return await database_1.default.user.findUnique({
                where: { id },
                include: { driverProfile: true, bookings: true }
            });
        },
        users: async (_, __, context) => {
            (0, authguard_1.isAdmin)(context);
            return await database_1.default.user.findMany({
                include: { driverProfile: true, bookings: true }
            });
        },
        myDriverProfile: async (_, __, context) => {
            (0, authguard_1.isAuthenticated)(context);
            return await database_1.default.driverProfile.findUnique({
                where: { userId: context.userId }
            });
        }
    },
    Mutation: {
        // 1. Register: simplified & added Audit Log
        register: async (_, { input }) => {
            const { email, username, password, phoneNumber } = input;
            const existingUser = await database_1.default.user.findFirst({
                where: { OR: [{ email }, { username }] }
            });
            if (existingUser) {
                throw new Error('User already exists with this email or username');
            }
            const passwordValidation = (0, validation_1.validatePassword)(password);
            if (!passwordValidation.isValid) {
                throw new Error(`Password weak: ${passwordValidation.errors.join(', ')}`);
            }
            const hashedPassword = await (0, auth_1.hashPassword)(password);
            const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
            const user = await database_1.default.user.create({
                data: {
                    username,
                    email,
                    password: hashedPassword,
                    phoneNumber,
                    isEmailVerified: false,
                    otp: generatedOTP,
                    otpExpires: otpExpiry,
                    role: 'USER'
                }
            });
            // Send OTP Email
            await (0, sendEmail_1.sendVerificationEmail)(user.email, generatedOTP).catch(console.error);
            // Industrial standard: Log the registration
            await database_1.default.auditLog.create({
                data: {
                    userId: user.id,
                    action: 'USER_REGISTERED',
                    details: { email: user.email }
                }
            });
            return {
                token: "", // லாகின் செய்யும் போது மட்டும் டோக்கன் கொடுக்கலாம்
                user,
                message: "Registration successful. Please check your email for OTP."
            };
        },
        // 2. Login: added login check
        login: async (_, { input }) => {
            const { email, password } = input;
            const user = await database_1.default.user.findUnique({
                where: { email },
                include: { driverProfile: true }
            });
            if (!user || !user.password)
                throw new Error('Invalid email or password');
            const isValidPassword = await (0, auth_1.comparePasswords)(password, user.password);
            if (!isValidPassword)
                throw new Error('Invalid email or password');
            if (!user.isEmailVerified)
                throw new Error('Please verify your email first.');
            const token = (0, auth_1.generateToken)(user.id, user.role);
            // Log Login action
            await database_1.default.auditLog.create({
                data: { userId: user.id, action: 'USER_LOGIN' }
            });
            return { token, user };
        },
        // 3. Google Login with Required Field handling
        googleLogin: async (_, { idToken }) => {
            try {
                const ticket = await googleClient.verifyIdToken({
                    idToken,
                    audience: process.env.GOOGLE_CLIENT_ID,
                });
                const payload = ticket.getPayload();
                if (!payload || !payload.email)
                    throw new Error('Invalid Google token');
                const { email, sub: googleId } = payload;
                let user = await database_1.default.user.findUnique({ where: { email } });
                if (!user) {
                    const baseUsername = email.split('@')[0];
                    user = await database_1.default.user.create({
                        data: {
                            email,
                            googleId,
                            username: `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`,
                            phoneNumber: '0000000000', // Placeholder as it's required!
                            isEmailVerified: true,
                            role: 'USER'
                        }
                    });
                }
                const token = (0, auth_1.generateToken)(user.id, user.role);
                return { token, user, message: "Google login successful" };
            }
            catch (error) {
                throw new Error('Google authentication failed');
            }
        },
        // 4. Verify OTP
        verifyOTP: async (_, { email, otp }) => {
            const user = await database_1.default.user.findUnique({ where: { email } });
            if (!user)
                throw new Error('User not found');
            if (user.otp !== otp)
                throw new Error('Invalid OTP');
            if (user.otpExpires && new Date() > user.otpExpires)
                throw new Error('OTP expired');
            await database_1.default.user.update({
                where: { id: user.id },
                data: { isEmailVerified: true, otp: null, otpExpires: null }
            });
            return { success: true, message: "Email verified successfully." };
        },
        // 5. KYC Profile Update - Using proper DateTime conversion
        createOrUpdateDriverProfile: async (_, { input }, context) => {
            (0, authguard_1.isAuthenticated)(context);
            // Get existing profile to preserve Cloudinary URLs
            const existingProfile = await database_1.default.driverProfile.findUnique({
                where: { userId: context.userId },
                select: {
                    licenseFrontUrl: true,
                    licenseFrontPublicId: true,
                    licenseBackUrl: true,
                    licenseBackPublicId: true,
                    idProofUrl: true,
                    idProofPublicId: true,
                    addressProofUrl: true,
                    addressProofPublicId: true
                }
            });
            // Industrial Logic: Convert string dates to actual Date objects for DB
            const dataToSave = {
                ...input,
                licenseExpiry: input.licenseExpiry ? new Date(input.licenseExpiry) : null,
                licenseIssueDate: input.licenseIssueDate ? new Date(input.licenseIssueDate) : null,
                dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
                // Preserve existing Cloudinary URLs
                licenseFrontUrl: existingProfile?.licenseFrontUrl,
                licenseFrontPublicId: existingProfile?.licenseFrontPublicId,
                licenseBackUrl: existingProfile?.licenseBackUrl,
                licenseBackPublicId: existingProfile?.licenseBackPublicId,
                idProofUrl: existingProfile?.idProofUrl,
                idProofPublicId: existingProfile?.idProofPublicId,
                addressProofUrl: existingProfile?.addressProofUrl,
                addressProofPublicId: existingProfile?.addressProofPublicId
                // Don't set status here - it will be updated to VERIFIED_BY_AI below
            };
            const profile = await database_1.default.driverProfile.upsert({
                where: { userId: context.userId },
                update: dataToSave,
                create: { userId: context.userId, ...dataToSave }
            });
            // Update verification status to VERIFIED_BY_AI since user has completed verification
            await database_1.default.driverProfile.update({
                where: { id: profile.id },
                data: { status: 'VERIFIED_BY_AI' }
            });
            // Find and update the user's AWAITING_VERIFICATION booking to AWAITING_PAYMENT
            const pendingBooking = await database_1.default.booking.findFirst({
                where: {
                    userId: context.userId,
                    status: 'AWAITING_VERIFICATION'
                }
            });
            if (pendingBooking) {
                await database_1.default.booking.update({
                    where: { id: pendingBooking.id },
                    data: { status: 'AWAITING_PAYMENT' }
                });
                // Log the booking status change
                await database_1.default.auditLog.create({
                    data: {
                        userId: context.userId,
                        action: 'BOOKING_STATUS_UPDATED',
                        details: {
                            bookingId: pendingBooking.id,
                            previousStatus: 'AWAITING_VERIFICATION',
                            newStatus: 'AWAITING_PAYMENT',
                            reason: 'Driver verification completed'
                        }
                    }
                });
            }
            // Log the profile upload
            await database_1.default.auditLog.create({
                data: {
                    userId: context.userId,
                    action: 'DRIVER_PROFILE_VERIFIED',
                    details: {
                        profileId: profile.id,
                        bookingId: pendingBooking?.id
                    }
                }
            });
            return profile;
        },
        // 6. Admin Verification
        verifyDriverProfile: async (_, { userId, status, note }, context) => {
            (0, authguard_1.isAdmin)(context);
            const profile = await database_1.default.driverProfile.update({
                where: { userId },
                data: { status, verificationNote: note }
            });
            // Log Admin Action
            await database_1.default.auditLog.create({
                data: {
                    userId: context.userId,
                    action: `DRIVER_VERIFICATION_${status}`,
                    details: { targetUserId: userId, note }
                }
            });
            return profile;
        },
        // OCR Document Processing for Auto-fill
        processDocumentOCR: async (_, { file, documentType, side }, context) => {
            (0, authguard_1.isAuthenticated)(context);
            try {
                // Convert GraphQL Upload to Buffer
                const { createReadStream, filename, mimetype } = await file;
                const stream = createReadStream();
                const chunks = [];
                for await (const chunk of stream) {
                    chunks.push(chunk);
                }
                const fileBuffer = Buffer.concat(chunks);
                // Validate file type
                if (!mimetype.startsWith('image/')) {
                    throw new Error('Only image files are supported for OCR processing');
                }
                // Upload to Cloudinary for storage (following existing pattern)
                const cloudinaryResult = await (0, cloudinary_1.uploadToCloudinary)(fileBuffer, 'documents', filename);
                // Process with Mindee OCR
                const extractedData = await ocrService_1.ocrService.extractDocumentData(fileBuffer, documentType);
                // Store Cloudinary URL in driver profile based on document type and side
                const urlUpdateData = {
                    status: 'PENDING_REVIEW'
                };
                switch (documentType) {
                    case 'license':
                        if (side === 'back') {
                            urlUpdateData.licenseBackUrl = cloudinaryResult.secure_url;
                            urlUpdateData.licenseBackPublicId = cloudinaryResult.public_id;
                        }
                        else {
                            // Default to front for license
                            urlUpdateData.licenseFrontUrl = cloudinaryResult.secure_url;
                            urlUpdateData.licenseFrontPublicId = cloudinaryResult.public_id;
                        }
                        break;
                    case 'id':
                        urlUpdateData.idProofUrl = cloudinaryResult.secure_url;
                        urlUpdateData.idProofPublicId = cloudinaryResult.public_id;
                        break;
                    case 'address':
                        urlUpdateData.addressProofUrl = cloudinaryResult.secure_url;
                        urlUpdateData.addressProofPublicId = cloudinaryResult.public_id;
                        break;
                }
                // Update or create driver profile with URL and status
                await database_1.default.driverProfile.upsert({
                    where: { userId: context.userId },
                    update: urlUpdateData,
                    create: {
                        userId: context.userId,
                        ...urlUpdateData
                    }
                });
                // Log the OCR processing
                await database_1.default.auditLog.create({
                    data: {
                        userId: context.userId,
                        action: 'DOCUMENT_OCR_PROCESSED',
                        details: {
                            filename,
                            cloudinaryUrl: cloudinaryResult.secure_url,
                            extractedFields: Object.keys(extractedData),
                            documentType,
                            ocrSuccess: Object.keys(extractedData).length > 0
                        }
                    }
                });
                return extractedData;
            }
            catch (error) {
                console.error('OCR Processing Error:', error);
                // Log the error
                await database_1.default.auditLog.create({
                    data: {
                        userId: context.userId,
                        action: 'DOCUMENT_OCR_FAILED',
                        details: { error: error instanceof Error ? error.message : 'Unknown OCR error' }
                    }
                });
                throw new Error('Unable to read the document. Please upload a clearer photo.');
            }
        },
        updateUser: async (_, { input }, context) => {
            (0, authguard_1.isAuthenticated)(context);
            return await database_1.default.user.update({
                where: { id: context.userId },
                data: input
            });
        },
        deleteUser: async (_, { id }, context) => {
            (0, authguard_1.isAdmin)(context);
            await database_1.default.user.delete({ where: { id } });
            return true;
        }
    }
};
//# sourceMappingURL=userResolvers.js.map
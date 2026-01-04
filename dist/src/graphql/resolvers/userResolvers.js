"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userResolvers = void 0;
const google_auth_library_1 = require("google-auth-library");
const database_1 = __importDefault(require("../../utils/database"));
const auth_1 = require("../../utils/auth");
const authguard_1 = require("../../utils/authguard");
const ocrService_1 = require("../../services/ocrService");
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const USER_INCLUDES = { verification: true, bookings: true };
exports.userResolvers = {
    Query: {
        me: async (_, __, context) => {
            (0, authguard_1.isAuthenticated)(context);
            return await database_1.default.user.findUnique({
                where: { id: context.userId },
                include: USER_INCLUDES
            });
        },
        user: async (_, { id }, context) => {
            (0, authguard_1.isAdmin)(context);
            return await database_1.default.user.findUnique({ where: { id }, include: USER_INCLUDES });
        },
        users: async (_, __, context) => {
            (0, authguard_1.isAdmin)(context);
            return await database_1.default.user.findMany({ include: USER_INCLUDES });
        },
        myVerification: async (_, __, context) => {
            (0, authguard_1.isAuthenticated)(context);
            return await database_1.default.documentVerification.findUnique({ where: { userId: context.userId } });
        }
    },
    Mutation: {
        register: async (_, { input }) => {
            const { email, password, phoneNumber, fullName } = input;
            const existingUser = await database_1.default.user.findUnique({ where: { email } });
            if (existingUser)
                throw new Error('User already exists');
            const hashedPassword = await (0, auth_1.hashPassword)(password);
            const user = await database_1.default.user.create({
                data: { email, password: hashedPassword, phoneNumber, fullName, role: 'USER' }
            });
            return { token: (0, auth_1.generateToken)(user.id, user.role), user, message: "Registration successful." };
        },
        login: async (_, { input }) => {
            const { email, password } = input;
            const user = await database_1.default.user.findUnique({ where: { email } });
            if (!user || !user.password)
                throw new Error('Invalid credentials');
            const isValid = await (0, auth_1.comparePasswords)(password, user.password);
            if (!isValid)
                throw new Error('Invalid credentials');
            return { token: (0, auth_1.generateToken)(user.id, user.role), user };
        },
        googleLogin: async (_, { idToken }) => {
            try {
                const ticket = await googleClient.verifyIdToken({
                    idToken,
                    audience: process.env.GOOGLE_CLIENT_ID,
                });
                const payload = ticket.getPayload();
                if (!payload || !payload.email)
                    throw new Error('Invalid Google token');
                const { email, sub: googleId, name } = payload;
                let user = await database_1.default.user.findUnique({ where: { email } });
                if (!user) {
                    user = await database_1.default.user.create({
                        data: { email, googleId, fullName: name, role: 'USER' }
                    });
                }
                else if (!user.googleId) {
                    user = await database_1.default.user.update({
                        where: { id: user.id },
                        data: { googleId }
                    });
                }
                return { token: (0, auth_1.generateToken)(user.id, user.role), user, message: "Google login successful" };
            }
            catch (error) {
                throw new Error('Google authentication failed');
            }
        },
        // 🔥 MAIN LOGIC: AI Verification & Auto Booking Update
        createOrUpdateVerification: async (_, { input }, context) => {
            (0, authguard_1.isAuthenticated)(context);
            const existingVerification = await database_1.default.documentVerification.findUnique({
                where: { userId: context.userId }
            });
            // 1. Save Document Data (from Manual or AI input)
            const dataToSave = {
                licenseCategory: input.licenseCategory || 'B',
                licenseFrontUrl: input.licenseFrontUrl || existingVerification?.licenseFrontUrl,
                licenseBackUrl: input.licenseBackUrl || existingVerification?.licenseBackUrl,
                idCardUrl: input.idCardUrl || existingVerification?.idCardUrl,
                addressProofUrl: input.addressProofUrl || existingVerification?.addressProofUrl,
                licenseNumber: input.licenseNumber || existingVerification?.licenseNumber,
                licenseExpiry: input.licenseExpiry ? new Date(input.licenseExpiry) : existingVerification?.licenseExpiry,
                idNumber: input.idNumber || existingVerification?.idNumber,
                idExpiry: input.idExpiry ? new Date(input.idExpiry) : existingVerification?.idExpiry,
                status: 'PENDING'
            };
            const verification = await database_1.default.documentVerification.upsert({
                where: { userId: context.userId },
                update: dataToSave,
                create: { user: { connect: { id: context.userId } }, ...dataToSave }
            });
            // 🚀 LOGIC START: If AI/User provided critical info, Auto-Approve & Update Bookings
            // Minimum Requirement: License Number + License Front Image
            if (verification.licenseNumber && verification.licenseFrontUrl) {
                // A. Auto Approve Profile
                await database_1.default.documentVerification.update({
                    where: { userId: context.userId },
                    data: {
                        status: 'APPROVED',
                        verifiedAt: new Date()
                    }
                });
                // B. Find "PENDING" bookings for this user
                const pendingBookings = await database_1.default.booking.findMany({
                    where: { userId: context.userId, status: 'PENDING' }
                });
                // C. Update Booking Status to VERIFIED
                // Important: Update `updatedAt` to reset the 15-minute payment timer
                if (pendingBookings.length > 0) {
                    await database_1.default.booking.updateMany({
                        where: { userId: context.userId, status: 'PENDING' },
                        data: { status: 'VERIFIED', updatedAt: new Date() }
                    });
                    console.log(`✅ Auto-verified ${pendingBookings.length} bookings for user ${context.userId}`);
                }
            }
            // 🚀 LOGIC END
            return verification;
        },
        verifyDocument: async (_, { userId, status, reason }, context) => {
            (0, authguard_1.isAdmin)(context);
            return await database_1.default.documentVerification.update({
                where: { userId },
                data: {
                    status,
                    rejectionReason: reason,
                    verifiedAt: status === 'APPROVED' ? new Date() : null
                }
            });
        },
        processDocumentOCR: async (_, { file, documentType, side }, context) => {
            (0, authguard_1.isAuthenticated)(context);
            try {
                const { createReadStream } = await file;
                const stream = createReadStream();
                const chunks = [];
                const buffer = await new Promise((resolve, reject) => {
                    stream.on('data', (chunk) => chunks.push(chunk));
                    stream.on('end', () => resolve(Buffer.concat(chunks)));
                    stream.on('error', reject);
                });
                const ocrService = new ocrService_1.OCRService();
                const serviceDocType = documentType?.toLowerCase().replace('_', '');
                const serviceSide = side?.toLowerCase();
                const ocrResult = await ocrService.extractDocumentData(buffer, serviceDocType, serviceSide);
                if (ocrResult.isQuotaExceeded)
                    return { isQuotaExceeded: true, fallbackUsed: false };
                return ocrResult;
            }
            catch (error) {
                console.error('OCR Processing Error:', error);
                return { fallbackUsed: true, isQuotaExceeded: false };
            }
        },
        updateUser: async (_, { input }, context) => {
            (0, authguard_1.isAuthenticated)(context);
            const dataToUpdate = { ...input };
            if (input.dateOfBirth)
                dataToUpdate.dateOfBirth = new Date(input.dateOfBirth);
            return await database_1.default.user.update({
                where: { id: context.userId },
                data: dataToUpdate
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
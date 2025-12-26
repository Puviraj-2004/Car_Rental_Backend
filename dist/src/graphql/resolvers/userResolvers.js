"use strict";
// backend/src/graphql/resolvers/userResolvers.ts
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
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
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
            (0, authguard_1.isOwnerOrAdmin)(context, id);
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
        // 1. Updated Simple Register (Username, Email, Phone, Password)
        register: async (_, { input }) => {
            const { email, username, password, phoneNumber } = input;
            const existingUser = await database_1.default.user.findFirst({
                where: {
                    OR: [{ email }, { username }]
                }
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
            (0, sendEmail_1.sendVerificationEmail)(user.email, generatedOTP).catch(console.error);
            const token = (0, auth_1.generateToken)(user.id, user.role);
            return {
                token,
                user,
                message: "Registration successful. Please verify your email."
            };
        },
        // 2. Login Resolver
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
                throw new Error('Email not verified. Please verify using OTP.');
            const token = (0, auth_1.generateToken)(user.id, user.role);
            return { token, user };
        },
        // 3. Updated Google Login (Handling Username for new users)
        googleLogin: async (_, { idToken }) => {
            try {
                const ticket = await client.verifyIdToken({
                    idToken,
                    audience: process.env.GOOGLE_CLIENT_ID,
                });
                const payload = ticket.getPayload();
                if (!payload || !payload.email)
                    throw new Error('Invalid Google token');
                const { email, sub: googleId } = payload;
                let user = await database_1.default.user.findUnique({ where: { email } });
                if (!user) {
                    // Creating a unique username from email prefix for social login
                    const baseUsername = email.split('@')[0];
                    user = await database_1.default.user.create({
                        data: {
                            email,
                            googleId,
                            username: `${baseUsername}_${Math.floor(Math.random() * 1000)}`,
                            phoneNumber: '', // Google doesn't provide phone; can be updated later
                            isEmailVerified: true,
                            role: 'USER'
                        }
                    });
                }
                else if (!user.googleId) {
                    user = await database_1.default.user.update({
                        where: { email },
                        data: { googleId, isEmailVerified: true }
                    });
                }
                const token = (0, auth_1.generateToken)(user.id, user.role);
                return { token, user, message: "Google login successful" };
            }
            catch (error) {
                console.error("Google Auth Error:", error);
                throw new Error('Google authentication failed');
            }
        },
        verifyOTP: async (_, { email, otp }) => {
            const user = await database_1.default.user.findUnique({ where: { email } });
            if (!user)
                throw new Error('User not found');
            if (user.isEmailVerified)
                throw new Error('User already verified');
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
        updateUser: async (_, { input }, context) => {
            (0, authguard_1.isAuthenticated)(context);
            return await database_1.default.user.update({
                where: { id: context.userId },
                data: input
            });
        },
        createOrUpdateDriverProfile: async (_, { input }, context) => {
            (0, authguard_1.isAuthenticated)(context);
            const dataToSave = { ...input, status: 'PENDING_REVIEW' };
            return await database_1.default.driverProfile.upsert({
                where: { userId: context.userId },
                update: dataToSave,
                create: { userId: context.userId, ...dataToSave }
            });
        },
        verifyDriverProfile: async (_, { userId, status, note }, context) => {
            (0, authguard_1.isAdmin)(context);
            return await database_1.default.driverProfile.update({
                where: { userId },
                data: { status, verificationNote: note }
            });
        },
        deleteUser: async (_, { id }, context) => {
            (0, authguard_1.isAdmin)(context);
            await database_1.default.user.delete({ where: { id } });
            return true;
        }
    },
    User: {
        driverProfile: async (parent) => {
            return await database_1.default.driverProfile.findUnique({ where: { userId: parent.id } });
        }
    }
};
//# sourceMappingURL=userResolvers.js.map
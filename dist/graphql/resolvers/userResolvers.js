"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userResolvers = void 0;
const auth_1 = require("../../utils/auth");
const database_1 = __importDefault(require("../../utils/database"));
const sendEmail_1 = require("../../utils/sendEmail");
exports.userResolvers = {
    Query: {
        me: async (_, __, context) => {
            if (!context.userId) {
                throw new Error('Authentication required');
            }
            return await database_1.default.user.findUnique({
                where: { id: context.userId },
                include: { bookings: true }
            });
        },
        user: async (_, { id }) => {
            return await database_1.default.user.findUnique({
                where: { id },
                include: { bookings: true }
            });
        },
        users: async () => {
            return await database_1.default.user.findMany({
                include: { bookings: true }
            });
        }
    },
    Mutation: {
        register: async (_, { input }) => {
            // 1. மின்னஞ்சல் ஏற்கனவே உள்ளதா எனச் சரிபார்க்க
            const existingUser = await database_1.default.user.findUnique({
                where: { email: input.email }
            });
            if (existingUser) {
                throw new Error('User already exists with this email');
            }
            // 2. Password-ஐ Hash செய்ய
            const hashedPassword = await (0, auth_1.hashPassword)(input.password);
            // 3. 6-இலக்க OTP மற்றும் காலாவதி நேரம் உருவாக்கம் (10 நிமிடம்)
            const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
            // 4. User-ஐ உருவாக்குதல்
            const user = await database_1.default.user.create({
                data: {
                    firstName: input.firstName,
                    lastName: input.lastName,
                    email: input.email,
                    password: hashedPassword,
                    phoneNumber: input.phoneNumber,
                    isVerified: false,
                    otp: generatedOTP,
                    otpExpires: otpExpiry,
                },
                include: { bookings: true }
            });
            // 5. மின்னஞ்சல் வழியாக OTP அனுப்புதல்
            try {
                await (0, sendEmail_1.sendVerificationEmail)(user.email, generatedOTP);
            }
            catch (error) {
                console.error("Email sending failed:", error);
            }
            // 6. லாகின் டோக்கன் (விரும்பினால்)
            const token = (0, auth_1.generateToken)(user.id, user.role);
            return {
                token,
                user,
                message: "Registration successful! Please check your email for the 6-digit OTP."
            };
        },
        // 🚀 OTP-ஐச் சரிபார்க்கும் புதிய மியூட்டேஷன்
        verifyOTP: async (_, { email, otp }) => {
            const user = await database_1.default.user.findUnique({ where: { email } });
            if (!user) {
                throw new Error('User not found');
            }
            if (user.isVerified) {
                throw new Error('User is already verified');
            }
            // OTP சரியாக இருக்கிறதா எனச் சரிபார்க்க
            if (user.otp !== otp) {
                throw new Error('Invalid OTP code');
            }
            // OTP காலாவதியாகிவிட்டதா எனச் சரிபார்க்க
            if (user.otpExpires && new Date() > user.otpExpires) {
                throw new Error('OTP has expired. Please request a new one.');
            }
            // User-ஐ Verified என மாற்றுதல்
            await database_1.default.user.update({
                where: { id: user.id },
                data: {
                    isVerified: true,
                    otp: null,
                    otpExpires: null
                }
            });
            return {
                success: true,
                message: "Account verified successfully! You can now login."
            };
        },
        login: async (_, { input }) => {
            const { email, password } = input;
            const user = await database_1.default.user.findUnique({
                where: { email },
                include: { bookings: true }
            });
            if (!user || !user.password) {
                throw new Error('Invalid email or password');
            }
            const isValidPassword = await (0, auth_1.comparePasswords)(password, user.password);
            if (!isValidPassword) {
                throw new Error('Invalid email or password');
            }
            // 🛡️ மின்னஞ்சல் சரிபார்க்கப்படாவிட்டால் லாகினைத் தடுத்தல்
            if (!user.isVerified) {
                throw new Error('Please verify your email address using the OTP before logging in.');
            }
            const token = (0, auth_1.generateToken)(user.id, user.role);
            return {
                token,
                user
            };
        },
        updateUser: async (_, { input }, context) => {
            if (!context.userId) {
                throw new Error('Authentication required');
            }
            return await database_1.default.user.update({
                where: { id: context.userId },
                data: input,
                include: { bookings: true }
            });
        },
        deleteUser: async (_, { id }) => {
            await database_1.default.user.delete({
                where: { id }
            });
            return true;
        }
    },
    User: {
        bookings: async (parent) => {
            return await database_1.default.booking.findMany({
                where: { userId: parent.id }
            });
        }
    }
};
//# sourceMappingURL=userResolvers.js.map
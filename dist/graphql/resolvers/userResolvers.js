"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userResolvers = void 0;
const auth_1 = require("../../utils/auth");
const database_1 = __importDefault(require("../../utils/database"));
const crypto_1 = __importDefault(require("crypto"));
const sendEmail_1 = require("../../utils/sendEmail"); // 🚀 இதை நாம் அடுத்து உருவாக்குவோம்
exports.userResolvers = {
    Query: {
        me: async (_, __, context) => {
            if (!context.userId)
                throw new Error('Authentication required');
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
            return await database_1.default.user.findMany({ include: { bookings: true } });
        }
    },
    Mutation: {
        register: async (_, { input }) => {
            const existingUser = await database_1.default.user.findUnique({ where: { email: input.email } });
            if (existingUser)
                throw new Error('User already exists with this email');
            const hashedPassword = await (0, auth_1.hashPassword)(input.password);
            const vToken = crypto_1.default.randomBytes(32).toString('hex');
            const user = await database_1.default.user.create({
                data: {
                    firstName: input.firstName,
                    lastName: input.lastName,
                    email: input.email,
                    password: hashedPassword,
                    phoneNumber: input.phoneNumber,
                    isVerified: false,
                    verifyToken: vToken,
                },
                include: { bookings: true }
            });
            // 📧 பயனர் பதிவு செய்தவுடன் மின்னஞ்சல் அனுப்புதல்
            try {
                await (0, sendEmail_1.sendVerificationEmail)(user.email, vToken);
            }
            catch (error) {
                console.error("Email error:", error);
            }
            const token = (0, auth_1.generateToken)(user.id, user.role);
            return { token, user, message: "Registration successful! Please check your email." };
        },
        // 🚀 மின்னஞ்சலை உறுதிப்படுத்தும் புதிய மியூட்டேஷன்
        verifyEmail: async (_, { token }) => {
            const user = await database_1.default.user.findFirst({ where: { verifyToken: token } });
            if (!user)
                throw new Error('Invalid or expired token');
            await database_1.default.user.update({
                where: { id: user.id },
                data: { isVerified: true, verifyToken: null }
            });
            return { success: true, message: "Email verified successfully!" };
        },
        login: async (_, { input }) => {
            const { email, password } = input;
            const user = await database_1.default.user.findUnique({ where: { email }, include: { bookings: true } });
            if (!user || !user.password)
                throw new Error('Invalid email or password');
            const isValidPassword = await (0, auth_1.comparePasswords)(password, user.password);
            if (!isValidPassword)
                throw new Error('Invalid email or password');
            // 🛡️ மின்னஞ்சல் உறுதிப்படுத்தப்படாவிட்டால் லாகினைத் தடுக்க இது உதவும்
            if (!user.isVerified) {
                throw new Error('Please verify your email address before logging in.');
            }
            const token = (0, auth_1.generateToken)(user.id, user.role);
            return { token, user };
        },
        updateUser: async (_, { input }, context) => {
            if (!context.userId)
                throw new Error('Authentication required');
            return await database_1.default.user.update({
                where: { id: context.userId },
                data: input,
                include: { bookings: true }
            });
        },
        deleteUser: async (_, { id }) => {
            await database_1.default.user.delete({ where: { id } });
            return true;
        }
    },
    User: {
        bookings: async (parent) => {
            return await database_1.default.booking.findMany({ where: { userId: parent.id } });
        }
    }
};
//# sourceMappingURL=userResolvers.js.map
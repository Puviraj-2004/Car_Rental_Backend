"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userResolvers = void 0;
const client_1 = require("@prisma/client");
const auth_1 = require("../../utils/auth");
const prisma = new client_1.PrismaClient();
exports.userResolvers = {
    Query: {
        me: async (_, __, context) => {
            if (!context.userId) {
                throw new Error('Authentication required');
            }
            return await prisma.user.findUnique({
                where: { id: context.userId },
                include: { bookings: true }
            });
        },
        user: async (_, { id }) => {
            return await prisma.user.findUnique({
                where: { id },
                include: { bookings: true }
            });
        },
        users: async () => {
            return await prisma.user.findMany({
                include: { bookings: true }
            });
        }
    },
    Mutation: {
        register: async (_, { input }) => {
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email: input.email }
            });
            if (existingUser) {
                throw new Error('User already exists');
            }
            // Hash password
            const hashedPassword = await (0, auth_1.hashPassword)(input.password);
            // Create user
            const user = await prisma.user.create({
                data: {
                    ...input,
                    password: hashedPassword,
                    language: input.language || 'en',
                    consentDate: input.gdprConsent ? new Date() : null
                },
                include: { bookings: true }
            });
            // Generate JWT token
            const token = (0, auth_1.generateToken)(user.id);
            return {
                token,
                user
            };
        },
        login: async (_, { input }) => {
            const { email, password } = input;
            // Find user
            const user = await prisma.user.findUnique({
                where: { email },
                include: { bookings: true }
            });
            if (!user) {
                throw new Error('Invalid credentials');
            }
            // Check password
            const isValidPassword = await (0, auth_1.comparePasswords)(password, user.password);
            if (!isValidPassword) {
                throw new Error('Invalid credentials');
            }
            // Generate JWT token
            const token = (0, auth_1.generateToken)(user.id);
            return {
                token,
                user
            };
        },
        updateUser: async (_, { input }, context) => {
            if (!context.userId) {
                throw new Error('Authentication required');
            }
            return await prisma.user.update({
                where: { id: context.userId },
                data: input,
                include: { bookings: true }
            });
        },
        deleteUser: async (_, { id }) => {
            await prisma.user.delete({
                where: { id }
            });
            return true;
        }
    },
    User: {
        bookings: async (parent) => {
            return await prisma.booking.findMany({
                where: { userId: parent.id }
            });
        }
    }
};
//# sourceMappingURL=userResolvers.js.map
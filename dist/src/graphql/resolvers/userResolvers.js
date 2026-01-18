"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userResolvers = void 0;
const authguard_1 = require("../../utils/authguard");
const userService_1 = require("../../services/userService");
const graphqlRateLimiter_1 = require("../../middleware/graphqlRateLimiter");
const bookingService_1 = require("../../services/bookingService");
exports.userResolvers = {
    Query: {
        me: async (_, __, context) => {
            (0, authguard_1.isAuthenticated)(context);
            return await userService_1.userService.getCurrentUser(context.userId);
        },
        user: async (_, { id }, context) => {
            (0, authguard_1.isAdmin)(context);
            return await userService_1.userService.getUserById(id);
        },
        users: async (_, __, context) => {
            (0, authguard_1.isAdmin)(context);
            return await userService_1.userService.getAllUsers();
        },
        myVerification: async (_, __, context) => {
            (0, authguard_1.isAuthenticated)(context);
            return await userService_1.userService.getUserVerification(context.userId);
        },
        checkCarAvailability: async (_, { carId, startDate, endDate, excludeBookingId }) => {
            return await bookingService_1.bookingService.checkAvailability(carId, startDate, endDate, excludeBookingId);
        }
    },
    Mutation: {
        register: async (_, { input }, context) => {
            // Apply rate limiting for registration attempts
            const rateLimitKey = (0, graphqlRateLimiter_1.generateRateLimitKey)('register', undefined, context.req?.ip);
            graphqlRateLimiter_1.registrationLimiter.checkLimit(rateLimitKey);
            return await userService_1.userService.register(input);
        },
        login: async (_, { input }, context) => {
            // Apply rate limiting for login attempts
            const rateLimitKey = (0, graphqlRateLimiter_1.generateRateLimitKey)('login', undefined, context.req?.ip);
            graphqlRateLimiter_1.authOperationLimiter.checkLimit(rateLimitKey);
            return await userService_1.userService.login(input);
        },
        googleLogin: async (_, { idToken }) => {
            return await userService_1.userService.googleLogin(idToken);
        },
        createOrUpdateVerification: async (_, { input }, context) => {
            (0, authguard_1.isAuthenticated)(context);
            return await userService_1.userService.createOrUpdateVerification(input.bookingId, input);
        },
        verifyDocument: async (_, { userId, status }, context) => {
            (0, authguard_1.isAdmin)(context);
            return await userService_1.userService.verifyDocument(userId, status);
        },
        processDocumentOCR: async (_, { file, documentType, side }, context) => {
            (0, authguard_1.isAuthenticated)(context);
            return await userService_1.userService.processOCR(file, documentType, side);
        },
        updateUser: async (_, { input }, context) => {
            (0, authguard_1.isAuthenticated)(context);
            return await userService_1.userService.updateCurrentUser(context.userId, input);
        },
        deleteUser: async (_, { id }, context) => {
            (0, authguard_1.isAdmin)(context);
            await userService_1.userService.deleteUser(id);
            return true;
        }
    }
};
//# sourceMappingURL=userResolvers.js.map
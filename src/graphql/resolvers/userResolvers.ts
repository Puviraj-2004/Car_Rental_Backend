import { isAuthenticated, isAdmin } from '../../utils/authguard';
import { userService } from '../../services/userService';
import { authOperationLimiter, registrationLimiter, generateRateLimitKey } from '../../middleware/graphqlRateLimiter';
import { bookingService } from '../../services/bookingService';

export const userResolvers = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      isAuthenticated(context);
      return await userService.getCurrentUser(context.userId);
    },
    user: async (_: any, { id }: { id: string }, context: any) => {
      isAdmin(context);
      return await userService.getUserById(id);
    },
    users: async (_: any, __: any, context: any) => {
      isAdmin(context);
      return await userService.getAllUsers();
    },
    myVerification: async (_: any, __: any, context: any) => {
      isAuthenticated(context);
      return await userService.getUserVerification(context.userId);
    },
    checkCarAvailability: async (_: any, { carId, startDate, endDate, excludeBookingId }: any) => {
      return await bookingService.checkAvailability(carId, startDate, endDate, excludeBookingId);
    },
    isEmailAvailable: async (_: any, { email }: { email: string }) => {
      return await userService.isEmailAvailable(email);
    }
  },

  Mutation: {
    register: async (_: any, { input }: { input: any }, context: any) => {
      // Apply rate limiting for registration attempts
      const rateLimitKey = generateRateLimitKey('register', undefined, context.req?.ip);
      registrationLimiter.checkLimit(rateLimitKey);

      return await userService.register(input);
    },

    login: async (_: any, { input }: { input: any }, context: any) => {
      // Apply rate limiting for login attempts
      const rateLimitKey = generateRateLimitKey('login', undefined, context.req?.ip);
      authOperationLimiter.checkLimit(rateLimitKey);

      return await userService.login(input);
    },

    googleLogin: async (_: any, { idToken }: { idToken: string }) => {
      return await userService.googleLogin(idToken);
    },

    verifyOTP: async (_: any, { email, otp }: { email: string; otp: string }) => {
      return await userService.verifyOTP(email, otp);
    },

    resendOTP: async (_: any, { email }: { email: string }) => {
      // Apply rate limiting for OTP resend (max 5 per minute)
      const rateLimitKey = generateRateLimitKey('resendOTP', undefined, email);
      authOperationLimiter.checkLimit(rateLimitKey);

      return await userService.resendOTP(email);
    },

    createOrUpdateVerification: async (_: any, { input }: { input: any }, context: any) => {
      isAuthenticated(context);
      return await userService.createOrUpdateVerification(input.bookingId, input);
    },

    verifyDocument: async (_: any, { userId, status }: any, context: any) => {
      isAdmin(context);
      return await userService.verifyDocument(userId, status);
    },

    processDocumentOCR: async (_: any, { file, documentType, side }: any, context: any) => {
      isAuthenticated(context);
      return await userService.processOCR(file, documentType, side);
    },

    updateUser: async (_: any, { input }: { input: any }, context: any) => {
      isAuthenticated(context);
      return await userService.updateCurrentUser(context.userId, input);
    },

    deleteUser: async (_: any, { id }: { id: string }, context: any) => {
      isAdmin(context);
      await userService.deleteUser(id);
      return true;
    }
  }
};
import { isAuthenticated, isAdmin } from '../../utils/authguard';
import { userService } from '../../services/userService';
import { authOperationLimiter, registrationLimiter, generateRateLimitKey } from '../../middleware/graphqlRateLimiter';

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

    createOrUpdateVerification: async (_: any, { input }: { input: any }, context: any) => {
      isAuthenticated(context);
      return await userService.createOrUpdateVerification(context.userId, input);
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
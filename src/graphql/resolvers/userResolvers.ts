import { generateToken, hashPassword, comparePasswords } from '../../utils/auth';
import prisma from '../../utils/database';

export const userResolvers = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      if (!context.userId) {
        throw new Error('Authentication required');
      }

      return await prisma.user.findUnique({
        where: { id: context.userId },
        include: { bookings: true }
      });
    },

    user: async (_: any, { id }: { id: string }) => {
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
    register: async (_: any, { input }: { input: any }) => {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email }
      });

      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password
      const hashedPassword = await hashPassword(input.password);

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

      // Generate JWT token with role
      const token = generateToken(user.id, user.role);

      return {
        token,
        user
      };
    },

    login: async (_: any, { input }: { input: any }) => {
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
      const isValidPassword = await comparePasswords(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Generate JWT token with role
      const token = generateToken(user.id, user.role);

      return {
        token,
        user
      };
    },

    updateUser: async (_: any, { input }: { input: any }, context: any) => {
      if (!context.userId) {
        throw new Error('Authentication required');
      }

      return await prisma.user.update({
        where: { id: context.userId },
        data: input,
        include: { bookings: true }
      });
    },

    deleteUser: async (_: any, { id }: { id: string }) => {
      await prisma.user.delete({
        where: { id }
      });

      return true;
    }
  },

  User: {
    bookings: async (parent: any) => {
      return await prisma.booking.findMany({
        where: { userId: parent.id }
      });
    }
  }
};
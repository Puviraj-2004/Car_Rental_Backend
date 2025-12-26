// backend/src/graphql/resolvers/userResolvers.ts

import { OAuth2Client } from 'google-auth-library';
import prisma from '../../utils/database';
import { generateToken, hashPassword, comparePasswords } from '../../utils/auth';
import { sendVerificationEmail } from '../../utils/sendEmail';
import { validatePassword } from '../../utils/validation';
import { isAuthenticated, isAdmin, isOwnerOrAdmin } from '../../utils/authguard';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const userResolvers = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      isAuthenticated(context);
      return await prisma.user.findUnique({
        where: { id: context.userId },
        include: { driverProfile: true, bookings: true }
      });
    },

    user: async (_: any, { id }: { id: string }, context: any) => {
      isOwnerOrAdmin(context, id);
      return await prisma.user.findUnique({
        where: { id },
        include: { driverProfile: true, bookings: true }
      });
    },

    users: async (_: any, __: any, context: any) => {
      isAdmin(context);
      return await prisma.user.findMany({
        include: { driverProfile: true, bookings: true }
      });
    },
    
    myDriverProfile: async (_: any, __: any, context: any) => {
      isAuthenticated(context);
      return await prisma.driverProfile.findUnique({
        where: { userId: context.userId }
      });
    }
  },

  Mutation: {
    // 1. Updated Simple Register (Username, Email, Phone, Password)
    register: async (_: any, { input }: { input: any }) => {
      const { email, username, password, phoneNumber } = input;

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { username }]
        }
      });

      if (existingUser) {
        throw new Error('User already exists with this email or username');
      }
      
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new Error(`Password weak: ${passwordValidation.errors.join(', ')}`);
      }

      const hashedPassword = await hashPassword(password);
      const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); 

      const user = await prisma.user.create({
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

      sendVerificationEmail(user.email, generatedOTP).catch(console.error);
      const token = generateToken(user.id, user.role);

      return {
        token,
        user,
        message: "Registration successful. Please verify your email."
      };
    },

    // 2. Login Resolver
    login: async (_: any, { input }: { input: any }) => {
      const { email, password } = input;
      const user = await prisma.user.findUnique({
        where: { email },
        include: { driverProfile: true }
      });

      if (!user || !user.password) throw new Error('Invalid email or password');

      const isValidPassword = await comparePasswords(password, user.password);
      if (!isValidPassword) throw new Error('Invalid email or password');

      if (!user.isEmailVerified) throw new Error('Email not verified. Please verify using OTP.');

      const token = generateToken(user.id, user.role);
      return { token, user };
    },

    // 3. Updated Google Login (Handling Username for new users)
    googleLogin: async (_: any, { idToken }: { idToken: string }) => {
      try {
        const ticket = await client.verifyIdToken({
          idToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) throw new Error('Invalid Google token');

        const { email, sub: googleId } = payload;

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          // Creating a unique username from email prefix for social login
          const baseUsername = email.split('@')[0];
          user = await prisma.user.create({
            data: {
              email,
              googleId,
              username: `${baseUsername}_${Math.floor(Math.random() * 1000)}`,
              phoneNumber: '', // Google doesn't provide phone; can be updated later
              isEmailVerified: true,
              role: 'USER'
            }
          });
        } else if (!user.googleId) {
          user = await prisma.user.update({
            where: { email },
            data: { googleId, isEmailVerified: true }
          });
        }

        const token = generateToken(user.id, user.role);
        return { token, user, message: "Google login successful" };
      } catch (error) {
        console.error("Google Auth Error:", error);
        throw new Error('Google authentication failed');
      }
    },

    verifyOTP: async (_: any, { email, otp }: { email: string, otp: string }) => {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) throw new Error('User not found');
      if (user.isEmailVerified) throw new Error('User already verified');
      if (user.otp !== otp) throw new Error('Invalid OTP');
      if (user.otpExpires && new Date() > user.otpExpires) throw new Error('OTP expired');

      await prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true, otp: null, otpExpires: null }
      });

      return { success: true, message: "Email verified successfully." };
    },

    updateUser: async (_: any, { input }: { input: any }, context: any) => {
      isAuthenticated(context);
      return await prisma.user.update({
        where: { id: context.userId },
        data: input
      });
    },

    createOrUpdateDriverProfile: async (_: any, { input }: { input: any }, context: any) => {
      isAuthenticated(context);
      const dataToSave = { ...input, status: 'PENDING_REVIEW' };

      return await prisma.driverProfile.upsert({
        where: { userId: context.userId },
        update: dataToSave,
        create: { userId: context.userId, ...dataToSave }
      });
    },

    verifyDriverProfile: async (_: any, { userId, status, note }: any, context: any) => {
      isAdmin(context);
      return await prisma.driverProfile.update({
        where: { userId },
        data: { status, verificationNote: note }
      });
    },

    deleteUser: async (_: any, { id }: { id: string }, context: any) => {
      isAdmin(context);
      await prisma.user.delete({ where: { id } });
      return true;
    }
  },
  
  User: {
    driverProfile: async (parent: any) => {
      return await prisma.driverProfile.findUnique({ where: { userId: parent.id } });
    }
  }
};
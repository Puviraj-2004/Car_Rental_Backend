import { generateToken, hashPassword, comparePasswords } from '../../utils/auth';
import prisma from '../../utils/database';
import crypto from 'crypto';
import { sendVerificationEmail } from '../../utils/sendEmail'; // 🚀 இதை நாம் அடுத்து உருவாக்குவோம்

export const userResolvers = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      if (!context.userId) throw new Error('Authentication required');
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
      return await prisma.user.findMany({ include: { bookings: true } });
    }
  },

  Mutation: {
    register: async (_: any, { input }: { input: any }) => {
      const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
      if (existingUser) throw new Error('User already exists with this email');

      const hashedPassword = await hashPassword(input.password);
      const vToken = crypto.randomBytes(32).toString('hex');

      const user = await prisma.user.create({
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
        await sendVerificationEmail(user.email, vToken);
      } catch (error) {
        console.error("Email error:", error);
      }

      const token = generateToken(user.id, user.role);
      return { token, user, message: "Registration successful! Please check your email." };
    },

    // 🚀 மின்னஞ்சலை உறுதிப்படுத்தும் புதிய மியூட்டேஷன்
    verifyEmail: async (_: any, { token }: { token: string }) => {
      const user = await prisma.user.findFirst({ where: { verifyToken: token } });
      if (!user) throw new Error('Invalid or expired token');

      await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true, verifyToken: null }
      });

      return { success: true, message: "Email verified successfully!" };
    },

    login: async (_: any, { input }: { input: any }) => {
      const { email, password } = input;
      const user = await prisma.user.findUnique({ where: { email }, include: { bookings: true } });

      if (!user || !user.password) throw new Error('Invalid email or password');
      
      const isValidPassword = await comparePasswords(password, user.password);
      if (!isValidPassword) throw new Error('Invalid email or password');

      // 🛡️ மின்னஞ்சல் உறுதிப்படுத்தப்படாவிட்டால் லாகினைத் தடுக்க இது உதவும்
      if (!user.isVerified) {
        throw new Error('Please verify your email address before logging in.');
      }

      const token = generateToken(user.id, user.role);
      return { token, user };
    },

    updateUser: async (_: any, { input }: { input: any }, context: any) => {
      if (!context.userId) throw new Error('Authentication required');
      return await prisma.user.update({
        where: { id: context.userId },
        data: input,
        include: { bookings: true }
      });
    },

    deleteUser: async (_: any, { id }: { id: string }) => {
      await prisma.user.delete({ where: { id } });
      return true;
    }
  },

  User: {
    bookings: async (parent: any) => {
      return await prisma.booking.findMany({ where: { userId: parent.id } });
    }
  }
};
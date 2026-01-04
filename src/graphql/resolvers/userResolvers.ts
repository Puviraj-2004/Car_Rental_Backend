import { OAuth2Client } from 'google-auth-library';
import prisma from '../../utils/database';
import { generateToken, hashPassword, comparePasswords } from '../../utils/auth';
import { isAuthenticated, isAdmin } from '../../utils/authguard';
import { OCRService } from '../../services/ocrService';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const USER_INCLUDES = { verification: true, bookings: true };

export const userResolvers = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      isAuthenticated(context);
      return await prisma.user.findUnique({
        where: { id: context.userId },
        include: USER_INCLUDES
      });
    },
    user: async (_: any, { id }: { id: string }, context: any) => {
      isAdmin(context);
      return await prisma.user.findUnique({ where: { id }, include: USER_INCLUDES });
    },
    users: async (_: any, __: any, context: any) => {
      isAdmin(context);
      return await prisma.user.findMany({ include: USER_INCLUDES });
    },
    myVerification: async (_: any, __: any, context: any) => {
      isAuthenticated(context);
      return await prisma.documentVerification.findUnique({ where: { userId: context.userId } });
    }
  },

  Mutation: {
    register: async (_: any, { input }: { input: any }) => {
      const { email, password, phoneNumber, fullName } = input;
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) throw new Error('User already exists');
      
      const hashedPassword = await hashPassword(password);
      const user = await prisma.user.create({
        data: { email, password: hashedPassword, phoneNumber, fullName, role: 'USER' }
      });
      return { token: generateToken(user.id, user.role), user, message: "Registration successful." };
    },

    login: async (_: any, { input }: { input: any }) => {
      const { email, password } = input;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.password) throw new Error('Invalid credentials');
      
      const isValid = await comparePasswords(password, user.password);
      if (!isValid) throw new Error('Invalid credentials');
      return { token: generateToken(user.id, user.role), user };
    },

    googleLogin: async (_: any, { idToken }: { idToken: string }) => {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) throw new Error('Invalid Google token');

        const { email, sub: googleId, name } = payload;
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: { email, googleId, fullName: name, role: 'USER' }
          });
        } else if (!user.googleId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { googleId }
          });
        }
        return { token: generateToken(user.id, user.role), user, message: "Google login successful" };
      } catch (error) {
        throw new Error('Google authentication failed');
      }
    },

    // 🔥 MAIN LOGIC: AI Verification & Auto Booking Update
    createOrUpdateVerification: async (_: any, { input }: { input: any }, context: any) => {
      isAuthenticated(context);

      const existingVerification = await prisma.documentVerification.findUnique({
        where: { userId: context.userId }
      });

      // 1. Save Document Data (from Manual or AI input)
      const dataToSave = {
        licenseCategory: input.licenseCategory || 'B',
        licenseFrontUrl: input.licenseFrontUrl || existingVerification?.licenseFrontUrl,
        licenseBackUrl: input.licenseBackUrl || existingVerification?.licenseBackUrl,
        idCardUrl: input.idCardUrl || existingVerification?.idCardUrl,
        addressProofUrl: input.addressProofUrl || existingVerification?.addressProofUrl,
        licenseNumber: input.licenseNumber || existingVerification?.licenseNumber,
        licenseExpiry: input.licenseExpiry ? new Date(input.licenseExpiry) : existingVerification?.licenseExpiry,
        idNumber: input.idNumber || existingVerification?.idNumber,
        idExpiry: input.idExpiry ? new Date(input.idExpiry) : existingVerification?.idExpiry,
        status: 'PENDING' as const
      };

      const verification = await prisma.documentVerification.upsert({
        where: { userId: context.userId },
        update: dataToSave,
        create: { user: { connect: { id: context.userId } }, ...dataToSave }
      });

      // 🚀 LOGIC START: If AI/User provided critical info, Auto-Approve & Update Bookings
      // Minimum Requirement: License Number + License Front Image
      if (verification.licenseNumber && verification.licenseFrontUrl) {
        
        // A. Auto Approve Profile
        await prisma.documentVerification.update({
          where: { userId: context.userId },
          data: { 
            status: 'APPROVED', 
            verifiedAt: new Date() 
          }
        });

        // B. Find "PENDING" bookings for this user
        const pendingBookings = await prisma.booking.findMany({
          where: { userId: context.userId, status: 'PENDING' }
        });

        // C. Update Booking Status to VERIFIED
        // Important: Update `updatedAt` to reset the 15-minute payment timer
        if (pendingBookings.length > 0) {
            await prisma.booking.updateMany({
                where: { userId: context.userId, status: 'PENDING' },
                data: { status: 'VERIFIED', updatedAt: new Date() }
            });
            console.log(`✅ Auto-verified ${pendingBookings.length} bookings for user ${context.userId}`);
        }
      }
      // 🚀 LOGIC END

      return verification;
    },

    verifyDocument: async (_: any, { userId, status, reason }: any, context: any) => {
      isAdmin(context);
      return await prisma.documentVerification.update({
        where: { userId },
        data: {
          status,
          rejectionReason: reason,
          verifiedAt: status === 'APPROVED' ? new Date() : null
        }
      });
    },

    processDocumentOCR: async (_: any, { file, documentType, side }: any, context: any) => {
      isAuthenticated(context);
      try {
        const { createReadStream } = await file;
        const stream = createReadStream();
        const chunks: Buffer[] = [];
        const buffer = await new Promise<Buffer>((resolve, reject) => {
          stream.on('data', (chunk: Buffer) => chunks.push(chunk));
          stream.on('end', () => resolve(Buffer.concat(chunks)));
          stream.on('error', reject);
        });

        const ocrService = new OCRService();
        const serviceDocType = documentType?.toLowerCase().replace('_', '');
        const serviceSide = side?.toLowerCase();

        const ocrResult = await ocrService.extractDocumentData(buffer, serviceDocType, serviceSide);
        if (ocrResult.isQuotaExceeded) return { isQuotaExceeded: true, fallbackUsed: false };
        return ocrResult;

      } catch (error) {
        console.error('OCR Processing Error:', error);
        return { fallbackUsed: true, isQuotaExceeded: false };
      }
    },

    updateUser: async (_: any, { input }: { input: any }, context: any) => {
      isAuthenticated(context);
      const dataToUpdate = { ...input };
      if (input.dateOfBirth) dataToUpdate.dateOfBirth = new Date(input.dateOfBirth);
      
      return await prisma.user.update({
        where: { id: context.userId },
        data: dataToUpdate
      });
    },

    deleteUser: async (_: any, { id }: { id: string }, context: any) => {
      isAdmin(context);
      await prisma.user.delete({ where: { id } });
      return true;
    }
  }
};
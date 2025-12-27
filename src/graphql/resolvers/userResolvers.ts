import { OAuth2Client } from 'google-auth-library';
import prisma from '../../utils/database';
import { generateToken, hashPassword, comparePasswords } from '../../utils/auth';
import { sendVerificationEmail } from '../../utils/sendEmail';
import { validatePassword } from '../../utils/validation';
import { isAuthenticated, isAdmin } from '../../utils/authguard';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
      isAdmin(context); // பொதுவாக அட்மின் மட்டுமே பிற யூசர்களைப் பார்க்க வேண்டும்
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
    // 1. Register: simplified & added Audit Log
    register: async (_: any, { input }: { input: any }) => {
      const { email, username, password, phoneNumber } = input;

      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] }
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

      // Send OTP Email
      await sendVerificationEmail(user.email, generatedOTP).catch(console.error);

      // Industrial standard: Log the registration
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'USER_REGISTERED',
          details: { email: user.email }
        }
      });

      return {
        token: "", // லாகின் செய்யும் போது மட்டும் டோக்கன் கொடுக்கலாம்
        user,
        message: "Registration successful. Please check your email for OTP."
      };
    },

    // 2. Login: added login check
    login: async (_: any, { input }: { input: any }) => {
      const { email, password } = input;
      const normalizedEmail = email.toLowerCase();
      const user = await prisma.user.findUnique({
        where: { email:normalizedEmail},
        include: { driverProfile: true }
      });

      if (!user || !user.password) throw new Error('Invalid email or password');

      const isValidPassword = await comparePasswords(password, user.password);
      if (!isValidPassword) throw new Error('Invalid email or password');

      if (!user.isEmailVerified) throw new Error('Please verify your email first.');

      const token = generateToken(user.id, user.role);

      // Log Login action
      await prisma.auditLog.create({
        data: { userId: user.id, action: 'USER_LOGIN' }
      });

      return { token, user };
    },

    // 3. Google Login with Required Field handling
    googleLogin: async (_: any, { idToken }: { idToken: string }) => {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) throw new Error('Invalid Google token');

        const { email, sub: googleId } = payload;
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          const baseUsername = email.split('@')[0];
          user = await prisma.user.create({
            data: {
              email,
              googleId,
              username: `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`,
              phoneNumber: '0000000000', // Placeholder as it's required!
              isEmailVerified: true,
              role: 'USER'
            }
          });
        }

        const token = generateToken(user.id, user.role);
        return { token, user, message: "Google login successful" };
      } catch (error) {
        throw new Error('Google authentication failed');
      }
    },

    // 4. ✅  Facebook Login Resolver
    facebookLogin: async (_: any, { accessToken }: { accessToken: string }) => {
      try {
        // Verify token directly with Facebook Graph API
        // This fetches ID, Name, and Email
        const fbResponse = await fetch(
          `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`
        );
        
        const fbData: any = await fbResponse.json();

        // Check for error from Facebook
        if (fbData.error) {
          console.error("Facebook API Error:", fbData.error);
          throw new Error('Invalid Facebook Token');
        }

        // Ensure email exists (some FB accounts verify via phone only)
        if (!fbData.email) {
          throw new Error('Facebook account must have an email address to sign up.');
        }

        const { email, id: facebookId } = fbData;

        // Check if user exists
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          // Create new user
          const baseUsername = email.split('@')[0];
          user = await prisma.user.create({
            data: {
              email,
              facebookId,
              // Generate a random unique username
              username: `${baseUsername}_${Math.floor(Math.random() * 1000)}`,
              phoneNumber: '',
              isEmailVerified: true,
              role: 'USER'
            }
          });
        } else if (!user.facebookId) {
          // Merge existing user with Facebook ID
          user = await prisma.user.update({
            where: { email },
            data: { facebookId, isEmailVerified: true }
          });
        }

        // Generate Backend JWT
        const token = generateToken(user.id, user.role);
        
        return { 
          token, 
          user, 
          message: "Facebook login successful" 
        };

      } catch (error) {
        console.error("Facebook Auth Error:", error);
        throw new Error('Facebook authentication failed');
      }
    },

    // 4. Verify OTP
    verifyOTP: async (_: any, { email, otp }: { email: string, otp: string }) => {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) throw new Error('User not found');
      if (user.otp !== otp) throw new Error('Invalid OTP');
      if (user.otpExpires && new Date() > user.otpExpires) throw new Error('OTP expired');

      await prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true, otp: null, otpExpires: null }
      });

      return { success: true, message: "Email verified successfully." };
    },

    // 5. KYC Profile Update - Using proper DateTime conversion
    createOrUpdateDriverProfile: async (_: any, { input }: { input: any }, context: any) => {
      isAuthenticated(context);
      
      // Industrial Logic: Convert string dates to actual Date objects for DB
      const dataToSave = { 
        ...input, 
        licenseExpiry: input.licenseExpiry ? new Date(input.licenseExpiry) : null,
        licenseIssueDate: input.licenseIssueDate ? new Date(input.licenseIssueDate) : null,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
        status: 'PENDING_REVIEW' 
      };

      const profile = await prisma.driverProfile.upsert({
        where: { userId: context.userId },
        update: dataToSave,
        create: { userId: context.userId, ...dataToSave }
      });

      // Log the profile upload
      await prisma.auditLog.create({
        data: { 
          userId: context.userId, 
          action: 'DRIVER_PROFILE_UPLOADED',
          details: { profileId: profile.id }
        }
      });

      return profile;
    },

    // 6. Admin Verification
    verifyDriverProfile: async (_: any, { userId, status, note }: any, context: any) => {
      isAdmin(context);

      const profile = await prisma.driverProfile.update({
        where: { userId },
        data: { status, verificationNote: note }
      });

      // Log Admin Action
      await prisma.auditLog.create({
        data: { 
          userId: context.userId, 
          action: `DRIVER_VERIFICATION_${status}`,
          details: { targetUserId: userId, note }
        }
      });

      return profile;
    },

    updateUser: async (_: any, { input }: { input: any }, context: any) => {
      isAuthenticated(context);
      return await prisma.user.update({
        where: { id: context.userId },
        data: input
      });
    },

    deleteUser: async (_: any, { id }: { id: string }, context: any) => {
      isAdmin(context);
      await prisma.user.delete({ where: { id } });
      return true;
    }
  }
};
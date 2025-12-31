import { OAuth2Client } from 'google-auth-library';
import prisma from '../../utils/database';
import { generateToken, hashPassword, comparePasswords } from '../../utils/auth';
import { sendVerificationEmail } from '../../utils/sendEmail';
import { validatePassword } from '../../utils/validation';
import { isAuthenticated, isAdmin } from '../../utils/authguard';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { ocrService, ExtractedDocumentData } from '../../services/ocrService';

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
      const user = await prisma.user.findUnique({
        where: { email },
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

      // Get existing profile to preserve Cloudinary URLs
      const existingProfile = await prisma.driverProfile.findUnique({
        where: { userId: context.userId },
        select: {
          licenseFrontUrl: true,
          licenseFrontPublicId: true,
          licenseBackUrl: true,
          licenseBackPublicId: true,
          idProofUrl: true,
          idProofPublicId: true,
          addressProofUrl: true,
          addressProofPublicId: true
        }
      });

      // Industrial Logic: Convert string dates to actual Date objects for DB
      // Note: GraphQL accepts birthDate as an alias for dateOfBirth. Prisma model uses dateOfBirth.
      // Also ensure we don't pass birthDate down to Prisma (unknown field).
      const { birthDate, ...inputWithoutBirthDate } = input;
      const birthDateString = inputWithoutBirthDate.dateOfBirth || birthDate;

      const licenseCategoryUpdate = inputWithoutBirthDate.licenseCategory
        ? { licenseCategory: inputWithoutBirthDate.licenseCategory }
        : {};

      const parsedLicenseExpiry = input.licenseExpiry ? new Date(input.licenseExpiry) : null;
      const parsedLicenseIssueDate = input.licenseIssueDate ? new Date(input.licenseIssueDate) : null;
      const parsedDob = birthDateString ? new Date(birthDateString) : null;

      const dataToSave = {
        ...inputWithoutBirthDate,
        ...licenseCategoryUpdate,
        licenseExpiry: parsedLicenseExpiry,
        licenseIssueDate: parsedLicenseIssueDate,
        dateOfBirth: parsedDob,
        restrictsToAutomatic: typeof inputWithoutBirthDate.restrictsToAutomatic === 'boolean' ? inputWithoutBirthDate.restrictsToAutomatic : false,
        licenseCategories: Array.isArray(inputWithoutBirthDate.licenseCategories) ? inputWithoutBirthDate.licenseCategories : undefined,
        // Preserve existing Cloudinary URLs
        licenseFrontUrl: existingProfile?.licenseFrontUrl,
        licenseFrontPublicId: existingProfile?.licenseFrontPublicId,
        licenseBackUrl: existingProfile?.licenseBackUrl,
        licenseBackPublicId: existingProfile?.licenseBackPublicId,
        idProofUrl: existingProfile?.idProofUrl,
        idProofPublicId: existingProfile?.idProofPublicId,
        addressProofUrl: existingProfile?.addressProofUrl,
        addressProofPublicId: existingProfile?.addressProofPublicId
        // Don't set status here - it will be updated to VERIFIED_BY_AI below
      };

      const profile = await prisma.driverProfile.upsert({
        where: { userId: context.userId },
        update: dataToSave,
        create: { userId: context.userId, ...dataToSave }
      });

      // Submission is admin-gated: mark profile as pending review
      await prisma.driverProfile.update({
        where: { id: profile.id },
        data: { status: 'PENDING_REVIEW' }
      });

      // Find the user's AWAITING_VERIFICATION booking (if any) so we can validate policies.
      const pendingBooking = await prisma.booking.findFirst({
        where: {
          userId: context.userId,
          status: 'AWAITING_VERIFICATION'
        },
        include: {
          car: { select: { transmission: true } }
        }
      });

      // Policy validations that depend on booking context
      if (pendingBooking) {
        // Block manual transmission cars if driver is restricted to automatic
        if (dataToSave.restrictsToAutomatic === true && pendingBooking.car?.transmission === 'MANUAL') {
          throw new Error('Your driving license indicates Code 78 (automatic only). You cannot rent a manual transmission car.');
        }

        // Block if license expires before booking end date
        if (parsedLicenseExpiry && pendingBooking.endDate && parsedLicenseExpiry < new Date(pendingBooking.endDate)) {
          throw new Error('Your driving license expires before the end of this booking. Please upload a valid license.');
        }
      }

      // Compute young driver flag for profile only (booking surcharge is applied at admin approval time)
      let computedIsYoungDriver = false;
      if (parsedDob && !Number.isNaN(parsedDob.getTime())) {
        const platformSettings = await prisma.platformSettings.findFirst();
        const minAge = platformSettings?.youngDriverMinAge || 25;

        const today = new Date();
        let age = today.getFullYear() - parsedDob.getFullYear();
        const monthDiff = today.getMonth() - parsedDob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsedDob.getDate())) {
          age--;
        }

        if (age < minAge) {
          computedIsYoungDriver = true;
        }
      }

      await prisma.driverProfile.update({
        where: { id: profile.id },
        data: { isYoungDriver: computedIsYoungDriver }
      });

      // Log the profile upload
      await prisma.auditLog.create({
        data: {
          userId: context.userId,
          action: 'DRIVER_PROFILE_SUBMITTED',
          details: {
            profileId: profile.id,
            bookingId: pendingBooking?.id
          }
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

      // When admin approves, transition booking to payment stage and apply young driver surcharge.
      if (status === 'VERIFIED_BY_ADMIN') {
        const booking = await prisma.booking.findFirst({
          where: { userId, status: 'AWAITING_VERIFICATION' },
          include: { user: { include: { driverProfile: true } } }
        });

        if (booking) {
          const platformSettings = await prisma.platformSettings.findFirst();
          const minAge = platformSettings?.youngDriverMinAge || 25;
          const fee = platformSettings?.youngDriverFee || 30.0;

          let surcharge = 0;
          const dob = booking.user?.driverProfile?.dateOfBirth ? new Date(booking.user.driverProfile.dateOfBirth) : null;
          if (dob && !Number.isNaN(dob.getTime())) {
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
              age--;
            }
            if (age < minAge) {
              surcharge = fee;
            }
          }

          const baseTotal = booking.totalFinalPrice || booking.totalPrice;
          await prisma.booking.update({
            where: { id: booking.id },
            data: {
              status: 'AWAITING_PAYMENT',
              surchargeAmount: surcharge,
              totalFinalPrice: baseTotal + surcharge
            }
          });
        }
      }

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

    // OCR Document Processing for Auto-fill
    processDocumentOCR: async (_: any, { file, documentType, side }: { file: any; documentType?: string; side?: string }, context: any): Promise<ExtractedDocumentData> => {
      isAuthenticated(context);

      try {
        // Convert GraphQL Upload to Buffer and Stream
        const { createReadStream, filename, mimetype } = await file;
        const stream = createReadStream();
        const chunks: Buffer[] = [];

        // Read all chunks to create buffer for OCR
        for await (const chunk of stream) {
          chunks.push(chunk);
        }

        const fileBuffer = Buffer.concat(chunks);

        // Validate file type
        if (!mimetype.startsWith('image/')) {
          throw new Error('Only image files are supported for OCR processing');
        }

        // Upload to Cloudinary for storage (pass buffer, function now handles it)
        const cloudinaryResult = await uploadToCloudinary(fileBuffer, 'documents', false, filename);

        // Normalize documentType coming from frontend
        const normalizedDocumentType = documentType === 'cni' ? 'id' : documentType;

        // Process with Gemini OCR
        const extractedData = await ocrService.extractDocumentData(
          fileBuffer,
          normalizedDocumentType as 'license' | 'id' | 'address' | undefined,
          (side as 'front' | 'back' | undefined)
        );

        // Store Cloudinary URL in driver profile based on document type and side
        const urlUpdateData: any = {
          status: 'PENDING_REVIEW'
        };

        switch (normalizedDocumentType) {
          case 'license':
            if (side === 'back') {
              urlUpdateData.licenseBackUrl = cloudinaryResult.secure_url;
              urlUpdateData.licenseBackPublicId = cloudinaryResult.public_id;
            } else {
              // Default to front for license
              urlUpdateData.licenseFrontUrl = cloudinaryResult.secure_url;
              urlUpdateData.licenseFrontPublicId = cloudinaryResult.public_id;
            }

            if (extractedData.licenseNumber) {
              urlUpdateData.licenseNumber = extractedData.licenseNumber;
            }
            if (extractedData.licenseCategory) {
              urlUpdateData.licenseCategory = extractedData.licenseCategory;
            }
            if (Array.isArray(extractedData.licenseCategories) && extractedData.licenseCategories.length) {
              urlUpdateData.licenseCategories = extractedData.licenseCategories;
            }
            if (typeof extractedData.restrictsToAutomatic === 'boolean') {
              urlUpdateData.restrictsToAutomatic = extractedData.restrictsToAutomatic;
            }
            break;
          case 'id':
            urlUpdateData.idProofUrl = cloudinaryResult.secure_url;
            urlUpdateData.idProofPublicId = cloudinaryResult.public_id;
            break;
          case 'address':
            urlUpdateData.addressProofUrl = cloudinaryResult.secure_url;
            urlUpdateData.addressProofPublicId = cloudinaryResult.public_id;
            break;
        }

        // Update or create driver profile with URL and status
        await prisma.driverProfile.upsert({
          where: { userId: context.userId },
          update: urlUpdateData,
          create: {
            userId: context.userId,
            ...urlUpdateData
          }
        });

        // Log the OCR processing
        await prisma.auditLog.create({
          data: {
            userId: context.userId,
            action: 'DOCUMENT_OCR_PROCESSED',
            details: {
              filename,
              cloudinaryUrl: cloudinaryResult.secure_url,
              extractedFields: Object.keys(extractedData),
              documentType,
              ocrSuccess: Object.keys(extractedData).length > 0
            }
          }
        });

        const safeExtractedData: any = { ...extractedData };
        if (!safeExtractedData.licenseCategory) {
          delete safeExtractedData.licenseCategory;
        }
        return safeExtractedData;

      } catch (error) {
        console.error('OCR Processing Error:', error);

        // Log the error
        await prisma.auditLog.create({
          data: {
            userId: context.userId,
            action: 'DOCUMENT_OCR_FAILED',
            details: { error: error instanceof Error ? error.message : 'Unknown OCR error' }
          }
        });

        throw new Error('Unable to read the document. Please upload a clearer photo.');
      }
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
import { userRepository } from '../repositories/userRepository';
import { generateToken, hashPassword, comparePasswords, generateOTP, storeOTP, verifyOTPCode, storePendingRegistration, getPendingRegistration, clearPendingRegistration } from '../utils/auth';
import { AppError, ErrorCode } from '../errors/AppError';
import { OAuth2Client } from 'google-auth-library';
import { OCRService } from './ocrService';
import { RegisterInput, LoginInput, UpdateUserInput, CreateVerificationInput, BookingStatus, FileUpload } from '../types/graphql';
import { logSecurityEvent } from '../utils/securityLogger';
import { validatePassword } from '../utils/validation';
import { VerificationStatus } from '@prisma/client';
import { uploadToCloudinary } from '../utils/cloudinary';
import { bookingRepository } from '../repositories/bookingRepository';
import { sendVerificationEmail } from '../utils/sendEmail';
import prisma from '../utils/database';

// Document verification status type (alias for Prisma enum)
type DocumentVerificationStatus = VerificationStatus;

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const ocrService = new OCRService();

export class UserService {
  private async uploadIfPresent(file: any, folder: string): Promise<string | undefined> {
    if (!file) return undefined;
    try {
      // Extract the stream from the file object (like carService does)
      const { createReadStream } = await file;
      if (!createReadStream) {
        console.error('No createReadStream found in file object');
        return undefined;
      }
      
      const result = await uploadToCloudinary(createReadStream(), folder);
      return result.secure_url;
    } catch (e) {
      console.error('Upload failed:', e);
      return undefined;
    }
  }
  async register(input: RegisterInput) {
    const { email, password, fullName, phoneNumber } = input;

    // Validate email format
    if (!email || !email.includes('@') || email.length < 5) {
      throw new AppError('Invalid email format', ErrorCode.BAD_USER_INPUT);
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new AppError(passwordValidation.errors[0], ErrorCode.BAD_USER_INPUT);
    }

    // Validate names
    if (!fullName?.trim()) {
      throw new AppError('Full name is required', ErrorCode.BAD_USER_INPUT);
    }

    // Validate phone number format (international support)
    if (phoneNumber) {
      // Remove all non-numeric characters except + for validation
      const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');

      // Check for valid international phone number format
      const phoneRegex = /^\+?[1-9]\d{6,14}$/;

      if (!phoneRegex.test(cleanPhone)) {
        throw new AppError(
          'Invalid phone number format. Please include country code (e.g., +94771234567 or +441234567890)',
          ErrorCode.BAD_USER_INPUT
        );
      }

      // Additional validation: should be between 7-15 digits (excluding +)
      const digitsOnly = cleanPhone.replace(/^\+/, '');
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        throw new AppError(
          'Phone number must be between 7-15 digits (excluding country code)',
          ErrorCode.BAD_USER_INPUT
        );
      }
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) throw new AppError('User already exists', ErrorCode.ALREADY_EXISTS);

    // Hash password for storage
    const hashedPassword = await hashPassword(password);

    // Store registration data temporarily (valid until OTP expires - 10 minutes)
    storePendingRegistration(email, fullName || '', hashedPassword, phoneNumber);

    // Generate and send OTP
    const otp = generateOTP();
    storeOTP(email, otp);
    await sendVerificationEmail(email, otp);

    return { 
      message: "Registration successful. Please verify your email with the OTP sent.",
      email
    } as any;
  }

  async login(input: LoginInput) {
    const { email, password } = input;

    const user = await userRepository.findByEmail(email);
    if (!user || !user.password) {
      logSecurityEvent.loginFailure({
        email,
        attemptCount: 1
      });
      throw new AppError('Invalid credentials', ErrorCode.UNAUTHENTICATED);
    }

    // Enforce email verification for password-based login
    // Cast to any to avoid compile errors before prisma generate
    if (!(user as any).emailVerified) {
      throw new AppError('Please verify your email before logging in.', ErrorCode.UNAUTHENTICATED);
    }

    const isValid = await comparePasswords(password, user.password);
    if (!isValid) {
      logSecurityEvent.loginFailure({
        email,
        attemptCount: 1
      });
      throw new AppError('Invalid credentials', ErrorCode.UNAUTHENTICATED);
    }

    // Success - log the event
    logSecurityEvent.loginSuccess({
      userId: user.id,
      email: user.email
    });

    return { token: generateToken(user.id, user.role), user };
  }

  async googleLogin(idToken: string) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) throw new AppError('Invalid Google token', ErrorCode.BAD_USER_INPUT);

      const { email, name } = payload;

      let user = await userRepository.findByEmail(email);

      if (!user) {
        user = await userRepository.createUser({
          email,
          fullName: name || email, // Use Google name as fullName, fallback to email
          password: '', // Google OAuth users don't need passwords
          emailVerified: true // Trust Google verified email
        });
      }

      if (!user) throw new AppError('Internal Error', ErrorCode.INTERNAL_SERVER_ERROR);

      return { token: generateToken(user.id, user.role), user, message: "Google login successful" };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Google authentication failed', ErrorCode.UNAUTHENTICATED);
    }
  }


  async createOrUpdateVerification(bookingId: string, input: CreateVerificationInput) {
  // 1. Validate booking exists first
    const bookingExists = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true }
    });

    if (!bookingExists) {
      throw new Error(`Booking with ID ${bookingId} not found`);
    }

    // 2. Upload files
    const [licenseFrontUrl, licenseBackUrl, idCardUrl, idCardBackUrl, addressProofUrl] = await Promise.all([
      this.uploadIfPresent(input.licenseFrontFile, 'verifications'),
      this.uploadIfPresent(input.licenseBackFile, 'verifications'),
      this.uploadIfPresent(input.idCardFile, 'verifications'),
      this.uploadIfPresent(input.idCardBackFile, 'verifications'),
      this.uploadIfPresent(input.addressProofFile, 'verifications')
    ]);

    // 3. Convert licenseCategories from string[] to LicenseCategory[]
    const convertedLicenseCategories = input.licenseCategories?.map(cat => {
      // Map frontend strings to backend enum values
      switch (cat?.toUpperCase()) {
        case 'A': return 'A' as const;
        case 'A1': return 'A1' as const;
        case 'A2': return 'A2' as const;
        case 'B': return 'B' as const;
        case 'C': return 'C' as const;
        case 'D': return 'D' as const;
        case 'AM': return 'AM' as const;
        case 'B1': return 'B1' as const;
        case 'BE': return 'BE' as const;
        case 'C1': return 'C1' as const;
        case 'C1E': return 'C1E' as const;
        case 'CE': return 'CE' as const;
        case 'D1': return 'D1' as const;
        case 'D1E': return 'D1E' as const;
        case 'DE': return 'DE' as const;
        default: return 'B' as const; // Default fallback
      }
    }).filter(Boolean); // Remove any undefined values

    // 4. Prepare verification data
    const verificationData = {
      licenseFrontUrl,
      licenseBackUrl,
      idCardUrl,
      idCardBackUrl,
      addressProofUrl,
      licenseNumber: input.licenseNumber,
      licenseExpiry: input.licenseExpiry ? new Date(input.licenseExpiry) : undefined,
      licenseIssueDate: input.licenseIssueDate ? new Date(input.licenseIssueDate) : undefined,
      driverDob: input.driverDob ? new Date(input.driverDob) : undefined,
      licenseCategories: convertedLicenseCategories, // ✅ Use converted enum array
      idNumber: input.idNumber,
      idExpiry: input.idExpiry ? new Date(input.idExpiry) : undefined,
      verifiedAddress: input.verifiedAddress,
      status: VerificationStatus.PENDING
    };

    // 5. Check if all documents are present
    const hasAllDocs = !!(licenseFrontUrl && licenseBackUrl && idCardUrl && idCardBackUrl && addressProofUrl);

    // 6. Auto-approve if all docs present
    if (hasAllDocs && input.bookingToken) {
      const bVerif = await userRepository.findBookingVerificationByToken(input.bookingToken);
      if (bVerif) {
        await userRepository.updateBookingVerification(bVerif.id, { isVerified: true, verifiedAt: new Date() });
        await bookingRepository.updateBookingStatus(bVerif.bookingId, BookingStatus.VERIFIED);
      }
    }

    // 7. Create/update document verification
    return await userRepository.upsertVerification(bookingId, verificationData);
  }

  async verifyDocument(bookingId: string, status: DocumentVerificationStatus) {
    const verification = await userRepository.updateVerification(bookingId, {
      status: status === VerificationStatus.APPROVED ? VerificationStatus.APPROVED : VerificationStatus.REJECTED
    });

    if (status === VerificationStatus.APPROVED) {
      // Get the booking to find the userId
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: { userId: true }
      });
      // Only update bookings status if there's an associated user (not walk-in)
      if (booking && booking.userId) {
        // Update only PENDING bookings to VERIFIED
        await userRepository.updateManyBookingsStatus(booking.userId, BookingStatus.PENDING, BookingStatus.VERIFIED);
        // Don't automatically change VERIFIED to CONFIRMED - that should happen separately
      }
    } else if (status === VerificationStatus.REJECTED) {
      // When documents are rejected, also reject the booking
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.REJECTED }
      });

      // Refund payment if it exists and was SUCCEEDED
      const payment = await prisma.payment.findUnique({ where: { bookingId } });
      if (payment && payment.status === 'SUCCEEDED') {
        // Import paymentService at the top if not already
        const { paymentService } = require('./paymentService');
        try {
          await paymentService.refundPayment(payment.id);
          console.log(`💳 Refund initiated for booking ${bookingId}, payment ${payment.id} (document rejection)`);
        } catch (refundError) {
          const msg = typeof refundError === 'object' && refundError && 'message' in refundError ? (refundError as any).message : String(refundError);
          console.error(`⚠️ Refund failed for booking ${bookingId}: ${msg}`);
        }
      }
    }
    return verification;
  }

  async processOCR(file: FileUpload, documentType: string, side: string) {
    console.log('Processing file for type:', documentType, 'side:', side);
    const { createReadStream, mimetype } = await file;
    const chunks: Buffer[] = [];
    const buffer = await new Promise<Buffer>((resolve, reject) => {
      createReadStream().on('data', (chunk: Buffer) => chunks.push(chunk))
        .on('end', () => resolve(Buffer.concat(chunks)))
        .on('error', reject);
    });

    console.log('Buffer length:', buffer.length);

    const typeMap: any = { LICENSE: 'license', ID_CARD: 'id', ADDRESS_PROOF: 'address' };
    const sideMap: any = { FRONT: 'front', BACK: 'back' };

    const result = await ocrService.extractDocumentData(buffer, typeMap[documentType], sideMap[side], mimetype);
    return result.isQuotaExceeded ? { isQuotaExceeded: true, fallbackUsed: false } : result;
  }

  async getCurrentUser(userId: string) {
    return await userRepository.findById(userId, true);
  }

  async getUserById(id: string) {
    return await userRepository.findById(id, true);
  }

  async getAllUsers() {
    return await userRepository.findAll();
  }

  async getUserVerification(bookingId: string) {
    return await userRepository.findVerificationByBookingId(bookingId);
  }

  async isEmailAvailable(email: string): Promise<boolean> {
    // Basic format validation to avoid useless DB hits
    if (!email || !email.includes('@') || email.length < 5) {
      return false;
    }
    const existing = await userRepository.findByEmail(email);
    return !existing;
  }

  async updateCurrentUser(userId: string, input: UpdateUserInput) {
    // Validate email if provided
    if (input.email && (!input.email.includes('@') || input.email.length < 5)) {
      throw new AppError('Invalid email format', ErrorCode.BAD_USER_INPUT);
    }

    // Validate phone number if provided
    if (input.phoneNumber) {
      // Remove all non-numeric characters except + for validation
      const cleanPhone = input.phoneNumber.replace(/[^\d+]/g, '');

      // Check for valid international phone number format
      const phoneRegex = /^\+?[1-9]\d{6,14}$/;

      if (!phoneRegex.test(cleanPhone)) {
        throw new AppError(
          'Invalid phone number format. Please include country code (e.g., +94771234567 or +441234567890)',
          ErrorCode.BAD_USER_INPUT
        );
      }

      // Additional validation: should be between 7-15 digits (excluding +)
      const digitsOnly = cleanPhone.replace(/^\+/, '');
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        throw new AppError(
          'Phone number must be between 7-15 digits (excluding country code)',
          ErrorCode.BAD_USER_INPUT
        );
      }
    }

    // Validate names if provided
    if (input.firstName && !input.firstName.trim()) {
      throw new AppError('First name cannot be empty', ErrorCode.BAD_USER_INPUT);
    }
    if (input.lastName && !input.lastName.trim()) {
      throw new AppError('Last name cannot be empty', ErrorCode.BAD_USER_INPUT);
    }

    // Combine separate address fields into fullAddress to match schema
    const fullAddress = [input.address, input.city, input.postalCode, input.country]
      .filter(Boolean)
      .join(', ');

    const data: any = {
      ...input,
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined
    };

    // Remove separate address fields and add fullAddress if any address field was provided
    delete data.address;
    delete data.city;
    delete data.postalCode;
    delete data.country;

    if (fullAddress) {
      data.fullAddress = fullAddress;
    }

    return await userRepository.updateUser(userId, data);
  }

  async deleteUser(id: string) {
    // Check if user has active bookings
    const user = await userRepository.findById(id, false);
    if (!user) {
      throw new AppError('User not found', ErrorCode.NOT_FOUND);
    }

    // Business logic: prevent deleting users with active bookings
    const activeBookingsCount = await userRepository.countActiveBookings(id);
    if (activeBookingsCount > 0) {
      throw new AppError('Cannot delete user with active bookings', ErrorCode.BAD_USER_INPUT);
    }

    return await userRepository.deleteUser(id);
  }

  async verifyOTP(email: string, otp: string) {
    const result = verifyOTPCode(email, otp);
    
    if (!result.valid) {
      throw new AppError(result.message, ErrorCode.UNAUTHENTICATED);
    }

    // Check if this is a new registration or existing user
    let user = await userRepository.findByEmail(email);
    
    if (!user) {
      // New registration - create user now that OTP is verified
      const pending = getPendingRegistration(email);
      if (!pending) {
        throw new AppError('Registration data expired. Please register again.', ErrorCode.BAD_USER_INPUT);
      }

      user = await userRepository.createUser({
        email,
        password: pending.password,
        fullName: pending.fullName,
        phoneNumber: pending.phoneNumber,
        emailVerified: true
      });

      clearPendingRegistration(email);

      logSecurityEvent.registrationSuccess({
        userId: user.id,
        email: user.email
      });
    } else {
      // Existing user - mark email as verified
      await userRepository.updateUser(user.id, { emailVerified: true });
    }

    return { success: true, message: 'Email verified successfully.' };
  }

  async resendOTP(email: string) {
    // Validate email format
    if (!email || !email.includes('@') || email.length < 5) {
      throw new AppError('Invalid email format', ErrorCode.BAD_USER_INPUT);
    }

    // Check if user exists (for registration flow)
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // For security: don't reveal if email exists
      // Generate and store OTP anyway (for new registrations)
      const otp = generateOTP();
      const { expiresAt } = storeOTP(email, otp);
      
      // Send email
      await sendVerificationEmail(email, otp);
      
      return {
        success: true,
        message: 'OTP sent to your email. Please check your inbox.',
        expiresAt
      };
    }

    // User exists - send OTP
    const otp = generateOTP();
    const { expiresAt } = storeOTP(email, otp);
    
    // Send email
    await sendVerificationEmail(email, otp);
    
    return {
      success: true,
      message: 'OTP sent to your email. Please check your inbox.',
      expiresAt
    };
  }
}

export const userService = new UserService();
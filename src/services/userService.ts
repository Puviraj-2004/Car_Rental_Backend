import { userRepository } from '../repositories/userRepository';
import { generateToken, hashPassword, comparePasswords } from '../utils/auth';
import { AppError, ErrorCode } from '../errors/AppError';
import { OAuth2Client } from 'google-auth-library';
import { OCRService } from './ocrService';
import { RegisterInput, LoginInput, UpdateUserInput, CreateVerificationInput, BookingStatus, FileUpload } from '../types/graphql';
import { logSecurityEvent } from '../utils/securityLogger';
import { validatePassword } from '../utils/validation';
import { VerificationStatus } from '@prisma/client';

// Document verification status type (alias for Prisma enum)
type DocumentVerificationStatus = VerificationStatus;

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const ocrService = new OCRService();

export class UserService {
  async register(input: RegisterInput) {
    const { email, password, phoneNumber, firstName, lastName } = input;

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
    if (!firstName?.trim() || !lastName?.trim()) {
      throw new AppError('First name and last name are required', ErrorCode.BAD_USER_INPUT);
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

    const hashedPassword = await hashPassword(password);
    // Combine firstName and lastName into fullName to match schema
    const fullName = `${firstName} ${lastName}`.trim();

    const user = await userRepository.createUser({
      email,
      password: hashedPassword,
      fullName,
      phoneNumber
    });

    // Log successful registration
    logSecurityEvent.registrationSuccess({
      userId: user.id,
      email: user.email
    });

    return { token: generateToken(user.id, user.role), user, message: "Registration successful." };
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
          password: '' // Google OAuth users don't need passwords
        });
      }

      if (!user) throw new AppError('Internal Error', ErrorCode.INTERNAL_SERVER_ERROR);

      return { token: generateToken(user.id, user.role), user, message: "Google login successful" };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Google authentication failed', ErrorCode.UNAUTHENTICATED);
    }
  }


  async createOrUpdateVerification(userId: string, input: CreateVerificationInput) {
    // const [licenseFrontUrl, licenseBackUrl, idCardUrl, addressProofUrl] = await Promise.all([
    //   this.uploadIfPresent(input.licenseFrontFile, 'verifications'),
    //   this.uploadIfPresent(input.licenseBackFile, 'verifications'),
    //   this.uploadIfPresent(input.idCardFile, 'verifications'),
    //   this.uploadIfPresent(input.addressProofFile, 'verifications'),
    // ]);

    // For now, create a basic verification record
    const dataToSave = {
      documentType: input.documentType || 'LICENSE',
      side: input.side || 'FRONT',
      status: VerificationStatus.PENDING
    };

    const verification = await userRepository.upsertVerification(userId, dataToSave);

    const hasAllDocs = !!(verification.licenseNumber && verification.licenseFrontUrl && verification.licenseBackUrl && verification.idCardUrl && verification.addressProofUrl);

    if (hasAllDocs) {
      await userRepository.updateVerification(userId, { status: VerificationStatus.APPROVED });

      if (input.bookingToken) {
        const bVerif = await userRepository.findBookingVerificationByToken(input.bookingToken);
        if (bVerif?.bookingId) await userRepository.updateBookingStatus(bVerif.bookingId, BookingStatus.VERIFIED);
      } else {
        await userRepository.updateManyBookingsStatus(userId, BookingStatus.PENDING, BookingStatus.VERIFIED);
      }
    }
    return verification;
  }

  async verifyDocument(userId: string, status: DocumentVerificationStatus) {
    const verification = await userRepository.updateVerification(userId, {
      status: status === VerificationStatus.APPROVED ? VerificationStatus.APPROVED : VerificationStatus.REJECTED
    });

    if (status === VerificationStatus.APPROVED) {
      await userRepository.updateManyBookingsStatus(userId, BookingStatus.PENDING, BookingStatus.CONFIRMED);
      await userRepository.updateManyBookingsStatus(userId, BookingStatus.VERIFIED, BookingStatus.CONFIRMED);
    }
    return verification;
  }

  async processOCR(file: FileUpload, documentType: string, side: string) {
    const { createReadStream, mimetype } = await file;
    const chunks: Buffer[] = [];
    const buffer = await new Promise<Buffer>((resolve, reject) => {
      createReadStream().on('data', (chunk: Buffer) => chunks.push(chunk))
        .on('end', () => resolve(Buffer.concat(chunks)))
        .on('error', reject);
    });

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

  async getUserVerification(userId: string) {
    return await userRepository.findVerificationByUserId(userId);
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
}

export const userService = new UserService();
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const userRepository_1 = require("../repositories/userRepository");
const auth_1 = require("../utils/auth");
const AppError_1 = require("../errors/AppError");
const google_auth_library_1 = require("google-auth-library");
const ocrService_1 = require("./ocrService");
const graphql_1 = require("../types/graphql");
const securityLogger_1 = require("../utils/securityLogger");
const validation_1 = require("../utils/validation");
const client_1 = require("@prisma/client");
const cloudinary_1 = require("../utils/cloudinary");
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const ocrService = new ocrService_1.OCRService();
class UserService {
    async uploadIfPresent(file, folder) {
        if (!file)
            return undefined;
        try {
            const result = await (0, cloudinary_1.uploadToCloudinary)(file, folder);
            return result.secure_url;
        }
        catch (e) {
            console.error('Upload failed:', e);
            return undefined;
        }
    }
    async register(input) {
        const { email, password, phoneNumber, firstName, lastName } = input;
        // Validate email format
        if (!email || !email.includes('@') || email.length < 5) {
            throw new AppError_1.AppError('Invalid email format', AppError_1.ErrorCode.BAD_USER_INPUT);
        }
        // Validate password strength
        const passwordValidation = (0, validation_1.validatePassword)(password);
        if (!passwordValidation.isValid) {
            throw new AppError_1.AppError(passwordValidation.errors[0], AppError_1.ErrorCode.BAD_USER_INPUT);
        }
        // Validate names
        if (!firstName?.trim() || !lastName?.trim()) {
            throw new AppError_1.AppError('First name and last name are required', AppError_1.ErrorCode.BAD_USER_INPUT);
        }
        // Validate phone number format (international support)
        if (phoneNumber) {
            // Remove all non-numeric characters except + for validation
            const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
            // Check for valid international phone number format
            const phoneRegex = /^\+?[1-9]\d{6,14}$/;
            if (!phoneRegex.test(cleanPhone)) {
                throw new AppError_1.AppError('Invalid phone number format. Please include country code (e.g., +94771234567 or +441234567890)', AppError_1.ErrorCode.BAD_USER_INPUT);
            }
            // Additional validation: should be between 7-15 digits (excluding +)
            const digitsOnly = cleanPhone.replace(/^\+/, '');
            if (digitsOnly.length < 7 || digitsOnly.length > 15) {
                throw new AppError_1.AppError('Phone number must be between 7-15 digits (excluding country code)', AppError_1.ErrorCode.BAD_USER_INPUT);
            }
        }
        const existingUser = await userRepository_1.userRepository.findByEmail(email);
        if (existingUser)
            throw new AppError_1.AppError('User already exists', AppError_1.ErrorCode.ALREADY_EXISTS);
        const hashedPassword = await (0, auth_1.hashPassword)(password);
        // Combine firstName and lastName into fullName to match schema
        const fullName = `${firstName} ${lastName}`.trim();
        const user = await userRepository_1.userRepository.createUser({
            email,
            password: hashedPassword,
            fullName,
            phoneNumber
        });
        // Log successful registration
        securityLogger_1.logSecurityEvent.registrationSuccess({
            userId: user.id,
            email: user.email
        });
        return { token: (0, auth_1.generateToken)(user.id, user.role), user, message: "Registration successful." };
    }
    async login(input) {
        const { email, password } = input;
        const user = await userRepository_1.userRepository.findByEmail(email);
        if (!user || !user.password) {
            securityLogger_1.logSecurityEvent.loginFailure({
                email,
                attemptCount: 1
            });
            throw new AppError_1.AppError('Invalid credentials', AppError_1.ErrorCode.UNAUTHENTICATED);
        }
        const isValid = await (0, auth_1.comparePasswords)(password, user.password);
        if (!isValid) {
            securityLogger_1.logSecurityEvent.loginFailure({
                email,
                attemptCount: 1
            });
            throw new AppError_1.AppError('Invalid credentials', AppError_1.ErrorCode.UNAUTHENTICATED);
        }
        // Success - log the event
        securityLogger_1.logSecurityEvent.loginSuccess({
            userId: user.id,
            email: user.email
        });
        return { token: (0, auth_1.generateToken)(user.id, user.role), user };
    }
    async googleLogin(idToken) {
        try {
            const ticket = await googleClient.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            if (!payload || !payload.email)
                throw new AppError_1.AppError('Invalid Google token', AppError_1.ErrorCode.BAD_USER_INPUT);
            const { email, name } = payload;
            let user = await userRepository_1.userRepository.findByEmail(email);
            if (!user) {
                user = await userRepository_1.userRepository.createUser({
                    email,
                    fullName: name || email, // Use Google name as fullName, fallback to email
                    password: '' // Google OAuth users don't need passwords
                });
            }
            if (!user)
                throw new AppError_1.AppError('Internal Error', AppError_1.ErrorCode.INTERNAL_SERVER_ERROR);
            return { token: (0, auth_1.generateToken)(user.id, user.role), user, message: "Google login successful" };
        }
        catch (error) {
            if (error instanceof AppError_1.AppError)
                throw error;
            throw new AppError_1.AppError('Google authentication failed', AppError_1.ErrorCode.UNAUTHENTICATED);
        }
    }
    async createOrUpdateVerification(userId, input) {
        const [licenseFrontUrl, licenseBackUrl, idCardUrl, addressProofUrl] = await Promise.all([
            this.uploadIfPresent(input.licenseFrontFile, 'verifications'),
            this.uploadIfPresent(input.licenseBackFile, 'verifications'),
            this.uploadIfPresent(input.idCardFile, 'verifications'),
            this.uploadIfPresent(input.addressProofFile, 'verifications'),
        ]);
        // Save the verification data
        const dataToSave = {
            licenseFrontUrl,
            licenseBackUrl,
            idCardUrl,
            addressProofUrl,
            licenseNumber: input.licenseNumber,
            licenseExpiry: input.licenseExpiry ? new Date(input.licenseExpiry) : undefined,
            licenseCategory: input.licenseCategory,
            idNumber: input.idNumber,
            idExpiry: input.idExpiry ? new Date(input.idExpiry) : undefined,
            status: client_1.VerificationStatus.PENDING
        };
        const verification = await userRepository_1.userRepository.upsertVerification(userId, dataToSave);
        const hasAllDocs = !!(verification.licenseNumber && verification.licenseFrontUrl && verification.licenseBackUrl && verification.idCardUrl && verification.addressProofUrl);
        if (hasAllDocs) {
            await userRepository_1.userRepository.updateVerification(userId, { status: client_1.VerificationStatus.APPROVED });
            if (input.bookingToken) {
                const bVerif = await userRepository_1.userRepository.findBookingVerificationByToken(input.bookingToken);
                if (bVerif?.bookingId)
                    await userRepository_1.userRepository.updateBookingStatus(bVerif.bookingId, graphql_1.BookingStatus.VERIFIED);
            }
            else {
                await userRepository_1.userRepository.updateManyBookingsStatus(userId, graphql_1.BookingStatus.PENDING, graphql_1.BookingStatus.VERIFIED);
            }
        }
        return verification;
    }
    async verifyDocument(userId, status) {
        const verification = await userRepository_1.userRepository.updateVerification(userId, {
            status: status === client_1.VerificationStatus.APPROVED ? client_1.VerificationStatus.APPROVED : client_1.VerificationStatus.REJECTED
        });
        if (status === client_1.VerificationStatus.APPROVED) {
            await userRepository_1.userRepository.updateManyBookingsStatus(userId, graphql_1.BookingStatus.PENDING, graphql_1.BookingStatus.CONFIRMED);
            await userRepository_1.userRepository.updateManyBookingsStatus(userId, graphql_1.BookingStatus.VERIFIED, graphql_1.BookingStatus.CONFIRMED);
        }
        return verification;
    }
    async processOCR(file, documentType, side) {
        const { createReadStream, mimetype } = await file;
        const chunks = [];
        const buffer = await new Promise((resolve, reject) => {
            createReadStream().on('data', (chunk) => chunks.push(chunk))
                .on('end', () => resolve(Buffer.concat(chunks)))
                .on('error', reject);
        });
        const typeMap = { LICENSE: 'license', ID_CARD: 'id', ADDRESS_PROOF: 'address' };
        const sideMap = { FRONT: 'front', BACK: 'back' };
        const result = await ocrService.extractDocumentData(buffer, typeMap[documentType], sideMap[side], mimetype);
        return result.isQuotaExceeded ? { isQuotaExceeded: true, fallbackUsed: false } : result;
    }
    async getCurrentUser(userId) {
        return await userRepository_1.userRepository.findById(userId, true);
    }
    async getUserById(id) {
        return await userRepository_1.userRepository.findById(id, true);
    }
    async getAllUsers() {
        return await userRepository_1.userRepository.findAll();
    }
    async getUserVerification(userId) {
        return await userRepository_1.userRepository.findVerificationByUserId(userId);
    }
    async updateCurrentUser(userId, input) {
        // Validate email if provided
        if (input.email && (!input.email.includes('@') || input.email.length < 5)) {
            throw new AppError_1.AppError('Invalid email format', AppError_1.ErrorCode.BAD_USER_INPUT);
        }
        // Validate phone number if provided
        if (input.phoneNumber) {
            // Remove all non-numeric characters except + for validation
            const cleanPhone = input.phoneNumber.replace(/[^\d+]/g, '');
            // Check for valid international phone number format
            const phoneRegex = /^\+?[1-9]\d{6,14}$/;
            if (!phoneRegex.test(cleanPhone)) {
                throw new AppError_1.AppError('Invalid phone number format. Please include country code (e.g., +94771234567 or +441234567890)', AppError_1.ErrorCode.BAD_USER_INPUT);
            }
            // Additional validation: should be between 7-15 digits (excluding +)
            const digitsOnly = cleanPhone.replace(/^\+/, '');
            if (digitsOnly.length < 7 || digitsOnly.length > 15) {
                throw new AppError_1.AppError('Phone number must be between 7-15 digits (excluding country code)', AppError_1.ErrorCode.BAD_USER_INPUT);
            }
        }
        // Validate names if provided
        if (input.firstName && !input.firstName.trim()) {
            throw new AppError_1.AppError('First name cannot be empty', AppError_1.ErrorCode.BAD_USER_INPUT);
        }
        if (input.lastName && !input.lastName.trim()) {
            throw new AppError_1.AppError('Last name cannot be empty', AppError_1.ErrorCode.BAD_USER_INPUT);
        }
        // Combine separate address fields into fullAddress to match schema
        const fullAddress = [input.address, input.city, input.postalCode, input.country]
            .filter(Boolean)
            .join(', ');
        const data = {
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
        return await userRepository_1.userRepository.updateUser(userId, data);
    }
    async deleteUser(id) {
        // Check if user has active bookings
        const user = await userRepository_1.userRepository.findById(id, false);
        if (!user) {
            throw new AppError_1.AppError('User not found', AppError_1.ErrorCode.NOT_FOUND);
        }
        // Business logic: prevent deleting users with active bookings
        const activeBookingsCount = await userRepository_1.userRepository.countActiveBookings(id);
        if (activeBookingsCount > 0) {
            throw new AppError_1.AppError('Cannot delete user with active bookings', AppError_1.ErrorCode.BAD_USER_INPUT);
        }
        return await userRepository_1.userRepository.deleteUser(id);
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
//# sourceMappingURL=userService.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
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
const bookingRepository_1 = require("../repositories/bookingRepository");
const sendEmail_1 = require("../utils/sendEmail");
const database_1 = __importDefault(require("../utils/database"));
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const ocrService = new ocrService_1.OCRService();
class UserService {
    async uploadIfPresent(file, folder) {
        if (!file)
            return undefined;
        try {
            // Extract the stream from the file object (like carService does)
            const { createReadStream } = await file;
            if (!createReadStream) {
                console.error('No createReadStream found in file object');
                return undefined;
            }
            const result = await (0, cloudinary_1.uploadToCloudinary)(createReadStream(), folder);
            return result.secure_url;
        }
        catch (e) {
            console.error('Upload failed:', e);
            return undefined;
        }
    }
    async register(input) {
        const { email, password, fullName, phoneNumber } = input;
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
        if (!fullName?.trim()) {
            throw new AppError_1.AppError('Full name is required', AppError_1.ErrorCode.BAD_USER_INPUT);
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
        // Hash password for storage
        const hashedPassword = await (0, auth_1.hashPassword)(password);
        // Store registration data temporarily (valid until OTP expires - 10 minutes)
        (0, auth_1.storePendingRegistration)(email, fullName || '', hashedPassword, phoneNumber);
        // Generate and send OTP
        const otp = (0, auth_1.generateOTP)();
        (0, auth_1.storeOTP)(email, otp);
        await (0, sendEmail_1.sendVerificationEmail)(email, otp);
        return {
            message: "Registration successful. Please verify your email with the OTP sent.",
            email
        };
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
        // Enforce email verification for password-based login
        // Cast to any to avoid compile errors before prisma generate
        if (!user.emailVerified) {
            throw new AppError_1.AppError('Please verify your email before logging in.', AppError_1.ErrorCode.UNAUTHENTICATED);
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
                    password: '', // Google OAuth users don't need passwords
                    emailVerified: true // Trust Google verified email
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
    async createOrUpdateVerification(bookingId, input) {
        // 1. Validate booking exists first
        const bookingExists = await database_1.default.booking.findUnique({
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
                case 'A': return 'A';
                case 'A1': return 'A1';
                case 'A2': return 'A2';
                case 'B': return 'B';
                case 'C': return 'C';
                case 'D': return 'D';
                case 'AM': return 'AM';
                case 'B1': return 'B1';
                case 'BE': return 'BE';
                case 'C1': return 'C1';
                case 'C1E': return 'C1E';
                case 'CE': return 'CE';
                case 'D1': return 'D1';
                case 'D1E': return 'D1E';
                case 'DE': return 'DE';
                default: return 'B'; // Default fallback
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
            status: client_1.VerificationStatus.PENDING
        };
        // 5. Check if all documents are present
        const hasAllDocs = !!(licenseFrontUrl && licenseBackUrl && idCardUrl && idCardBackUrl && addressProofUrl);
        // 6. Auto-approve if all docs present
        if (hasAllDocs && input.bookingToken) {
            const bVerif = await userRepository_1.userRepository.findBookingVerificationByToken(input.bookingToken);
            if (bVerif) {
                await userRepository_1.userRepository.updateBookingVerification(bVerif.id, { isVerified: true, verifiedAt: new Date() });
                await bookingRepository_1.bookingRepository.updateBookingStatus(bVerif.bookingId, graphql_1.BookingStatus.VERIFIED);
            }
        }
        // 7. Create/update document verification
        return await userRepository_1.userRepository.upsertVerification(bookingId, verificationData);
    }
    async verifyDocument(bookingId, status) {
        const verification = await userRepository_1.userRepository.updateVerification(bookingId, {
            status: status === client_1.VerificationStatus.APPROVED ? client_1.VerificationStatus.APPROVED : client_1.VerificationStatus.REJECTED
        });
        if (status === client_1.VerificationStatus.APPROVED) {
            // Get the booking to find the userId
            const booking = await database_1.default.booking.findUnique({
                where: { id: bookingId },
                select: { userId: true }
            });
            // Only update bookings status if there's an associated user (not walk-in)
            if (booking && booking.userId) {
                // Update only PENDING bookings to VERIFIED
                await userRepository_1.userRepository.updateManyBookingsStatus(booking.userId, graphql_1.BookingStatus.PENDING, graphql_1.BookingStatus.VERIFIED);
                // Don't automatically change VERIFIED to CONFIRMED - that should happen separately
            }
        }
        return verification;
    }
    async processOCR(file, documentType, side) {
        console.log('Processing file for type:', documentType, 'side:', side);
        const { createReadStream, mimetype } = await file;
        const chunks = [];
        const buffer = await new Promise((resolve, reject) => {
            createReadStream().on('data', (chunk) => chunks.push(chunk))
                .on('end', () => resolve(Buffer.concat(chunks)))
                .on('error', reject);
        });
        console.log('Buffer length:', buffer.length);
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
    async getUserVerification(bookingId) {
        return await userRepository_1.userRepository.findVerificationByBookingId(bookingId);
    }
    async isEmailAvailable(email) {
        // Basic format validation to avoid useless DB hits
        if (!email || !email.includes('@') || email.length < 5) {
            return false;
        }
        const existing = await userRepository_1.userRepository.findByEmail(email);
        return !existing;
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
    async verifyOTP(email, otp) {
        const result = (0, auth_1.verifyOTPCode)(email, otp);
        if (!result.valid) {
            throw new AppError_1.AppError(result.message, AppError_1.ErrorCode.UNAUTHENTICATED);
        }
        // Check if this is a new registration or existing user
        let user = await userRepository_1.userRepository.findByEmail(email);
        if (!user) {
            // New registration - create user now that OTP is verified
            const pending = (0, auth_1.getPendingRegistration)(email);
            if (!pending) {
                throw new AppError_1.AppError('Registration data expired. Please register again.', AppError_1.ErrorCode.BAD_USER_INPUT);
            }
            user = await userRepository_1.userRepository.createUser({
                email,
                password: pending.password,
                fullName: pending.fullName,
                phoneNumber: pending.phoneNumber,
                emailVerified: true
            });
            (0, auth_1.clearPendingRegistration)(email);
            securityLogger_1.logSecurityEvent.registrationSuccess({
                userId: user.id,
                email: user.email
            });
        }
        else {
            // Existing user - mark email as verified
            await userRepository_1.userRepository.updateUser(user.id, { emailVerified: true });
        }
        return { success: true, message: 'Email verified successfully.' };
    }
    async resendOTP(email) {
        // Validate email format
        if (!email || !email.includes('@') || email.length < 5) {
            throw new AppError_1.AppError('Invalid email format', AppError_1.ErrorCode.BAD_USER_INPUT);
        }
        // Check if user exists (for registration flow)
        const user = await userRepository_1.userRepository.findByEmail(email);
        if (!user) {
            // For security: don't reveal if email exists
            // Generate and store OTP anyway (for new registrations)
            const otp = (0, auth_1.generateOTP)();
            const { expiresAt } = (0, auth_1.storeOTP)(email, otp);
            // Send email
            await (0, sendEmail_1.sendVerificationEmail)(email, otp);
            return {
                success: true,
                message: 'OTP sent to your email. Please check your inbox.',
                expiresAt
            };
        }
        // User exists - send OTP
        const otp = (0, auth_1.generateOTP)();
        const { expiresAt } = (0, auth_1.storeOTP)(email, otp);
        // Send email
        await (0, sendEmail_1.sendVerificationEmail)(email, otp);
        return {
            success: true,
            message: 'OTP sent to your email. Please check your inbox.',
            expiresAt
        };
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
//# sourceMappingURL=userService.js.map
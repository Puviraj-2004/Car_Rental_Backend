"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearPendingRegistration = exports.getPendingRegistration = exports.storePendingRegistration = exports.clearOTP = exports.verifyOTPCode = exports.storeOTP = exports.generateOTP = exports.comparePasswords = exports.hashPassword = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_in_env';
// OTP Storage (in-memory for now, can be moved to Redis for production)
const otpStore = new Map();
// Temporary Registration Storage (valid only during OTP verification window)
const pendingRegistrations = new Map();
// 1. Generate JWT Token
const generateToken = (userId, role = 'USER') => {
    return jsonwebtoken_1.default.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
};
exports.generateToken = generateToken;
// 2. Verify JWT Token
const verifyToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return decoded;
    }
    catch (error) {
        throw new Error('Invalid or Expired Token');
    }
};
exports.verifyToken = verifyToken;
// 3. Hash Password (Secure)
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcryptjs_1.default.hash(password, saltRounds);
};
exports.hashPassword = hashPassword;
// 4. Compare Password (Login)
const comparePasswords = async (password, hashedPassword) => {
    return await bcryptjs_1.default.compare(password, hashedPassword);
};
exports.comparePasswords = comparePasswords;
// 5. Generate OTP (6-digit)
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generateOTP = generateOTP;
// 6. Store OTP with expiration (10 minutes)
const storeOTP = (email, otp) => {
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    otpStore.set(email, {
        code: otp,
        expiresAt,
        attemptsLeft: 5
    });
    return { expiresAt: new Date(expiresAt).toISOString() };
};
exports.storeOTP = storeOTP;
// 7. Verify OTP
const verifyOTPCode = (email, otp) => {
    const stored = otpStore.get(email);
    if (!stored) {
        return { valid: false, message: 'OTP not found. Please request a new one.' };
    }
    if (stored.expiresAt < Date.now()) {
        otpStore.delete(email);
        return { valid: false, message: 'OTP has expired. Please request a new one.' };
    }
    if (stored.attemptsLeft <= 0) {
        otpStore.delete(email);
        return { valid: false, message: 'Too many failed attempts. Please request a new OTP.' };
    }
    if (stored.code !== otp) {
        stored.attemptsLeft--;
        otpStore.set(email, stored);
        return {
            valid: false,
            message: `Invalid OTP. ${stored.attemptsLeft} attempts remaining.`
        };
    }
    // OTP is valid
    otpStore.delete(email);
    return { valid: true, message: 'OTP verified successfully.' };
};
exports.verifyOTPCode = verifyOTPCode;
// 8. Clear OTP
const clearOTP = (email) => {
    otpStore.delete(email);
};
exports.clearOTP = clearOTP;
// 9. Store pending registration (valid until OTP expires)
const storePendingRegistration = (email, fullName, hashedPassword, phoneNumber) => {
    pendingRegistrations.set(email, {
        fullName,
        password: hashedPassword,
        phoneNumber,
        registeredAt: Date.now()
    });
};
exports.storePendingRegistration = storePendingRegistration;
// 10. Get pending registration (and validate it hasn't expired)
const getPendingRegistration = (email) => {
    const pending = pendingRegistrations.get(email);
    if (!pending)
        return null;
    // Check if still valid (within 15 minutes of registration attempt)
    if (Date.now() - pending.registeredAt > 15 * 60 * 1000) {
        pendingRegistrations.delete(email);
        return null;
    }
    return {
        fullName: pending.fullName,
        password: pending.password,
        phoneNumber: pending.phoneNumber
    };
};
exports.getPendingRegistration = getPendingRegistration;
// 11. Clear pending registration
const clearPendingRegistration = (email) => {
    pendingRegistrations.delete(email);
};
exports.clearPendingRegistration = clearPendingRegistration;
//# sourceMappingURL=auth.js.map
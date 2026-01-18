import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

interface JWTPayload {
  userId: string;
  role: Role;
  iat?: number;
  exp?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_in_env';

// OTP Storage (in-memory for now, can be moved to Redis for production)
const otpStore: Map<string, { code: string; expiresAt: number; attemptsLeft: number }> = new Map();

// Temporary Registration Storage (valid only during OTP verification window)
const pendingRegistrations: Map<string, { fullName: string; password: string; phoneNumber?: string; registeredAt: number }> = new Map();

// 1. Generate JWT Token
export const generateToken = (userId: string, role: string = 'USER'): string => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
};

// 2. Verify JWT Token
export const verifyToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or Expired Token');
  }
};

// 3. Hash Password (Secure)
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// 4. Compare Password (Login)
export const comparePasswords = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// 5. Generate OTP (6-digit)
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 6. Store OTP with expiration (10 minutes)
export const storeOTP = (email: string, otp: string): { expiresAt: string } => {
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  otpStore.set(email, {
    code: otp,
    expiresAt,
    attemptsLeft: 5
  });
  return { expiresAt: new Date(expiresAt).toISOString() };
};

// 7. Verify OTP
export const verifyOTPCode = (email: string, otp: string): { valid: boolean; message: string } => {
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

// 8. Clear OTP
export const clearOTP = (email: string): void => {
  otpStore.delete(email);
};

// 9. Store pending registration (valid until OTP expires)
export const storePendingRegistration = (email: string, fullName: string, hashedPassword: string, phoneNumber?: string): void => {
  pendingRegistrations.set(email, {
    fullName,
    password: hashedPassword,
    phoneNumber,
    registeredAt: Date.now()
  });
};

// 10. Get pending registration (and validate it hasn't expired)
export const getPendingRegistration = (email: string): { fullName: string; password: string; phoneNumber?: string } | null => {
  const pending = pendingRegistrations.get(email);
  if (!pending) return null;
  
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

// 11. Clear pending registration
export const clearPendingRegistration = (email: string): void => {
  pendingRegistrations.delete(email);
};
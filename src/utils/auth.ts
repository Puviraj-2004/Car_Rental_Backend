import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// env-இல் உள்ள Secret-ஐ எடுக்கிறது, இல்லையென்றால் பாதுகாப்புக்காக ஒரு டீபால்ட் கீ
const JWT_SECRET = process.env.JWT_SECRET || 'your_random_secret_string';

export const generateToken = (userId: string, role: string = 'USER'): string => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePasswords = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};
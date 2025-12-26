"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePasswords = exports.hashPassword = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_in_env';
// 1. Generate JWT Token
const generateToken = (userId, role = 'USER') => {
    return jsonwebtoken_1.default.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
};
exports.generateToken = generateToken;
// 2. Verify JWT Token
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
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
//# sourceMappingURL=auth.js.map
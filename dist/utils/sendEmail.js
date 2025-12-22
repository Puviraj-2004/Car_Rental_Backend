"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendVerificationEmail = async (email, token) => {
    const transporter = nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    const url = `http://localhost:3000/verify-email?token=${token}`;
    await transporter.sendMail({
        from: `"Car Rental Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify your email address",
        html: `<h3>Welcome to our Car Rental!</h3>
           <p>Please click the link below to verify your email:</p>
           <a href="${url}">${url}</a>`,
    });
};
exports.sendVerificationEmail = sendVerificationEmail;
//# sourceMappingURL=sendEmail.js.map
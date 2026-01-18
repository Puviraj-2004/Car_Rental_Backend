import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const sendVerificationEmail = async (email: string, otp: string) => {
  // Create Transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Or use 'smtp.host.com' for custom SMTP
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, 
    },
  });

  // Send Mail
  try {
    await transporter.sendMail({
      from: `"Car Rental System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Account - OTP",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; max-width: 500px;">
          <h2 style="color: #333;">Welcome to Car Rental!</h2>
          <p>Please use the following code to verify your email address:</p>
          <div style="background: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px;">
            <h1 style="color: #293D91; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">This code expires in 10 minutes.</p>
        </div>
      `,
    });
    if (process.env.NODE_ENV === 'development') {
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
    }
    // Don't throw error here to prevent crashing the registration flow, 
    // just log it. The user can request OTP again.
  }
};
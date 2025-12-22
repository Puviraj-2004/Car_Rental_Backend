import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (email: string, token: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, 
    },
  });

  const url = `http://localhost:3000/verify-email?token=${token}`;

  await transporter.sendMail({
    from: '"Car Rental Support" <your-email@gmail.com>',
    to: email,
    subject: "Verify your email address",
    html: `<h3>Welcome to our Car Rental!</h3>
           <p>Please click the link below to verify your email:</p>
           <a href="${url}">${url}</a>`,
  });
};
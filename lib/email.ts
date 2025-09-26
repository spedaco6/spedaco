import "server-only";
import nodemailer from "nodemailer";

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  // Name: Mauricio Nitzsche
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "mauricio87@ethereal.email",
    pass: "fcyb82TzdKc5V8RVcV",
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const info = await transporter.sendMail({
    from: '"Maddison Foo Koch" <maddison53@ethereal.email>',
    to: email,
    subject: "Verify Email",
    text: "Verify your account by clicking the link below", // plain‑text body
    html: `<h1>Verify your account</h1>
      <p>Verify your account now by clicking the link below</p>
      <a href="http://localhost:3000/verify?token=${token}">Verify Now</a>
    `, // HTML body
  });
  return info;
}
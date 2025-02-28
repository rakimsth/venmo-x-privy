"use server";

import { z } from "zod";
import nodemailer from "nodemailer";

const inviteSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
});

export async function sendInvitation(formData: FormData) {
  const validatedFields = inviteSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
  });

  if (!validatedFields.success) {
    return { error: "Invalid email address or name" };
  }

  const { email, fullName } = validatedFields.data;

  // In a real application, you would use your actual SMTP settings
  const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: '"PrivyPay" <noreply@privypay.com>',
      to: email,
      subject: "Invitation to join PrivyPay",
      text: `You've been invited to join PrivyPay! Click here to sign up: ${process.env.NEXT_PUBLIC_APP_URL}/register`,
      html: `
    <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Join PrivyPay</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <header style="background-color: #4169E1; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">PrivyPay</h1>
          </header>
          <main style="padding: 20px;">
            <h2>You're invited to join PrivyPay!</h2>
            <p>Hi ${fullName},</p>
            <p>You've been invited to join PrivyPay, the easiest way to send and receive money.</p>
            <p>Click the button below to create your account:</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="display: inline-block; background-color: #4169E1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
              Join PrivyPay
            </a>
          </main>
          <footer style="text-align: center; margin-top: 20px; font-size: 0.8em; color: #666;">
            <p>If you didn't request this invitation, please ignore this email.</p>
          </footer>
        </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send invitation email:", error);
    return { error: "Failed to send invitation email" };
  }
}

"use server";

import { z } from "zod";
import nodemailer from "nodemailer";

const inviteSchema = z.object({
  email: z.string().email(),
});

export async function sendInvitation(formData: FormData) {
  const validatedFields = inviteSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return { error: "Invalid email address" };
  }

  const { email } = validatedFields.data;

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
        <div class="container">
        <h1>You're Invited to Join PrivyPay!</h1>
        <p>Hi ${email},</p>
        <p>We're excited to invite you to join PrivyPay, where you can send and receive money among friends.</p>
        <p>Click the button below to get started:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background-color: #4169E1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Join PrivyPay
        </a>
        <p>If you didn't request this invitation, you can safely ignore this email.</p>
        <p>Best regards,</p>
        <p>The PrivyPay Team</p>
    </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send invitation email:", error);
    return { error: "Failed to send invitation email" };
  }
}

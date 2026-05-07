import express from "express";
import crypto from "crypto";
import nodemailer from "nodemailer";
import db from "../db.js"; 

const router = express.Router();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const EMAIL_FROM = process.env.EMAIL_FROM || "FACIT Journal <no-reply@facit.com>";

const createTransporter = () => {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
      auth: process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        : undefined
    });
  }

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  return null;
};

//FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user exists
    const user = await db.User.findOne({ email }).lean();

    if (!user) {
      // Always return success to avoid leaking emails
      return res.json({ message: "Reset link sent if email exists" });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Update user with token
    await db.User.findByIdAndUpdate(user._id, {
      resetPasswordToken: token,
      resetPasswordExpires: new Date(expires),
      updatedAt: new Date(),
    });

    const resetURL = `${FRONTEND_URL}/reset-password/${token}`;
    const transporter = createTransporter();

    if (transporter) {
      try {
        await transporter.sendMail({
          to: user.email,
          from: EMAIL_FROM,
          subject: "Password Reset",
          html: `
            <p>You requested a password reset.</p>
            <p>Click below to reset your password:</p>
            <a href="${resetURL}">${resetURL}</a>
            <p>This link expires in 15 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>Best,<br/>GOUNI Journal Team</p> 
            <p style="font-size: 12px; color: #888;">If you have any issues, contact support at support@Gouni.com</p>
          `
        });

        return res.json({ message: "Reset link sent" });
      } catch (mailError) {
        console.error("Password reset email failed:", mailError);
        return res.json({
          message: "Reset link generated successfully.",
          resetUrl: resetURL
        });
      }
    }

    console.warn("Email credentials not configured. Password reset link:", resetURL);
    return res.json({
      message: "Reset link generated successfully.",
      resetUrl: resetURL
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

//RESET PASSWORD
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Find user with valid token
    const user = await db.User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    }).lean();

    if (!user) {
      return res.status(400).json({ message: "Token expired or invalid" });
    }

    // Hash new password (keep consistent with login)
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    // Update password and clear token
    await db.User.findByIdAndUpdate(user._id, {
      password_hash: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      updatedAt: new Date(),
    });

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

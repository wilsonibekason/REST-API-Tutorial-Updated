import { Request, Response } from "express";
import { omit } from "lodash";
import {
  ChangePasswordInput,
  CreateUserInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  UpdateProfileInput,
} from "../schema/user.schema";
import {
  createUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  changePassword,
  updateProfile,
} from "../service/user.service";
import logger from "../utils/logger";
import UserModel from "../models/user.model";
import { sendEmail } from "../utils/email.util";
import { addToTokenBlacklist } from "../utils/tokenBlacklistService";

export async function createUserHandler(
  req: Request<{}, {}, CreateUserInput["body"]>,
  res: Response
) {
  try {
    const user = await createUser(req.body);
    return res.send(user);
  } catch (e: any) {
    logger.error(e);
    return res.status(409).send(e.message);
  }
}

// TODO
export async function logoutHandler(req: Request, res: Response) {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer token

  if (!token) {
    return res.status(400).send("No token provided.");
  }

  try {
    await addToTokenBlacklist(token);
    return res.status(200).send("Successfully logged out.");
  } catch (e: any) {
    return res.status(500).send("An error occurred during logout.");
  }
}

// Forgot Password Handler
export async function forgotPasswordHandler(
  req: Request<{}, {}, ForgotPasswordInput["body"]>,
  res: Response
) {
  const { email } = req.body;

  try {
    // Find the user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Generate a reset token (you should implement this function)
    // const token = await user.generatePasswordResetToken();
    const token = user.passwordResetToken;
    console.log("Password Reset Token", token);
    await user.save(); // Save the token and token expiry to the user

    // Create a reset password link
    const resetUrl = `https://yourapp.com/reset-password?token=${token}`;

    // Prepare email content
    const subject = "Password Reset Request";
    const text = `You have requested to reset your password. Please use the following link: ${resetUrl}`;
    const html = `<p>You have requested to reset your password. Please use the following link:</p><a href="${resetUrl}">Reset Password</a>`;

    // Send the email
    await sendEmail(user.email, subject, text, html);

    // Send response
    return res.status(200).send("Password reset email sent.");
  } catch (error) {
    console.error(error);
    return res.status(500).send("An error occurred.");
  }
}

// Reset Password Handler
export async function resetPasswordHandler(
  req: Request<{}, {}, ResetPasswordInput["body"]>,
  res: Response
) {
  try {
    const { token, newPassword } = req.body;
    await resetPassword(token, newPassword);
    return res.status(200).send({ message: "Password successfully reset" });
  } catch (e: any) {
    logger.error(e);
    return res.status(500).send(e.message);
  }
}

// Email Verification Handler
export async function verifyEmailHandler(req: Request, res: Response) {
  try {
    const { token } = req.query;
    await verifyEmail(token as string);
    return res.status(200).send({ message: "Email verified successfully" });
  } catch (e: any) {
    logger.error(e);
    return res.status(500).send(e.message);
  }
}

// Change Password Handler (Logged in)
export async function changePasswordHandler(
  req: Request<{}, {}, ChangePasswordInput["body"]>,
  res: Response
) {
  try {
    const userId = res.locals.user._id; // Extract userId from res.locals
    const { currentPassword, newPassword } = req.body;

    const isPasswordChanged = await changePassword(
      userId,
      currentPassword,
      newPassword
    );

    if (!isPasswordChanged) {
      return res.status(400).send("Current password is incorrect");
    }

    return res.status(200).send("Password changed successfully");
  } catch (e: any) {
    logger.error(e);
    return res.status(500).send(e.message);
  }
}

// Update Profile Handler
export async function updateProfileHandler(
  req: Request<{}, {}, UpdateProfileInput["body"]>,
  res: Response
) {
  try {
    const userId = res.locals.user._id; // Extract userId from res.locals
    const updateData = req.body;

    const updatedUser = await updateProfile(userId, updateData);

    return res.status(200).send(updatedUser);
  } catch (e: any) {
    logger.error(e);
    return res.status(500).send(e.message);
  }
}

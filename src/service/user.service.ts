import { FilterQuery } from "mongoose";
import { omit } from "lodash";
import UserModel, { UserDocument, UserInput } from "../models/user.model";
import config from "config";

//
import crypto from "crypto";
import bcrypt from "bcrypt";

export async function createUser(input: UserInput) {
  try {
    const user = await UserModel.create(input);

    return omit(user.toJSON(), "password");
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function validatePassword({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return null;
    }

    const isValid = await user.comparePassword(password);

    if (!isValid) return null;

    return omit(user.toJSON(), "password");
  } catch (error) {
    console.error(error);
    return null;
  }
}
export async function findUser(query: FilterQuery<UserDocument>) {
  return UserModel.findOne(query).lean();
}

// Forgot password service to generate token
export async function forgotPassword(email: string) {
  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  // Generate password reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = Date.now() + 3600000; // Token valid for 1 hour

  await user.save();

  return resetToken; // Normally you'd send this token to user's email
}

// Reset password service
export async function resetPassword(token: string, newPassword: string) {
  const user = await UserModel.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error("Invalid or expired token");
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
}

// Verify email service
export async function verifyEmail(token: string) {
  const user = await UserModel.findOne({ emailVerificationToken: token });

  if (!user) {
    throw new Error("Invalid or expired token");
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  await user.save();
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  const user = await UserModel.findById(userId);

  if (!user) {
    return false;
  }

  const isValid = await user.comparePassword(currentPassword);
  console.log("IsValid", isValid);

  if (!isValid) {
    return false;
  }

  // Hash the new password and save it
  const salt = await bcrypt.genSalt(config.get<number>("saltWorkFactor"));
  user.password = await bcrypt.hashSync(newPassword, salt);
  await user.save();

  return true; // Return true to indicate success
}

// Update profile service
export async function updateProfile(
  userId: string,
  updateData: Partial<UserDocument>
) {
  const user = await UserModel.findByIdAndUpdate(userId, updateData, {
    new: true,
  }).lean();

  if (!user) {
    throw new Error("User not found");
  }

  return omit(user, "password");
}

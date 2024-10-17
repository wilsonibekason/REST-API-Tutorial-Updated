import mongoose from "mongoose";
import bcrypt from "bcrypt";
import config from "config";
import crypto from "crypto";

export interface UserInput {
  email: string;
  name: string;
  password: string;
}

export interface UserDocument extends UserInput, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<Boolean>;
  passwordResetToken?: string;
  passwordResetExpires?: number;
  isVerified?: boolean;
  emailVerificationToken?: string;
  generatePasswordResetToken(): string;
}

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    // Additional schema
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Number },
    emailVerificationToken: { type: String },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  let user = this as UserDocument;

  if (!user.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(config.get<number>("saltWorkFactor"));

  const hash = await bcrypt.hashSync(user.password, salt);

  user.password = hash;

  return next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const user = this as UserDocument;

  return bcrypt.compare(candidatePassword, user.password).catch((e) => false);
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);

// Generate Token

userSchema.methods.generatePasswordResetToken = function () {
  const user = this as UserDocument;

  const resetToken = crypto.randomBytes(32).toString("hex");

  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Token expires in 1 hour
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000;

  return resetToken;
};

export default UserModel;

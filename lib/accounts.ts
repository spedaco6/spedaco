import { IUser, User } from "@/models/User";
import { createPasswordResetToken, DecodedPasswordResetToken, verifyPasswordResetToken } from "./tokens";
import { sendPasswordResetEmail } from "./email";
import mongoose, { MongooseError } from "mongoose";
import { connectToDB } from "./database";
import { AllValidators, Validator } from "./Validator";
import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "./config";

export interface AccountActionResponse {
  success: boolean,
  error?: string,
  validationErrors?: Record<string, string[]>,
  prevValues?: Record<string, unknown>,
  user?: Partial<IUser>,
}

export const submitPasswordResetRequest = async (email: string): Promise<AccountActionResponse> => {
  // Ensure form data exists and is sanitized
  if (!email || typeof email !== "string") return { success: false, error: "Invalid email" };
  
  // Find requested account by email
  let user: IUser | null = null;
  try {
    await connectToDB();
    user = await User.findOne({ email });
    if (!user) return { success: false, error: "Email could not be found" };
  } catch (err) {
    if (err instanceof mongoose.MongooseError) return { success: false, error: "Something went wrong. Try again later" };
    const message = !(err instanceof MongooseError) && err instanceof Error ? err.message : "Something went wrong. Try again later";
    return { success: false, error: message };
  }

  // Create and save password reset token
  let token: string | null = null;
  try {
    token = createPasswordResetToken(String(user._id));
    user.passwordResetToken = token;
    await user.save();
  } catch (err) {
    console.error(err);
    return { success: false, error: "Could not reset password at this time. Try again later" };
  }
    
  // Send password reset email
  try {
    await sendPasswordResetEmail(user.email, user.passwordResetToken);
  } catch (err) {
    console.error(err);
    return { success: false, error: "Could not send reset email at this time. Try again later" };
  }
  
  // Return success with updated user object
  return { success: true, user };
}

export const completePasswordReset = async (
password: string, 
confirmPassword: string, 
token: string): 
Promise<AccountActionResponse> => {
  // Confirm data
  if (!password || !confirmPassword || !token) return { success: false, error: "No data provided" };
  
  // Validate password
  const validators: AllValidators = Validator.getAllValidators({ password, confirmPassword });
  validators.password.isPassword();
  validators.confirmPassword.matches(password);
  const { isValid, validationErrors } = Validator.getAllValidity(validators);
  if (!isValid) return { success: false, validationErrors };

  // Verify reset token
  let decoded: DecodedPasswordResetToken | boolean;
  try {
    decoded = verifyPasswordResetToken(token);
    if (!decoded) throw new Error("Invalid token");
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Invalid token";
    return { success: false, error: message };
  }

  // Find user and match passwordResetToken
  let user: IUser | null;
  try {
    await connectToDB();
    const userId = typeof decoded === "boolean" ? "" : decoded?.userId;
    user = await User.findById(userId);
    if (!user) throw new Error("Invalid user");
    if (user.passwordResetToken !== token) throw new Error("Token mismatch");
  } catch (err) {
    if (err instanceof mongoose.MongooseError) return { success: false, error: "Something went wrong. Could not update password" };
    const message = !(err instanceof MongooseError) && err instanceof Error ? err.message : "Something went wrong. Could not update password";
    return { success: false, error: message };
  }
  
  // Update user
  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    user.password = passwordHash;
    user.passwordResetToken = undefined;
    await user.save();
  } catch (err) {
    if (err instanceof mongoose.MongooseError) return { success: false, error: "Something went wrong. Could not update password" };
    const message = !(err instanceof MongooseError) && err instanceof Error ? err.message : "Something went wrong. Could not update password";
    return { success: false, error: message };
  }

  // Return success
  return { success: true };
}
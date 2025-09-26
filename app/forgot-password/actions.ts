"use server";
import { sendPasswordResetEmail } from "@/lib/email";
import { createPasswordResetToken } from "@/lib/tokens";
import { sanitize } from "@/lib/utils";
import { IUser, User } from "@/models/User";
import { redirect } from "next/navigation";

export const forgotPassword = async (_prev: unknown, formData: FormData): Promise<boolean> => {
  // Ensure form data exists and is sanitized
  if (!formData) return false;
  const sanitized = sanitize(formData);
  
  // Find requested account by email
  let user: IUser | null = null;
  try {
    user = await User.findOne({ email: sanitized.email });
    if (!user) throw new Error("User could not be found");
  } catch (err) {
    console.error(err);
    return false;
  }

  // Create and save password reset token
  let token: string | null = null;
  try {
    token = createPasswordResetToken(String(user._id));
    user.passwordResetToken = token;
    await user.save();
  } catch (err) {
    console.error(err);
    return false;
  }
    
  // Send password reset email
  try {
    await sendPasswordResetEmail(user.email, user.passwordResetToken);
  } catch (err) {
    console.error(err);
    return false;
  }
    // Redirect user
  return redirect("/verify");
}
import { IUser, User } from "@/models/User";
import { createPasswordResetToken } from "./tokens";
import { sendPasswordResetEmail } from "./email";

interface AccountActionResponse {
  success: boolean,
  error?: string,
  validationErrors?: Record<string, string[]>,
  prevValues?: Record<string, unknown>,
}
export const forgotPassword = async (email: string): Promise<AccountActionResponse> => {
  // Ensure form data exists and is sanitized
  if (!email || typeof email !== "string") return { success: false, error: "Invalid email" };
  
  // Find requested account by email
  let user: IUser | null = null;
  try {
    user = await User.findOne({ email });
    if (!user) throw new Error("Email could not be found");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong. Try again later";
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
    return { success: false, error: "Could reset password at this time. Try again later" };
  }
    
  // Send password reset email
  try {
    await sendPasswordResetEmail(user.email, user.passwordResetToken);
  } catch (err) {
    console.error(err);
    return { success: false, error: "Could not send reset email at this time. Try again later" };
  }
  
  // Redirect user
  return { success: true };
}
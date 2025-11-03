"use server";
import { decrypt, DecodedToken } from "@/lib/tokens";
import { IUser, User } from "@/models/User";

export const verifyAccount = async (token: string): Promise<boolean> => {
  // Ensure token is defined and type string
  if (!token || typeof token !== "string") return false;
  // decrypt token
  let decoded: DecodedToken;
  try {
    decoded = await decrypt(token, "email_verification");
  } catch (err) {
    console.error(err);
    return false;
  }
  
  // If no token, return false
  if (decoded?.error) return false;
  let user: IUser | null = null;
  try {
    user = await User.findById(decoded?.userId);
  } catch (err) {
    console.error(err);
    return false;
  }
  if (!user) return false;
  if (user?.verificationToken !== token) return false;
  
  // Update and save user
  user.verified = true;
  user.verificationToken = undefined;
  await user.save();

  return true;
}
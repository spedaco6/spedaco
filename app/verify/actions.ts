import { DecodedToken, verifyEmailVerificationToken } from "@/lib/tokens";
import { User } from "@/models/User";

export const verifyAccount = async (token: string): Promise<boolean> => {
  // Ensure token is defined and type string
  if (!token || typeof token !== "string") return false;
  
  // Decode token
  let decoded: DecodedToken;
  try {
    decoded = verifyEmailVerificationToken(token) as DecodedToken;
  } catch (err) {
    console.error(err);
    return false;
  }

  // If no token, retur false
  if (decoded?.error) return false;
  const user = await User.findById(decoded?.userId);
  if (!user) return false;
  if (user?.verificationToken !== token) return false;

  // Update and save user
  user.verified = true;
  user.verificationToken = undefined;
  await user.save();

  return true;
}
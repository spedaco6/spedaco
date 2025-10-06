import { IUser, User } from "@/models/User";
import { MongooseError } from "mongoose";
import bcrypt from "bcrypt";
import { connectToDB } from "./database";
import { createAccessToken, createRefreshToken } from "./tokens";
import { UserSession } from "@/models/UserSession";

export interface AuthActionResponse {
  success: boolean,
  error?: string,
  prevValues?: Record<string, unknown>,
  accessToken?: string,
  refreshToken?: string,
}

export const authenticateUser = async (email: string, password: string): Promise<AuthActionResponse> => {
  // Ensure data is provided
  if (!email) return { success: false, error: "No email provided" };

  // Find user
  let user: IUser | null = null;
  try {
    await connectToDB();
    user = await User.findOne({ email });
    if (!user) return { success: false, error: "Invalid email or password" };
  } catch (err) {
    console.error(err);
    const message = !(err instanceof MongooseError) && err instanceof Error ? err.message : "Something went wrong. Could not create your account at this time";
    return { success: false, error: message };
  }

  // Validate password
  try {
    const passwordsMatch: boolean = await bcrypt.compare(password, user.password);
    if (!passwordsMatch) return { success: false, error: "Invalid email or password" };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Something went wrong. Authentication currently unavailable" };
  }
  
  // Check for verified status or redirect
  
  
  // Create refresh and access tokens
  const accessToken: string = createAccessToken(user);
  const refreshToken: string = createRefreshToken(user);
  
  // Save refresh token to database
  const userSession = new UserSession({
    refreshToken,
    userId: String(user._id),
  });
  try {
    await userSession.save();
  } catch (err) {
    console.error(err);
    const message = !(err instanceof MongooseError) && err instanceof Error ? err.message : "Something went wrong. Could not authenticate user at this time";
    return { success: false, error: message };
  }

  // Return result
  return { success: true, refreshToken, accessToken };
}
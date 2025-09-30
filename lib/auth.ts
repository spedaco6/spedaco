import { IUser, User } from "@/models/User";
import { MongooseError } from "mongoose";

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
  console.log(password);

  // Find user
  let user: IUser | null = null;
  try {
    user = await User.findOne({ email });
    if (!user) return { success: false, error: "Invalid email or password" };
  } catch (err) {
    console.error(err);
    const message = !(err instanceof MongooseError) && err instanceof Error ? err.message : "Something went wrong. Could not create your account at this time";
    return { success: false, error: message };
  }

  // Validate password
  try {

  } catch (err) {
    console.error(err);
  }
  
  // Create token
  try {

  } catch (err) {
    console.error(err);
  }
  
  // Save token to database
  try {

  } catch (err) {
    console.error(err);
  }

  // Return result
  return { success: true };
}
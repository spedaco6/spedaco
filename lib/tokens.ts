import { IUser, User } from "@/models/User";
import jwt, { JsonWebTokenError, JwtPayload } from "jsonwebtoken";

export interface DecodedToken extends JwtPayload {
  userId?: string,
  intent?: "email_verification" | "password_reset" | "refresh" | "access",
  jti?: string,
  error?: string,
}

export const createToken = (
  user: IUser, 
  intent: "email_verification" | "password_reset" | "refresh" | "access" = "access"
): string => {
  if (!user) return "";
  const token = jwt.sign({
    userId: String(user._id),
    jti: user.jti,
    intent,
  }, process.env.TOKEN_SECRET!, { expiresIn: intent === "refresh" ? "7d" : "15m" });
  return token;
}

export const verifyToken = (
  token: string, 
  intent: "email_verification" | "password_reset" | "refresh" | "access" = "access"
): DecodedToken => {
  if (!token || typeof token !== "string") return { error: "No token provided" };
  let decoded: DecodedToken;
  try {
    decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as DecodedToken;
    if (!decoded) return { error: "Invalid token" };
    if (decoded.intent !== intent) return { error: "Invalid token type" };
  } catch (err) {
    console.error(err);
    const message = err instanceof JsonWebTokenError ? err.message : "Invalid token";
    return { error: message };
  }
  return decoded;
}

export const createEmailVerificationToken = (user: IUser): string => {
  return createToken(user, "email_verification");
}

export const createPasswordResetToken = (user: IUser): string => {
  return createToken(user, "password_reset");
}

export const verifyEmailVerificationToken = (token: string): DecodedToken => {
  return verifyToken(token, "email_verification") as DecodedToken;
}

export const verifyPasswordResetToken = (token: string): DecodedToken => {
  return verifyToken(token, "password_reset") as DecodedToken;
}
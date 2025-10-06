import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { IUser, User, UserRole } from "@/models/User";
import { JOSEError } from "jose/errors";

export type TokenIntent = "email_verification" | "password_reset" | "refresh" | "access";
export interface DecodedSession {
  userId?: string,
  intent?: TokenIntent,
  role?: UserRole,
  jti?: string,
  error?: string,
}

const secretKey = process.env.TOKEN_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);
const alg = "H256";

export const encode = async (
  user: IUser, 
  intent: TokenIntent = "access"
): Promise<string> => {
  if (!user || !(user instanceof User)) return "";
  const payload = {
    userId: String(user._id),
    role: user.role,
    intent,
  };

  const token: string = await new SignJWT(payload)
    .setJti(user.jti)
    .setExpirationTime(intent === "refresh" ? "7d" : "15m")
    .setProtectedHeader({ alg })
    .sign(encodedKey)
    .catch(err => {
      console.error(err);
      return "";
    });

  return token;
}

export const decode = async (
  token: string, 
  tokenIntent: TokenIntent = "access"
): Promise<DecodedSession> => {
  if (!token || typeof token !== "string") return { error: "No token provided" };
  try {
    const { payload } = await jwtVerify(token, encodedKey, { algorithms: [alg] });
    if (!payload || typeof payload !== "object") return { error: "Invalid token" };
    const { userId, role, intent } = payload as Partial<DecodedSession>;
    if (intent !== tokenIntent) return { error: "Invalid token type" };
    return {
      userId,
      role,
    };
  } catch (err) {
    console.error(err);
    const message = err instanceof JOSEError ? err.message : "Invalid token";
    return { error: message };
  }
}
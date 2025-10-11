import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { JOSEError } from "jose/errors";

export type TokenIntent = "email_verification" | "password_reset" | "refresh" | "access";
export interface DecodedToken {
  userId?: string,
  intent?: TokenIntent,
  role?: "user" | "client" | "manager" | "admin" | "super",
  jti?: string,
  error?: string,
}
const secretKey = process.env.TOKEN_SECRET!;
const encodedKey = new TextEncoder().encode(secretKey);
const alg = "HS256";

export const encrypt = async (
  user: { _id: string, jti: string, role: "user" | "client" | "manager" | "admin" | "super" }, 
  intent: TokenIntent = "access"
): Promise<string> => {
  if (!user || !user._id || !user.jti || !user.role) return "";
  const payload = {
    userId: String(user._id),
    role: user.role,
    intent,
  };

  let token: string;
  try {
    token = await new SignJWT(payload)
      .setJti(user.jti)
      .setExpirationTime(intent === "refresh" ? "7d" : "15m")
      .setProtectedHeader({ alg })
      .sign(encodedKey)

  } catch (err) {
    console.error(err);
    return "";
  }
  return token;
}

export const decrypt = async (
  token: string, 
  tokenIntent: TokenIntent = "access",
): Promise<DecodedToken> => {
  if (!token || typeof token !== "string") return { error: "No token provided" };
  try {
    const { payload } = await jwtVerify(token, encodedKey, { algorithms: [alg] });
    if (!payload || typeof payload !== "object") return { error: "Invalid token" };
    const { userId, role, intent, jti } = payload as Partial<DecodedToken>;
    if (intent !== tokenIntent) return { error: "Invalid token type" };
    const decodedToken = { userId, role, jti };
    return decodedToken;
  } catch (err) {
    console.error(err);
    const message = err instanceof JOSEError ? err.message : "Invalid token error";
    return { error: message };
  }
}
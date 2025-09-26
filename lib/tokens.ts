import jwt, { JwtPayload } from "jsonwebtoken";

export interface DecodedVerificationToken extends JwtPayload{
  userId: string,
  intent: string,
}
export interface DecodedPasswordResetToken extends JwtPayload{
  userId: string,
  intent: string,
}

export const createVerificationToken = (userId: string): string => {
  // ensure id exists
  if (!userId || typeof userId !== "string") return "";
  const token = jwt.sign({
    userId, 
    intent: "email_verification" 
  }, process.env.TOKEN_SECRET!, { expiresIn: "15m" });  

  return token;
}
export const verifyVerificationToken = (token?: string): DecodedVerificationToken | boolean => {
  if (!token || typeof token !== "string") return false;
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as DecodedVerificationToken;
    if (!decoded) return false;
    if (decoded?.intent !== "email_verification") return false;
    return decoded;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export const createPasswordResetToken = (userId: string): string => {
  // ensure id exists
  if (!userId || typeof userId !== "string") return "";
  const token = jwt.sign({
    userId, 
    intent: "password_reset" 
  }, process.env.TOKEN_SECRET!, { expiresIn: "15m" });  

  return token;
}

export const verifyPasswordResetToken = (token?: string): DecodedPasswordResetToken | boolean => {
  if (!token || typeof token !== "string") return false;
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as DecodedPasswordResetToken;
    if (!decoded) return false;
    if (decoded?.intent !== "password_reset") return false;
    return decoded;
  } catch (err) {
    console.error(err);
    return false;
  }
}
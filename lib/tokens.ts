import jwt, { JwtPayload } from "jsonwebtoken";

export interface DecodedVerificationToken extends JwtPayload{
  email: string,
  intent: string,
}

export const createVerificationToken = (email: string): string => {
  // ensure id exists
  if (!email || typeof email !== "string") return "";
  const token = jwt.sign({
    email, 
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

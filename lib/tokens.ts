import jwt from "jsonwebtoken";

export const createVerificationToken = (email: string): string | null => {
  // ensure id exists
  if (!email || typeof email !== "string") return null;
  const token = jwt.sign({
    email, 
    intent: "email_verification" 
  }, process.env.TOKEN_SECRET!, { expiresIn: "15m" });  

  return token;
}
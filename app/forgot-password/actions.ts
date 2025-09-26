"use server";
import { sanitize } from "@/lib/utils";
import { User } from "@/models/User";

export const forgotPassword = async (_prev: unknown, formData: FormData): Promise<boolean> => {
  const sanitized = sanitize(formData);
  const user = await User.findOne({ email: sanitized.email });
  if (!user) return false;
  return true;
}
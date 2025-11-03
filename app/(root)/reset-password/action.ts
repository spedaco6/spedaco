"use server";

import { AccountActionResponse, completePasswordReset } from "@/lib/accounts";
import { sanitize } from "@/lib/utils";
import { redirect } from "next/navigation";

export const resetPassword = async (resetToken: string = "", prevState: AccountActionResponse, formData: FormData): Promise<AccountActionResponse> => {
  if (!formData) return { success: false, error: "No form data provided" };
  const sanitized = sanitize(formData);
  const result = await completePasswordReset(String(sanitized.password), String(sanitized.confirmPassword), resetToken);
  if (!result.success) return { ...result };
  return redirect("/verify?mode=reset-success");
}
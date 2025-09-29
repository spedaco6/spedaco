"use server";
import { AccountActionResponse, submitPasswordResetRequest } from "@/lib/accounts";
import { sanitize } from "@/lib/utils";
import { redirect } from "next/navigation";

export const forgotPassword = async (_prev: unknown, formData: FormData): Promise<AccountActionResponse> => {
  // Ensure form data exists and is sanitized
  if (!formData) return { success: false};
  const sanitized = sanitize(formData);
  const { success, error } = await submitPasswordResetRequest(String(sanitized.email));
  // Redirect user
  if (!success) return { success: false, error };
  return redirect("/verify?mode=reset-request");
}
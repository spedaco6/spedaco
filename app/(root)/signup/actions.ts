'use server';

import { AccountActionResponse, createAccount } from "@/lib/accounts";
import { sanitize } from "@/lib/utils";
import { redirect } from "next/navigation";

export const signup = async (_prevState: object, formData: FormData | Record<string, unknown>): Promise<AccountActionResponse> => {
  // CONFIRM DATA
  // returns success false if no data is provided
  if (!formData) return { success: false, error: "No account data provided", prevValues: {} };
  
  // SANITIZE DATA
  // calls sanitize once
  const sanitized = sanitize(formData);

  try {
    const result = await createAccount(sanitized);
    if (!result.success) return { ...result, prevValues: sanitized };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Something went wrong", prevValues: sanitized };
  }

  return redirect("/verify?mode=verify");
}
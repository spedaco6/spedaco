"use server";
import { AuthActionResponse, authenticateUser } from "@/lib/auth";
import { createSession } from "@/lib/cookies";
import { sanitize } from "@/lib/utils";
import { redirect } from "next/navigation";

export const login = async (prevValues: AuthActionResponse, formData: FormData): Promise<AuthActionResponse> => {
  // Ensure formData exists
  if (!formData) return { error: "No data was provided" };
  
  // Sanitize data
  const sanitized = sanitize(formData);
  
  // Complete authentication action
  let result: AuthActionResponse;
  try {
    result = await authenticateUser(String(sanitized.email), String(sanitized.password));
    if (result.error || !result.refreshToken) return { ...result, prevValues: { email: sanitized.email }};
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Something went wrong. Could not authenticate user";
    return { error: message, prevValues: { email: sanitized.email } };
  }

  // Set cookie
  const { refreshToken } = result;
  await createSession(refreshToken);

  // Redirect to user dashboard
  return redirect("/auth/dashboard");
}
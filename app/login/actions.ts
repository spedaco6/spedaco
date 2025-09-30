import { AuthActionResponse, authenticateUser } from "@/lib/auth";
import { sanitize } from "@/lib/utils";

export const login = async (prevValues: AuthActionResponse, formData: FormData): Promise<AuthActionResponse> => {
  if (!formData) return { success: false, error: "No data was provided" };
  const sanitized = sanitize(formData);
  
  let result: AuthActionResponse;
  try {
    result = await authenticateUser(String(sanitized.email), String(sanitized.password));
    if (!result.success) return { ...result, prevValues: { email: sanitized.email }};
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Something went wrong. Could not authenticate user";
    return { success: false, error: message, prevValues: { email: sanitized.email } };
  }
  return { success: true, token: result.token, userId: result.userId };
}
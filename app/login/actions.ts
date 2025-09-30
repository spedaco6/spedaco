import { AuthActionResponse, authenticateUser } from "@/lib/auth";
import { sanitize } from "@/lib/utils";

export const login = async (prevValues: AuthActionResponse, formData: FormData): Promise<AuthActionResponse> => {
  // Ensure formData exists
  if (!formData) return { success: false, error: "No data was provided" };
  
  // Sanitize data
  const sanitized = sanitize(formData);
  
  // Complete authentication action
  let result: AuthActionResponse;
  try {
    result = await authenticateUser(String(sanitized.email), String(sanitized.password));
    if (!result.success) return { ...result, prevValues: { email: sanitized.email }};
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Something went wrong. Could not authenticate user";
    return { success: false, error: message, prevValues: { email: sanitized.email } };
  }

  // Create cookie

  // return result
  return { success: true, token: result.token, userId: result.userId };
}
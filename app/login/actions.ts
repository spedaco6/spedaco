import { AuthActionResponse, authenticateUser } from "@/lib/auth";
import { sanitize } from "@/lib/utils";

export const login = async (prevValues: AuthActionResponse, formData: FormData): Promise<AuthActionResponse> => {
  if (!formData) return { success: false, error: "No data was provided" };
  const sanitized = sanitize(formData);
  console.log(prevValues);
  
  try {
    const result = await authenticateUser(String(sanitized.email), String(sanitized.password));
    console.log(result);
  } catch (err) {
    console.error(err);
  }
  return { success: true };
}
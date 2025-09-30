export interface AuthActionResponse {
  success: boolean,
  error?: string,
  prevValues?: Record<string, unknown>,
  accessToken?: string,
  refreshToken?: string,
}

export const authenticateUser = async (email: string, password: string): Promise<AuthActionResponse> => {
  // Ensure data is provided
  console.log(email);
  console.log(password);

  // Find user

  // Validate password

  // Create token

  // Save token to database

  // Return result
  return { success: true };
}
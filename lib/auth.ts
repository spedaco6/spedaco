export interface AuthActionResponse {
  success: boolean,
  error?: string,
  prevValues?: Record<string, unknown>,
  token?: string,
  userId?: string,
}

export const authenticateUser = async (email: string, password: string): Promise<AuthActionResponse> => {
  console.log(email);
  console.log(password);
  return { success: true };
}
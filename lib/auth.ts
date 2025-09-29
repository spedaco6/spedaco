export interface AuthActionResponse {
  success: boolean,
  error?: string,
}

export const authenticateUser = async (email: string, password: string): Promise<AuthActionResponse> => {
  console.log(email);
  console.log(password);
  return { success: true };
}
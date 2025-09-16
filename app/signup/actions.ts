'use server';

interface SignUpData {
  firstName?: string,
  lastName?: string,
  email?: string,
  password?: string,
  confirmPassword?: string,
  terms?: string | boolean,
};

export async function signup(prevState: SignUpData, formData: FormData): Promise<SignUpData> {
  const requiredInputs: (keyof SignUpData)[] = ["firstName", "lastName", "email", "password", "confirmPassword", "terms"];
  console.log(requiredInputs);
  console.log(formData);
  return await new Promise(res => setTimeout(() => res({}), 1000));
}
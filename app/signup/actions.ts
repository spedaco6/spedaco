'use server';

import { sanitize } from "@/lib/utils";
import { Validator } from "@/lib/Validator";

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
  console.log("formData", formData);
  const sanitized: Record<string, unknown> = sanitize(formData);
  console.log("sanitized", sanitized);
  const validators = Validator.getAllValidators(sanitized);
  console.log("validators", validators);
  return await new Promise(res => setTimeout(() => res({}), 1000));
}
'use server';

import { sanitize } from "@/lib/utils";
import { Validator, Validators } from "@/lib/Validator";

interface SignUpData {
  firstName?: string,
  lastName?: string,
  email?: string,
  password?: string,
  confirmPassword?: string,
  terms?: string | boolean,
};

export async function signup(prevState: SignUpData, formData: FormData): Promise<SignUpData> {
  try {
    // Sanitize Data
    const requiredInputs: (keyof SignUpData)[] = ["firstName", "lastName", "email", "password", "confirmPassword", "terms"];
    const sanitized: Record<string, unknown> = sanitize(formData);
  
    // Validate Data
    const validators: Validators = Validator.getAllValidators(sanitized, requiredInputs);
    console.log("validators", validators);
    validators.email.isEmail();
    validators.password.isPassword();
    validators.confirmPassword.matches(validators.password);
    console.log(validators);
  
    // Authenticate User
      // No authentication required for new users
  
    // Authorize User
      // Check to see if requested email is already in use
  
    // Complete Action
      // Add new user
      // Create token
      // Create cookie
  
    // Return Result
      // Return true or false
    return await new Promise(res => setTimeout(() => res({}), 1000));
  } catch (err) {
    console.log(err);
    return await new Promise(res => setTimeout(() => res({}), 1000));
  }
}
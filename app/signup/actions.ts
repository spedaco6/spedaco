'use server';

import { SALT_ROUNDS } from "@/lib/config";
import { connectToDB } from "@/lib/database";
import { sanitize } from "@/lib/utils";
import { Validator, AllValidators, AllValidity } from "@/lib/Validator";
import { User } from "@/models/User";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";

export interface FormResponse {
  success?: boolean,
  errors?: string[],
  validationErrors?: Record<string, string[]>,
  prevValues?: Record<string, unknown>,
}

export async function signup(prevState: FormResponse, formData: FormData): Promise<FormResponse> {
  let sanitized: Record<string, unknown> | null = null;
  try {
    // Sanitize Data
    const includeInputs: string[] = ["firstName*", "lastName*", "email*", "password*", "confirmPassword", "terms*"];
    sanitized = sanitize(formData);
  
    // Validate Data
    const validators: AllValidators = Validator.getAllValidators(sanitized, includeInputs);
    validators.email.isEmail();
    validators.password.isPassword();
    validators.confirmPassword.matches(validators.password);
    const validity: AllValidity = Validator.getAllValidity(validators);
    if (!validity.isValid) return { success: false, validationErrors: validity.validationErrors, errors: [], prevValues: Validator.getAllValues(validators)};
    
    // Connect to database
    const connection = await connectToDB();
    if (!connection) return { success: false, validationErrors: {}, errors: ["Could not connect to the server. Try again later"], prevValues: Validator.getAllValues(validators)};
  
    // Authenticate User
      // No authentication required for new users
  
    // Authorize User
    // Check to see if requested email is available for use
    const user = await User.findOne({ email: validators.email.getValue() });
    if (user) return { success: false, validationErrors: {}, errors: ["Email already exists"], prevValues: Validator.getAllValues(validators) };

    // Complete Action
    // Hash password
    const hashedPassword = await bcrypt.hash(String(validators.password.getValue()), SALT_ROUNDS);

    // Create and add new user to database
    const newUser = new User({
      firstName: validators.firstName.getValue(),
      lastName: validators.lastName.getValue(),
      email: validators.email.getValue(),
      password: hashedPassword,
      terms: validators.terms.getValue(),
    });
    await newUser.save();
    
    // Create verification token
    const verificationToken = "123";
    // Send verification email

    // Save verification token to user
    newUser.verificationToken = verificationToken;
    await newUser.save();
  } catch (err) {
    console.log(err);
    return {success: false, validationErrors: {}, errors: [`Something went wrong: ${err}`], prevValues: sanitized ? sanitized : {}};
  }
    
  // Return Result or Reroute
  return redirect("/verify");
}
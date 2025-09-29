'use server';

import { SALT_ROUNDS } from "@/lib/config";
import { connectToDB } from "@/lib/database";
import { sendVerificationEmail } from "@/lib/email";
import { createVerificationToken } from "@/lib/tokens";
import { sanitize } from "@/lib/utils";
import { Validator, AllValidators, AllValidity, AllValues } from "@/lib/Validator";
import { User } from "@/models/User";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";

export interface FormResponse {
  success?: boolean,
  error?: string,
  validationErrors?: Record<string, string[]>,
  prevValues?: Record<string, unknown>,
}

export const createAccount = async (_prevState: object, formData: FormData | Record<string, unknown>): Promise<FormResponse> => {
  // CONFIRM DATA
  const expectedData = ["firstName*", "lastName*", "email*", "password*", "confirmPassword", "terms*"];
  // returns success false if no data is provided
  if (!formData) return { success: false, error: "No account data provided", prevValues: {} };
  
  // SANITIZE DATA
  // calls sanitize once
  const sanitized = sanitize(formData);

  // VALIDATE DATA  
  // calls getAllValidators once
  const validators: AllValidators = Validator.getAllValidators(sanitized, expectedData);
  const prevValues: AllValues = Validator.getAllValues(validators);
  const { email, password, confirmPassword }: Record<string, Validator> = validators;
  // returns success false and validationErrors if validation fails
  email.isEmail();
  password.isPassword();
  confirmPassword.matches(validators.password);
  const { isValid, validationErrors }: AllValidity = Validator.getAllValidity(validators);
  if (!isValid) return { success: false, validationErrors, prevValues }
  
  try {
    // CONFIRM DATABASE CONNECTION
    const connection = await connectToDB();
    if (!connection) return { success: false, error: "Could not connect to database", prevValues };
    // AUTHENTICATE USER not required for signup
    
    // AUTHORIZE USER by ensuring unique email
    const existingUser = await User.findOne({ email: email.getValue() });
    if (existingUser) return { success: false, error: "Email already in use", prevValues };
    
    // COMPLETE ACTION
    // encrypt password
    const hashedPassword = await bcrypt.hash(String(password.getValue()), SALT_ROUNDS);
    const newUser = new User({
      firstName: validators.firstName.getValue(),
      lastName: validators.lastName.getValue(),
      email: validators.email.getValue(),
      password: hashedPassword,
      terms: validators.terms.getValue(),
      role: 'user',
      verified: false,
    });
    // save user
    await newUser.save();

    // create verification token
    const verificationToken: string = createVerificationToken(String(newUser._id));
    newUser.verificationToken = verificationToken;
    await newUser.save();
    
    // Send verification email
    await sendVerificationEmail(newUser.email, newUser.verificationToken);
  } catch (err) {
    console.error(err);
    const message: string = err instanceof Error ? err.message : "Something went wrong";
    return { success: false, error: message, prevValues };
  }

  return redirect("/verify?mode=verify");
}

export const deleteAccount = async () => {

}

export const resetAccountPassword = async () => {

}

export const updateAccount = async () => {
  
}
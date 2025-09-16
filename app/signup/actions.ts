'use server';

import { connectToDB } from "@/lib/database";
import { sanitize } from "@/lib/utils";
import { Validator, AllValidators, AllValidity } from "@/lib/Validator";
import { User } from "@/models/User";
import bcrypt from "bcrypt";

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
    const includeInputs: string[] = ["firstName*", "lastName*", "email*", "password*", "confirmPassword", "terms*"];
    const sanitized: Record<string, unknown> = sanitize(formData);
  
    // Validate Data
    const validators: AllValidators = Validator.getAllValidators(sanitized, includeInputs);
    validators.email.isEmail();
    validators.password.isPassword();
    validators.confirmPassword.matches(validators.password);
    const validity: AllValidity = Validator.getAllValidity(validators);
    console.log(validity);
  
    // Connect to database
    await connectToDB();

    // Authenticate User
      // No authentication required for new users
  
    // Authorize User
      // Check to see if requested email is available for use
    const user = await User.findOne({ email: validators.email.getValue() });
    if (user) console.log("Return an unsuccessful message here");

    // Complete Action
      // Hash password
      const hashedPassword = await bcrypt.hash(String(validators.password.getValue()), 10);

      // Create new user object
      const newUser = new User({
        firstName: validators.firstName.getValue(),
        lastName: validators.lastName.getValue(),
        email: validators.email.getValue(),
        password: hashedPassword,
        terms: validators.terms.getValue(),
      });

      // Add new user
      console.log(await newUser.save());
      
      // Create token
      
      // Add token
      
      // Create cookie
  
    // Return Result or Reroute
    return await new Promise(res => setTimeout(() => res({}), 1000));
  } catch (err) {
    console.log(err);
    return {};
  }
}
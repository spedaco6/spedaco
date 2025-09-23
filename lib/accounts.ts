import { User } from "@/models/User";
import { connectToDB } from "./database";
import { sanitize } from "./utils";
import { Validator } from "./Validator";
import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "./config";
import { createVerificationToken } from "./tokens";



// is defined
export const createAccount = async (formData: FormData | Record<string, unknown>) => {
  // CONFIRM DATA
  const expectedData = ["firstName*", "lastName*", "email*", "password*", "confirmPassword", "terms*"];
  // returns success false if no data is provided
  if (!formData) return { success: false, error: "No account data provided", prevValues: {} };
  
  // SANITIZE DATA
  // calls sanitize once
  const sanitized = sanitize(formData);

  // VALIDATE DATA  
  // calls getAllValidators once
  const validators = Validator.getAllValidators(sanitized, expectedData);
  const prevValues = Validator.getAllValues(validators);
  const { email, password, confirmPassword } = validators;
  // returns success false and validationErrors if validation fails
  email.isEmail();
  password.isPassword();
  confirmPassword.matches(validators.password);
  const { isValid, validationErrors } = Validator.getAllValidity(validators);
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
    // encrypts password
    const hashedPassword = await bcrypt.hash(String(password.getValue()), SALT_ROUNDS);
    // creates verification token
    const verificationToken = createVerificationToken();
    // creates user
    const newUser = new User({
      firstName: validators.firstName.getValue(),
      lastName: validators.lastName.getValue(),
      email: validators.email.getValue(),
      password: hashedPassword,
      role: 'user',
      verified: false,
      verificationToken,
    });
  
    // returns user
    return await newUser.save();
  } catch (err) {
    console.error(err);
    const message: string = err instanceof Error ? err.message : "Something went wrong";
    return { success: false, error: message, prevValues };
  }
}
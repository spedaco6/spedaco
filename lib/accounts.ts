import { IUser, User } from "@/models/User";
import { sendPasswordResetEmail, sendVerificationEmail } from "./email";
import { MongooseError } from "mongoose";
import { connectToDB } from "./database";
import { AllValidators, AllValidity, Validator } from "./Validator";
import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "./config";
import { v4 } from "uuid";
import { decrypt, DecodedToken, encrypt } from "./tokens";

export interface AccountActionResponse {
  success: boolean,
  error?: string,
  validationErrors?: Record<string, string[]>,
  prevValues?: Record<string, unknown>,
  user?: Partial<IUser>,
}

export const createAccount = async (formData: Record<string, unknown>): Promise<AccountActionResponse> => {
  // CONFIRM DATA
    const expectedData = ["firstName*", "lastName*", "email*", "password*", "confirmPassword", "terms*"];
    // returns success false if no data is provided
    if (!formData) return { success: false, error: "No account data provided" };
    // VALIDATE DATA  
    // calls getAllValidators once
    const validators: AllValidators = Validator.getAllValidators(formData, expectedData);
    const { email, password, confirmPassword }: Record<string, Validator> = validators;
    // returns success false and validationErrors if validation fails
    email.isEmail();
    password.isPassword();
    confirmPassword.matches(password);
    const { isValid, validationErrors }: AllValidity = Validator.getAllValidity(validators);
    if (!isValid) return { success: false, validationErrors }
    
    let existingUser: IUser | null;
    try {
      // CONFIRM DATABASE CONNECTION
      const connection = await connectToDB();
      if (!connection) return { success: false, error: "Could not connect to database" };
      // AUTHENTICATE USER not required for signup
      // AUTHORIZE USER by ensuring unique email
      existingUser = await User.findOne({ email: email.getValue() });
      if (existingUser) return { success: false, error: "Email already in use" };
    } catch (err) {
      const message = !(err instanceof MongooseError) && err instanceof Error ? err.message : "Something went wrong. Could not create your account at this time";
      return { success: false, error: message };
    }

    // hash password
    let hashedPassword: string = "";
    try {
      hashedPassword = await bcrypt.hash(String(password.getValue()), SALT_ROUNDS);
    } catch (err) {
      console.error(err);
      return { success: false, error: "Unable to save user at this time" }
    }

    // Generate initial jti
    const jti: string = v4();

    // Create new user
    const newUser = new User({
      firstName: validators.firstName.getValue(),
      lastName: validators.lastName.getValue(),
      email: validators.email.getValue(),
      password: hashedPassword,
      terms: validators.terms.getValue(),
      role: 'user',
      verified: false,
      jti,
    });

    // save user
    try {
      await newUser.save();
    } catch (err) {
      console.error(err);
      const message: string = err instanceof Error ? err.message : "Could not save new user account at this time";
      return { success: false, error: message };
    }

    // create verification token amd update user
    try {
      const verificationToken: string = await encrypt(newUser, "email_verification");
      newUser.verificationToken = verificationToken;
      await newUser.save();
    } catch (err) {
      console.error(err);
      const message: string = err instanceof Error ? err.message : "Something went wrong";
      return { success: false, error: message };
    }
    
    // Send verification email
    try {
      await sendVerificationEmail(newUser.email, newUser.verificationToken);
    } catch (err) {
      console.error(err);
      return { success: false, error: "Could not send verification email" };
    }

    // Return success
    return { success: true };
}

export const submitPasswordResetRequest = async (email: string): Promise<AccountActionResponse> => {
  // Ensure form data exists
  if (!email || typeof email !== "string") return { success: false, error: "Invalid email" };
  
  // Find requested account by email
  let user: IUser | null = null;
  try {
    await connectToDB();
    user = await User.findOne({ email });
    if (!user) return { success: false, error: "Email could not be found" };
  } catch (err) {
    const message = !(err instanceof MongooseError) && err instanceof Error ? err.message : "Something went wrong. Try again later";
    return { success: false, error: message };
  }

  // Create and save password reset token
  let token: string;
  try {
    token = await encrypt(user, "password_reset");
    user.passwordResetToken = token;
    await user.save();
  } catch (err) {
    console.error(err);
    return { success: false, error: "Could not reset password at this time. Try again later" };
  }
    
  // Send password reset email
  try {
    await sendPasswordResetEmail(user.email, user.passwordResetToken);
  } catch (err) {
    console.error(err);
    return { success: false, error: "Could not send reset email at this time. Try again later" };
  }
  
  // Return success with updated user object
  return { success: true, user };
}

export const completePasswordReset = async (
password: string, 
confirmPassword: string, 
token: string): 
Promise<AccountActionResponse> => {
  // Confirm data
  if (!password || !confirmPassword || !token) return { success: false, error: "No data provided" };
  
  // Validate password
  const validators: AllValidators = Validator.getAllValidators({ password, confirmPassword });
  validators.password.isPassword();
  validators.confirmPassword.matches(password);
  const { isValid, validationErrors } = Validator.getAllValidity(validators);
  if (!isValid) return { success: false, validationErrors };

  // Verify reset token
  let decoded: DecodedToken;
  try {
    decoded = await decrypt(token, "password_reset");
    if (decoded?.error) throw new Error(decoded.error);
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Invalid token";
    return { success: false, error: message };
  }

  // Find user and match passwordResetToken
  let user: IUser | null;
  try {
    await connectToDB();
    const userId = decoded?.userId;
    user = await User.findById(userId);
    if (!user) throw new Error("Invalid user");
    if (user.passwordResetToken !== token) throw new Error("Token mismatch");
  } catch (err) {
    const message = !(err instanceof MongooseError) && err instanceof Error ? err.message : "Something went wrong. Could not update password";
    return { success: false, error: message };
  }
  
  // Update user
  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    user.password = passwordHash;
    user.passwordResetToken = undefined;
    await user.save();
  } catch (err) {
    const message = !(err instanceof MongooseError) && err instanceof Error ? err.message : "Something went wrong. Could not update password";
    return { success: false, error: message };
  }

  // Return success
  return { success: true };
}
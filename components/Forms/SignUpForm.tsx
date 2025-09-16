"use client";
import React, { useActionState, useMemo } from "react";
import Form from "./Form";
import Input from "../Input";
import useInput, { UseInputReturn } from "@/hooks/useInput";
import { ValidationFn, Validator } from "@/lib/Validator";
import { signup } from "@/app/signup/actions";

const IS_PASSWORD: ValidationFn[] = [Validator.isPassword()];
const IS_EMAIL = [Validator.isEmail];

export default function SignUpForm({ className="" }: React.PropsWithChildren<{ className?: string }>): React.ReactElement {
  
  const firstName: UseInputReturn = useInput("firstName*");
  const lastName: UseInputReturn = useInput("lastName*");
  const email: UseInputReturn = useInput("email*", "", IS_EMAIL);
  const password: UseInputReturn = useInput("password*", "", IS_PASSWORD);
  const valid_confirm_pass = useMemo(() => ([Validator.matches(password.value)]), [password.value]);
  const confirmPassword: UseInputReturn = useInput("confirmPassword", "", valid_confirm_pass, { dependencies: [password.value] });
  const terms: UseInputReturn = useInput("terms", false, [], { message: "Terms and conditions must be accepted"});
  const [signupState, formAction] = useActionState(signup, {});
  


  return <Form className={`sm:w-[25rem] w-4/5 m-2 border-2 p-4 rounded-xl ${className}`} action={formAction}>
    <h2 className="text-2xl">Sign Up</h2>
    <div className="flex gap-2">
      <Input title="First Name" hook={firstName} autoFocus />
      <Input title="Last Name" hook={lastName} />
    </div>
    <Input title="Email" hook={email} />
    <Input title="New Password" type="password" hook={password} />
    <Input title="Confirm Password" type="password" hook={confirmPassword} />
    <Input title="Accept the terms and conditions" type="checkbox" hook={terms} />
    <div className="flex justify-end m-2 mt-4">
      <button>Login</button>
    </div>
  </Form>
}
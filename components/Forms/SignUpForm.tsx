"use client";
import React, { useActionState, useEffect, useMemo } from "react";
import Input from "../Input";
import useInput, { UseInputReturn } from "@/hooks/useInput";
import { ValidationFn, Validator } from "@/lib/Validator";
import { createAccount } from "@/app/signup/actions";

const IS_PASSWORD: ValidationFn[] = [Validator.isPassword()];
const IS_EMAIL = [Validator.isEmail];

export default function SignUpForm({ className="" }: React.PropsWithChildren<{ className?: string }>): React.ReactElement {
  
  const firstName: UseInputReturn = useInput("firstName");
  const lastName: UseInputReturn = useInput("lastName");
  const email: UseInputReturn = useInput("email", "", IS_EMAIL);
  const password: UseInputReturn = useInput("password", "", IS_PASSWORD);
  const valid_confirm_pass = useMemo(() => ([Validator.matches(password.value)]), [password.value]);
  const confirmPassword: UseInputReturn = useInput("confirmPassword", "", valid_confirm_pass, { dependencies: [password.value] });
  const terms: UseInputReturn = useInput("terms", false, [], { message: "Terms and conditions must be accepted"});
  const [prevState, formAction, isPending] = useActionState(createAccount, {});
  
  
  useEffect(() => {
    if (prevState?.success === false && prevState?.validationErrors) {
      const form: Record<string, ((error: string | string[]) => void)> = { 
        firstName: firstName.addErrors, 
        lastName: lastName.addErrors, 
        email: email.addErrors, 
        password: password.addErrors, 
        confirmPassword: confirmPassword.addErrors, 
        terms: terms.addErrors, 
      };
      Object.entries(prevState.validationErrors).forEach(([key, val]) => {
        form[key](val);
      });
    }
  }, [prevState, firstName.addErrors, lastName.addErrors, email.addErrors, password.addErrors, confirmPassword.addErrors, terms.addErrors]);

  return <form className={`sm:w-[25rem] w-4/5 m-2 border-2 p-4 rounded-xl ${className}`} action={formAction}>
    <h2 className="text-2xl">Sign Up</h2>
    <div className="flex gap-2">
      <Input disabled={isPending} title="First Name" hook={firstName} autoFocus />
      <Input disabled={isPending} title="Last Name" hook={lastName} />
    </div>
    <Input disabled={isPending} title="Email" hook={email} />
    <Input disabled={isPending} title="New Password" type="password" hook={password} />
    <Input disabled={isPending} title="Confirm Password" type="password" hook={confirmPassword} />
    <Input disabled={isPending} title="Accept the terms and conditions" type="checkbox" hook={terms} />
    <div className="flex justify-end m-2 mt-4">
      <button>{isPending ? "Sending request..." : "Sign up"}</button>
    </div>
  </form>
}
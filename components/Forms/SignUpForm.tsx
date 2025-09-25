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
      const form: Record<string, ((error?: string | string[]) => void)> = { 
        firstName: firstName.onReset, 
        lastName: lastName.onReset, 
        email: email.onReset, 
        password: password.onReset, 
        confirmPassword: confirmPassword.onReset, 
        terms: terms.onReset, 
      };
      Object.entries(prevState.validationErrors).forEach(([key, val]) => {
        form[key](val);
      });
    }
  }, [prevState, firstName.onReset, lastName.onReset, email.onReset, password.onReset, confirmPassword.onReset, terms.onReset]);

  return <form className={`sm:w-[25rem] w-4/5 m-2 border-2 p-4 rounded-xl ${className}`} action={formAction}>
    <h2 className="text-2xl">Sign Up</h2>
    { prevState?.error && <p className="text-error mt-2">{prevState.error}</p> }
    <div className="flex gap-2">
      <Input disabled={isPending} title="First Name" hook={firstName} autoFocus />
      <Input disabled={isPending} title="Last Name" hook={lastName} />
    </div>
    <Input disabled={isPending} title="Email" hook={email} />
    <div className="flex gap-2">
      <Input disabled={isPending} title="New Password" type="password" hook={password} />
      <Input disabled={isPending} title="Confirm Password" type="password" hook={confirmPassword} />
    </div>
    <Input disabled={isPending} title="Accept the terms and conditions" type="checkbox" hook={terms} />
    <div className="flex justify-end m-2 mt-4">
      <button disabled={isPending}>{isPending ? "Sending request..." : "Sign up"}</button>
    </div>
  </form>
}
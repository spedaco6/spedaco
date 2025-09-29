"use client";

import useInput, { UseInputReturn } from "@/hooks/useInput";
import { Validator } from "@/lib/Validator";
import React, { useActionState, useEffect, useMemo } from "react";
import Input from "../Input";
import { resetPassword } from "@/app/reset-password/action";

const IS_PASSWORD = [Validator.isPassword()];

export default function PasswordResetForm({ resetToken="" }: { resetToken: string }): React.ReactElement {
  const password: UseInputReturn = useInput("password*", "", IS_PASSWORD);
  const PASSWORD_MATCH = useMemo(() => [Validator.matches(password.value)], [password.value]);
  const confirmPassword: UseInputReturn = useInput("confirmPassword*", "", PASSWORD_MATCH, { dependencies: [password.value] });
  const [{ success, error, validationErrors }, formAction, isPending] = useActionState(resetPassword.bind(null, resetToken), { success: false });

  useEffect(() => {
    if (!success && validationErrors) {
      const form: Record<string, ((error?: string | string[]) => void)> = { 
        password: password.onReset, 
        confirmPassword: confirmPassword.onReset, 
      };
      Object.entries(validationErrors).forEach(([key, val]) => {
        form[key](val);  
      }); 
    }
  }, [success, validationErrors, password.onReset, confirmPassword.onReset]);

  return <form className="border-1 border-gray rounded-sm w-100 p-4" action={formAction}>
    <h2>Create new password</h2>
      { error && <p className="text-error">{ error }</p> }
      <Input hook={password} type="password" title="New Password" disabled={isPending} />
      <Input hook={confirmPassword} type="password" title="Confirm Password" disabled={isPending} />
    <div className="flex justify-end mt-4"><button>{ isPending ? "Submitting..." : "Submit"}</button></div>
  </form>
}
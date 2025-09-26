"use client";

import useInput, { UseInputReturn } from "@/hooks/useInput";
import { Validator } from "@/lib/Validator";
import React, { useMemo } from "react";
import Input from "../Input";

const IS_PASSWORD = [Validator.isPassword()];

export default function PasswordResetForm(): React.ReactElement {
  const password: UseInputReturn = useInput("password*", "", IS_PASSWORD);
  const PASSWORD_MATCH = useMemo(() => [Validator.matches(password.value)], [password.value]);
  const confirmPassword: UseInputReturn = useInput("confirmPassword*", "", PASSWORD_MATCH, { dependencies: [password.value] });

  return <form className="border-1 border-gray rounded-sm w-100 p-4">
    <h2>Create new password</h2>
      <Input hook={password} type="password" title="New Password" />
      <Input hook={confirmPassword} type="password" title="Confirm Password" />
    <div className="flex justify-end mt-4"><button>Submit</button></div>
  </form>
}
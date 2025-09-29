"use client";
import React, { useActionState } from "react";
import Input from "../Input";
import useInput, { UseInputReturn } from "@/hooks/useInput";
import { Validator } from "@/lib/Validator";
import { forgotPassword } from "@/app/forgot-password/actions";

const IS_EMAIL = [Validator.isEmail];

export default function EmailForm(): React.ReactElement {
  const email: UseInputReturn = useInput("email*", "", IS_EMAIL);
  const [{ success, error },formAction, isPending] = useActionState(forgotPassword, { success: false });

  return <>
    { !success && <form className="border-1 border-gray rounded-sm w-100 p-4" action={formAction}>
      { error && <p className="text-error">{error}</p> }
      <Input title="Enter your email" type="email" hook={email} disabled={isPending} autoFocus />
      <div className="flex justify-end mt-4">
        <button disabled={isPending}>{ isPending ? "Submitting" : "Submit" }</button>
        </div>
    </form> }
  </>
}
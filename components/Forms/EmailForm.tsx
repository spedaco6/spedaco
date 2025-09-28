"use client";
import React, { useActionState } from "react";
import Input from "../Input";
import useInput, { UseInputReturn } from "@/hooks/useInput";
import { Validator } from "@/lib/Validator";
import { forgotPassword } from "@/app/forgot-password/actions";

const IS_EMAIL = [Validator.isEmail];

export default function EmailForm(): React.ReactElement {
  const email: UseInputReturn = useInput("email*", "", IS_EMAIL);
  
  const [{ success },formAction] = useActionState(forgotPassword, { success: false });
  console.log(success);
  
  return <form className="border-1 border-gray rounded-sm w-100 p-4" action={formAction}>
    <Input title="Enter your email" type="email" hook={email} />
    <div className="flex justify-end mt-4"><button>Submit</button></div>
  </form>
}
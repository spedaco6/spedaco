"use client";
import React from "react";
import Input from "../Input";
import useInput, { UseInputReturn } from "@/hooks/useInput";
import { Validator } from "@/lib/Validator";

const IS_EMAIL = [Validator.isEmail];

export default function EmailForm(): React.ReactElement {
  const email: UseInputReturn = useInput("email*", "", IS_EMAIL);
  


  return <form className="border-1 border-gray rounded-sm w-100 p-4">
    <Input title="Enter your email" type="email" hook={email} />
    <div className="flex justify-end mt-4"><button>Submit</button></div>
  </form>
}
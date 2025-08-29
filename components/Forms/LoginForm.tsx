"use client";
import React from "react";
import Form from "./Form";
import Input from "../Input";
import useInput, { UseInputReturn } from "@/hooks/useInput";
import { IS_EMAIL } from "@/lib/validation";

export default function LoginForm({ className="" }: React.PropsWithChildren<{ className?: string }>): React.ReactElement {
  const email: UseInputReturn = useInput("email*", "", [IS_EMAIL]);
  const password: UseInputReturn = useInput("password*", "", []);
  return <Form className={`sm:w-[25rem] w-4/5 m-2 border-2 p-4 rounded-xl ${className}`}>
    <h2 className="text-2xl">Login</h2>
    <Input title="Email" hook={email} autoFocus />
    <Input title="Password" hook={password} />
    <div className="flex justify-end m-2 mt-4">
      <button>Login</button>
    </div>
  </Form>
}
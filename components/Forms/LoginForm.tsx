"use client";
import React, { useActionState, useEffect } from "react";
import Input from "../Input";
import useInput, { UseInputReturn } from "@/hooks/useInput";
import { Validator } from "@/lib/Validator";
import { login } from "@/app/login/actions";

const IS_EMAIL = [Validator.isEmail];

export default function LoginForm({ className="" }: React.PropsWithChildren<{ className?: string }>): React.ReactElement {
  const email: UseInputReturn = useInput("email*", "", IS_EMAIL, { message: "Email is required" });
  const password: UseInputReturn = useInput("password*", "", [], { message: "Password is required"});
  const [ authState, loginAction, isPending ] = useActionState(login, { success: false });
  
  /* useEffect(() => {
    if (authState.accessToken) {
      localStorage.setItem("accessToken", authState.accessToken);
    }
  }, [authState.accessToken]); */

  return <form 
    className={`sm:w-[25rem] w-4/5 m-2 border-2 p-4 rounded-xl ${className}`} 
    action={loginAction}
  >
    { authState.error && <p className="text-error">{authState.error}</p> }
    <h2 className="text-2xl">Login</h2>
    <Input title="Email" hook={email} autoFocus disabled={isPending} />
    <Input title="Password" type="password" hook={password} disabled={isPending} />
    <div className="flex justify-end m-2 mt-4">
      <button disabled={isPending}>{isPending ? "Logging in..." : "Login"}</button>
    </div>
  </form>
}
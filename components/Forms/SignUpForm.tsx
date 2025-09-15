"use client";
import React, { useMemo } from "react";
import Form from "./Form";
import Input from "../Input";
import useInput, { UseInputReturn } from "@/hooks/useInput";
import { MATCHES, VALID_EMAIL, VALID_PASS } from "@/lib/validation";

export default function SignUpForm({ className="" }: React.PropsWithChildren<{ className?: string }>): React.ReactElement {
  const firstName: UseInputReturn = useInput("firstName*");
  const lastName: UseInputReturn = useInput("lastName*");
  const email: UseInputReturn = useInput("email*", "", VALID_EMAIL);
  const password: UseInputReturn = useInput("password*", "", VALID_PASS);
  const valid_confirm_pass = useMemo(() => ([MATCHES(password.value)]), [password.value]);
  const confirmPassword: UseInputReturn = useInput("confirmPassword*", "", valid_confirm_pass, { dependencies: [password.value] });
  const type: UseInputReturn = useInput("type*", "existing");
  const notes: UseInputReturn = useInput("notes*", "");
  const terms: UseInputReturn = useInput("terms*", false, [], { message: "Terms and conditions must be accepted"});

  console.log(terms);
  return <Form className={`sm:w-[25rem] w-4/5 m-2 border-2 p-4 rounded-xl ${className}`}>
    <h2 className="text-2xl">Sign Up</h2>
    <div className="flex gap-2">
      <Input title="First Name" hook={firstName} autoFocus />
      <Input title="Last Name" hook={lastName} />
    </div>
    <Input title="Email" hook={email} />
    <Input title="Password" type="password" hook={password} />
    <Input title="Password" type="password" hook={confirmPassword} />
    <Input title="Accept the terms and conditions" type="checkbox" hook={terms} />
    <Input title="Type" hook={type} options={["", "new", "existing", "none"]} />
    <Input type="textarea" title="Notes" hook={notes} />
    <div className="flex justify-end m-2 mt-4">
      <button>Login</button>
    </div>
  </Form>
}
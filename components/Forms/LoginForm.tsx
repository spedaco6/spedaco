"use client";
import React from "react";
import Form from "./Form";
import Input from "../Input";

export default function LoginForm({ className="" }: React.PropsWithChildren<{ className?: string }>): React.ReactElement {
  return <Form className={`sm:w-[25rem] w-4/5 m-2 border-2 p-4 rounded-xl ${className}`}>
    <h2 className="text-2xl">Login</h2>
    <Input title="Email" autoFocus />
    <Input title="Password" />
    <div className="flex justify-end m-2 mt-4">
      <button>Login</button>
    </div>
  </Form>
}
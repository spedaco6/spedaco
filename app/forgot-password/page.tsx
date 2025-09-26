import EmailForm from "@/components/Forms/EmailForm";
import React from "react";

export default async function ForgotPasswordPage(): Promise<React.ReactElement> {
  <h1>Forgot password</h1>
  return <main>
    <EmailForm />
  </main>
}
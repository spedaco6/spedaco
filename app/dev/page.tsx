import EmailForm from "@/components/Forms/EmailForm";
import PasswordResetForm from "@/components/Forms/PasswordResetForm";
import RedirectTimer from "@/components/RedirectTimer";
import React from "react";

export default async function DevPage(): Promise<React.ReactElement> {
  return <main>
    <PasswordResetForm />
    <EmailForm />
  </main>
}
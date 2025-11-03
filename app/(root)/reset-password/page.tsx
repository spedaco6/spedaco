import PasswordResetForm from "@/components/Forms/PasswordResetForm";
import React from "react";

export default async function PasswordResetPage({ searchParams }: 
  { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }): Promise<React.ReactElement> {
  const params = await searchParams;
  const token = params.token ?? "";
  const hasToken = !!token && typeof token === "string";

  return <main>
    { !hasToken && <p>This page has expired</p> }
    { hasToken && <>
      <h1>Reset Password</h1>
      <PasswordResetForm resetToken={hasToken ? token : ""} />
    </> }
  </main>
}
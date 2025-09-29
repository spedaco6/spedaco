import React from "react";
import { verifyAccount } from "./actions";
import RedirectTimer from "@/components/RedirectTimer";

export default async function VerifyPage({ searchParams }: 
  { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }): Promise<React.ReactElement> {
  const params = await searchParams;
  const token: string | string[] | undefined = params?.token;
  const mode: string | string[] | undefined = params?.mode ?? "default";
  const hasToken: boolean = !!token;

  let success: boolean = false;

  if (hasToken && typeof token === "string") {
    success = await verifyAccount(token);
  }

  return <main>
    { mode === "default" && <p>This page has expired</p> }
    { mode === "verify" && <>
      { hasToken && success && <>
        <h1>Account verified successfully!</h1>
        <p>Thank you for verifying your account</p> 
        <RedirectTimer href="/login" />
      </> }

      { hasToken && !success && <>
        <p>There was a problem verifying your account</p>
      </> }

      { !hasToken && <p>Please verify your account. An email has been sent</p> }
    </> }
    { mode === "reset" && <>
      { hasToken && success && <>
        <h1>Password reset successfully!</h1> 
        <RedirectTimer href="/login" />
      </> }

      { hasToken && !success && <>
        <p>There was a problem with resetting your password</p>
      </> }

      { !hasToken && <p>An email has been sent to reset your password</p> }
    </> }
  </main>
}
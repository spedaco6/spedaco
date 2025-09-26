import React from "react";
import { verifyAccount } from "./actions";
import RedirectTimer from "@/components/RedirectTimer";

export default async function VerifyPage({ searchParams }: 
  { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }): Promise<React.ReactElement> {
  const params = await searchParams;
  const token: string | string[] | undefined = params?.token;
  const hasToken: boolean = !!token;

  let isVerified: boolean = false;

  if (hasToken && typeof token === "string") {
    isVerified = await verifyAccount(token);
  }

  return <main>
    { hasToken && isVerified && <>
      <h1>Account verified successfully!</h1>
      <p>Thank you for verifying your account</p> 
      <RedirectTimer href="/login" />
    </> }

    { hasToken && !isVerified && <>
      <p>There was a problem verifying your account</p>
    </> }

    { !hasToken && <p>Please verify your account. An email has been sent</p> }
  </main>
}
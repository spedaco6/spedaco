"use server";
import Link from "next/link";
import React from "react";
import { verifyAccount } from "./actions";

export default async function VerifyPage({ searchParams }: 
  { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }): Promise<React.ReactElement> {
  const params = await searchParams;
  const token = params?.token;
  const hasToken = !!token;

  let isVerified: boolean = false;

  if (hasToken && typeof token === "string") {
    isVerified = await verifyAccount(token);
  }

  return <main>
    { hasToken && isVerified && <>
      <p>Thank you for verifying your account</p> 
      <Link href="/login">Go to Login</Link>
    </> }
    { hasToken && !isVerified && <>
      <p>There was a problem verifying your account</p>
    </> }
    { !hasToken && <p>Please verify your account. An email has been sent</p> }
  </main>
}
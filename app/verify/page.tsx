"use server";
import Link from "next/link";
import React from "react";

export default async function VerifyPage({ searchParams }: 
  { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }): Promise<React.ReactElement> {
  const params = await searchParams;
  const token = params?.token;
  const hasToken = token ? true : false;

  return <main>
    { hasToken && <>
      <p>Thank you for verifying your account</p> 
      <Link href="/login">Go to Login</Link>
    </> }
    { !hasToken && <p>Please verify your account. An email has been sent</p> }
  </main>
}
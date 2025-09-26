import RedirectTimer from "@/components/RedirectTimer";
import React from "react";

export default async function DevPage(): Promise<React.ReactElement> {
  return <main>
    <RedirectTimer href="/login" />
  </main>
}
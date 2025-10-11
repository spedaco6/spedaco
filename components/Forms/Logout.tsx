"use client";
import { logout } from "@/app/auth/actions";
import React from "react";

export const Logout = (): React.ReactElement => {
  return <form action={logout}>
    <button>Logout</button>
  </form>
}
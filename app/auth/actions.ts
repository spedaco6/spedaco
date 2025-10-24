"use server";

import { deleteSession } from "@/lib/sessions";
import { redirect } from "next/navigation";

export const logout = async () => {
  await deleteSession();
  return redirect("/login");
}
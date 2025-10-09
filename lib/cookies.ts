import "server-only";
import { cookies } from "next/headers";
import { encrypt } from "./sessions";
import { IUser } from "@/models/User";

export async function createSession(token: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const cookieStore = await cookies();

  cookieStore.set('session', token, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/', 
  });
};
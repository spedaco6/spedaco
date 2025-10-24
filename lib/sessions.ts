import "server-only";
import { cookies } from "next/headers";
import { DecodedToken, decrypt } from "./tokens";

export async function createSession(token: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: 'lax',
    path: '/', 
  });
};

export async function updateSession(): Promise<void> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value || "";
  const payload: DecodedToken = await decrypt(session);

  if (session && payload.error === undefined) {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    cookieStore.set('session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: expires,
      sameSite: 'lax',
      path: '/',
    });
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
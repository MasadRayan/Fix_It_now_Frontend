import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export const ACCESS_COOKIE = "fixit_access";
export const ROLE_COOKIE = "fixit_role";

export interface Session {
  token: string;
  role: string;
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24,
};

export async function getAccessToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACCESS_COOKIE)?.value ?? null;
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  const role = store.get(ROLE_COOKIE)?.value;
  if (!token || !role) return null;
  return { token, role };
}

export function setSessionCookies(
  response: NextResponse,
  token: string,
  role: string
) {
  response.cookies.set(ACCESS_COOKIE, token, cookieOptions);
  response.cookies.set(ROLE_COOKIE, role, cookieOptions);
}

export function clearSessionCookies(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  response.cookies.set(ROLE_COOKIE, "", { ...cookieOptions, maxAge: 0 });
}

export function decodeJwtRole(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8")
    ) as { role?: string };
    return decoded.role ?? null;
  } catch {
    return null;
  }
}

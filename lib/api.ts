import "server-only";
import { cookies } from "next/headers";
import type { ApiEnvelope } from "@/lib/types";
import { BACKEND_URL, TOKEN_COOKIE } from "@/lib/backend";

function decodeCookieValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function getAccessToken(): Promise<string | null> {
  const store = await cookies();
  const cookie = store.get(TOKEN_COOKIE)?.value;
  return cookie ? decodeCookieValue(cookie) : null;
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

export async function getRole(): Promise<string | null> {
  const token = await getAccessToken();
  if (!token) return null;
  return decodeJwtRole(token);
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function serverFetch<T = unknown>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const token = await getAccessToken();

  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!res.ok || !json?.success) {
    throw new ApiError(json?.message ?? res.statusText, res.status);
  }

  return json.data as T;
}

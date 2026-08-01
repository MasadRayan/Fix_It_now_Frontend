import "server-only";
import type { ApiEnvelope } from "@/lib/types";
import { getAccessToken } from "@/lib/session";

export const BACKEND_URL =
  process.env.BACKEND_URL ?? "https://fixitnow-two.vercel.app";

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

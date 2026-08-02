import { BACKEND_URL, TOKEN_COOKIE, TOKEN_KEY } from "./backend";

export { TOKEN_KEY, TOKEN_COOKIE };

export class ApiClientError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

interface Envelope<T> {
  success?: boolean;
  message?: string;
  errorDetails?: string;
  data?: T;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token);
      document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(
        token
      )}; Max-Age=2592000; Path=/; SameSite=Lax`;
    } else {
      window.localStorage.removeItem(TOKEN_KEY);
      document.cookie = `${TOKEN_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
    }
  } catch {
    // localStorage/cookies unavailable; ignore.
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const token = getToken();
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

  const json = (await res.json().catch(() => null)) as Envelope<T> | null;

  if (!res.ok || json?.success === false) {
    throw new ApiClientError(json?.message ?? res.statusText, res.status);
  }

  return json?.data as T;
}
import { NextResponse } from "next/server";
import { serverFetch } from "@/lib/api";
import { routeError } from "@/lib/http";
import { setSessionCookies, decodeJwtRole } from "@/lib/session";
import type { AuthTokens } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tokens = await serverFetch<AuthTokens>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const role = decodeJwtRole(tokens.accessToken) ?? "CUSTOMER";

    const response = NextResponse.json({ data: { role } });
    setSessionCookies(response, tokens.accessToken, role);
    return response;
  } catch (error) {
    return routeError(error);
  }
}

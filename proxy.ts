import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const roleRequired: Record<string, string> = {
  "/dashboard/technician": "TECHNICIAN",
  "/dashboard/customer": "CUSTOMER",
  "/dashboard/admin": "ADMIN",
};

function decodeJwtRole(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64.padEnd(Math.ceil(b64.length / 4) * 4, "=");
    const decoded = JSON.parse(
      Buffer.from(padded, "base64").toString("utf-8")
    ) as { role?: string };
    return decoded.role ?? null;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("accessToken")?.value;
  const role = token ? decodeJwtRole(token) : null;

  if (!role) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  for (const [prefix, required] of Object.entries(roleRequired)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      if (role !== required) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

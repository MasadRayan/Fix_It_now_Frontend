import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLE_COOKIE = "fixit_role";

const roleRequired: Record<string, string> = {
  "/dashboard/technician": "TECHNICIAN",
  "/dashboard/customer": "CUSTOMER",
  "/dashboard/admin": "ADMIN",
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const role = request.cookies.get(ROLE_COOKIE)?.value;

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

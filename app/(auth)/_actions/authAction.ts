"use server";

import jwt, { type JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface LoginState {
  success: boolean;
  message: string | null;
}

const BACKEND_URL =
  process.env.BACKEND_URL ?? "https://fixitnow-two.vercel.app";

export async function loginAction(
  redirectTo: string,
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return { success: false, message: "Email and password are required." };
  }

  const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  const result = (await res.json().catch(() => null)) as {
    success: boolean;
    statusCode: number;
    message: string;
    data?: { accessToken: string; refreshToken: string };
  } | null;

  if (!result?.success || !result.data?.accessToken) {
    return {
      success: false,
      message: result?.message ?? "Sign-in failed. Try again.",
    };
  }

  const cookieStore = await cookies();
  cookieStore.set("accessToken", result.data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  cookieStore.set("refreshToken", result.data.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  if (
    redirectTo &&
    redirectTo.startsWith("/") &&
    !redirectTo.startsWith("//")
  ) {
    redirect(redirectTo);
  }

  const decodedToken = jwt.decode(result.data.accessToken) as
    | JwtPayload
    | null;
  const role = decodedToken?.role;

  if (role === "CUSTOMER") redirect("/dashboard/customer");
  if (role === "TECHNICIAN") redirect("/dashboard/technician");
  if (role === "ADMIN") redirect("/dashboard/admin");

  redirect("/dashboard");
}

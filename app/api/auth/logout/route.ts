import { NextResponse } from "next/server";
import { clearSessionCookies } from "@/lib/session";

export async function POST() {
  const response = NextResponse.json({ data: { message: "Logged out" } });
  clearSessionCookies(response);
  return response;
}

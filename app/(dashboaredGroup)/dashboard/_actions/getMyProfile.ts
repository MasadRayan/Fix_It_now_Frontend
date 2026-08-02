"use server";

import { cookies } from "next/headers";
import type { User } from "@/lib/types";

export const getMyProfile = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const res = await fetch(`${process.env.BACKEND_URL}/api/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "force-cache",
    next: {
        revalidate: 60 * 60 * 24 *7, // 7 day
    }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch profile");
  }

  const user = await res.json()

  return user.data as User;
};

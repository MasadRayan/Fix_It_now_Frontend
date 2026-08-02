"use server";

import { cookies } from "next/headers";
import type { User } from "@/lib/types";
import { BACKEND_URL, TOKEN_COOKIE } from "@/lib/backend";

export const getMyProfile = async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get(TOKEN_COOKIE)?.value;
  let token: string | null = null;
  if (raw) {
    try {
      token = decodeURIComponent(raw);
    } catch {
      token = raw;
    }
  }

  const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
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

"use server";

import { unstable_cache } from "next/cache";
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

  return unstable_cache(
    async (accessToken: string | null) => {
      const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch profile");
      }

      const user = await res.json();

      return user.data as User;
    },
    [`my-profile-${token ?? "anonymous"}`],
    { revalidate: 60 * 60 * 24 * 7 }
  )(token);
};

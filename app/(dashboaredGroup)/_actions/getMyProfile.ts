"use server";

import { unstable_cache } from "next/cache";
import { getAccessToken, serverFetch } from "@/lib/api";
import type { User } from "@/lib/types";

export const PROFILE_CACHE_TAG = "my-profile";

export const getMyProfile = async (): Promise<User> => {
  const token = await getAccessToken();

  return unstable_cache(
    (accessToken) => serverFetch<User>("/api/auth/me", undefined, accessToken),
    [`my-profile-${token ?? "anonymous"}`],
    { revalidate: 300, tags: [PROFILE_CACHE_TAG] }
  )(token);
};
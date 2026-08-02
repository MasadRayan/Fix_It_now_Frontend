"use server";

import { unstable_cache } from "next/cache";
import { getAccessToken, serverFetch } from "@/lib/api";
import type { TechnicianListItem } from "@/lib/types";
import { getMyProfile } from "./getMyProfile";
import { TECHNICIAN_CACHE_TAG } from "./cacheTags";

export const getMyTechnician = async (): Promise<TechnicianListItem | null> => {
  const user = await getMyProfile().catch(() => null);
  const profileId = user?.technicianProfile?.id;
  if (!profileId) return null;

  const token = await getAccessToken();

  return unstable_cache(
    (accessToken) =>
      serverFetch<TechnicianListItem>(
        `/api/technician/${profileId}`,
        undefined,
        accessToken
      ),
    [`my-technician-${profileId}-${token ?? "anonymous"}`],
    { revalidate: 60, tags: [TECHNICIAN_CACHE_TAG] }
  )(token);
};
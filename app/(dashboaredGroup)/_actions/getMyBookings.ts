"use server";

import { unstable_cache } from "next/cache";
import { getAccessToken, serverFetch } from "@/lib/api";
import { BOOKINGS_CACHE_TAG } from "./cacheTags";
import type { BookingListItem } from "@/lib/types";

export const getMyBookings = async (): Promise<BookingListItem[]> => {
  const token = await getAccessToken();

  return unstable_cache(
    (accessToken) =>
      serverFetch<BookingListItem[]>("/api/bookings", undefined, accessToken),
    [`my-bookings-${token ?? "anonymous"}`],
    { revalidate: 30, tags: [BOOKINGS_CACHE_TAG] }
  )(token);
};
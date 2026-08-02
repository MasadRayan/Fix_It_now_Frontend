"use server";

import { unstable_cache } from "next/cache";
import { getAccessToken, serverFetch } from "@/lib/api";
import type { BookingListItem } from "@/lib/types";

export const getMyBookings = async (): Promise<BookingListItem[]> => {
  const token = await getAccessToken();

  return unstable_cache(
    (accessToken: string | null) =>
      serverFetch<BookingListItem[]>("/api/bookings", undefined, accessToken),
    [`my-bookings-${token ?? "anonymous"}`],
    { revalidate: 60 * 60 * 24 * 7 }
  )(token);
};

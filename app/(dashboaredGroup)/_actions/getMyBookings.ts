import { getAccessToken, serverFetch } from "@/lib/api";
import type { BookingListItem } from "@/lib/types";

export const getMyBookings = async (): Promise<BookingListItem[]> => {
  const token = await getAccessToken();
  return serverFetch<BookingListItem[]>("/api/bookings", undefined, token);
};

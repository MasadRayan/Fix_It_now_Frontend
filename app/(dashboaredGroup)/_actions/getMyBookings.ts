"use server";

import { serverFetch } from "@/lib/api";
import type { BookingListItem } from "@/lib/types";

export const getMyBookings = async (): Promise<BookingListItem[]> => {
  return serverFetch<BookingListItem[]>("/api/bookings");
};

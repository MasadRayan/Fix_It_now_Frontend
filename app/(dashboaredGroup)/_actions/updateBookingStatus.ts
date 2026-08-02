"use server";

import { z } from "zod";
import { revalidateTag } from "next/cache";
import type { UpdateBookingStatusRequest } from "@/lib/types";
import { mutateBackend, type MutationResult } from "./mutate";
import { BOOKINGS_CACHE_TAG } from "./cacheTags";

const schema = z.enum(["ACCEPTED", "DECLINED", "IN_PROGRESS", "COMPLETED"]);

export async function updateBookingStatus(
  bookingId: string,
  status: UpdateBookingStatusRequest
): Promise<MutationResult> {
  const parsed = schema.safeParse(status);

  if (!parsed.success) {
    return { success: false, message: "Invalid status transition." };
  }

  const result = await mutateBackend(`/api/bookings/status/${bookingId}`, "PATCH", {
    status: parsed.data,
  });

  if (result.success) {
    revalidateTag(BOOKINGS_CACHE_TAG, { expire: 0 });
  }

  return result;
}

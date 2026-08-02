"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { BookingListItem } from "@/lib/types";
import { CancelBookingDialog } from "./cancel-booking-dialog";

const primaryBtn =
  "inline-flex items-center justify-center rounded-sm border-2 border-ink bg-ink px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-bone transition-colors hover:bg-safety hover:text-ink disabled:pointer-events-none disabled:opacity-50";
const dangerBtn =
  "inline-flex items-center justify-center rounded-sm border-2 border-ink/70 bg-transparent px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-ink transition-colors hover:border-red-700 hover:bg-red-700 hover:text-white";

export function BookingActions({ booking }: { booking: BookingListItem }) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const { status } = booking;

  function showStub(message: string) {
    toast.info(message);
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {status === "ACCEPTED" && (
          <button
            type="button"
            className={primaryBtn}
            onClick={() => showStub("Secure checkout is coming in the next phase.")}
          >
            Pay now
          </button>
        )}

        {(status === "REQUESTED" ||
          status === "ACCEPTED" ||
          status === "PAID") && (
          <button
            type="button"
            className={dangerBtn}
            onClick={() => setCancelOpen(true)}
          >
            Cancel
          </button>
        )}

        {status === "COMPLETED" && (
          <button
            type="button"
            className={primaryBtn}
            onClick={() => showStub("Leaving a review is coming in the next phase.")}
          >
            Leave review
          </button>
        )}
      </div>

      <CancelBookingDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        bookingId={booking.id}
        serviceTitle={booking.service?.title ?? "this booking"}
      />
    </>
  );
}

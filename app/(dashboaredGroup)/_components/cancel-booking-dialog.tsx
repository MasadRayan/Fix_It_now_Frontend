"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { cancelBooking } from "../_actions/cancelBooking";

export function CancelBookingDialog({
  open,
  onClose,
  bookingId,
  serviceTitle,
}: {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  serviceTitle: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [reason, setReason] = useState("");

  function handleConfirm() {
    startTransition(async () => {
      const res = await cancelBooking(bookingId, reason);
      if (res.success) {
        toast.success(res.message);
        setReason("");
        onClose();
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  }

  return (
    <Dialog open={open} onClose={onClose} title="Cancel booking?">
      <p className="text-sm text-zinc-600">
        This will cancel{" "}
        <span className="font-semibold text-zinc-900">{serviceTitle}</span>.
        Once cancelled it can&apos;t be undone.
      </p>
      <label
        htmlFor="cancel-reason"
        className="mb-1 mt-4 block text-sm font-medium text-zinc-700"
      >
        Reason <span className="font-normal text-zinc-400">(optional)</span>
      </label>
      <textarea
        id="cancel-reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={2}
        placeholder="Changed my mind…"
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
      />
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          Keep booking
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={pending}
          className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
        >
          {pending ? "Cancelling…" : "Cancel booking"}
        </button>
      </div>
    </Dialog>
  );
}

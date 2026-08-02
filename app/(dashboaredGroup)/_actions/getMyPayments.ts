"use server";

import { unstable_cache } from "next/cache";
import { getAccessToken, serverFetch } from "@/lib/api";
import type { PaymentListItem } from "@/lib/types";

export const getMyPayments = async (): Promise<PaymentListItem[]> => {
  const token = await getAccessToken();

  return unstable_cache(
    (accessToken) =>
      serverFetch<PaymentListItem[]>("/api/payment/", undefined, accessToken),
    [`my-payments-${token ?? "anonymous"}`],
    { revalidate: 120, tags: ["my-payments"] }
  )(token);
};
"use server";

import { serverFetch } from "@/lib/api";
import type { PaymentListItem } from "@/lib/types";

export const getMyPayments = async (): Promise<PaymentListItem[]> => {
  return serverFetch<PaymentListItem[]>("/api/payment/");
};

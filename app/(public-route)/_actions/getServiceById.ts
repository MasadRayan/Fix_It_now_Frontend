"use server";

import { unstable_cache } from "next/cache";

const fetchServiceById = async (id: string) => {
  const res = await fetch(`${process.env.BACKEND_URL}/api/services/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Service not found");
  }

  return res.json();
};

export const getServiceById = unstable_cache(
  fetchServiceById,
  ["getServiceById"],
  { revalidate: 24 * 60 * 60 * 7 } // 7 days
);

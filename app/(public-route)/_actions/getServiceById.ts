import { backendFetch } from "@/lib/fetch-backend";

export const getServiceById = async (id: string) => {
  const res = await backendFetch(`${process.env.BACKEND_URL}/api/services/${id}`, {
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

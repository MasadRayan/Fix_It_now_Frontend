import { backendFetch } from "@/lib/fetch-backend";

export const getTechnicianById = async (id: string) => {
  const res = await backendFetch(
    `${process.env.BACKEND_URL}/api/technician/${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Technician not found");
  }

  return res.json();
};

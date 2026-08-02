const REVALIDATE_SECONDS = 7 * 24 * 60 * 60; // 7 days

export const getServiceById = async (id: string) => {
  const res = await fetch(`${process.env.BACKEND_URL}/api/services/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "force-cache",
    next: {
      revalidate: REVALIDATE_SECONDS,
      tags: ["public-services"],
    },
  });

  if (!res.ok) {
    throw new Error("Service not found");
  }

  return res.json();
};

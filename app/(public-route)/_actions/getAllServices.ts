"use server"

export interface GetAllServicesParams {
  search?: string;
  category?: string;
  page?: number;
}

export const getAllServices = async (filters: GetAllServicesParams = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.category) params.set("category", filters.category);
    if (filters.page && filters.page > 1) params.set("page", String(filters.page));
    const query = params.toString();

    const res = await fetch(`${process.env.BACKEND_URL}/api/services/${query ? `?${query}` : ""}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "force-cache",
        next: {
            revalidate: 24 * 60 * 60 * 7, // 7 days
        }
    });

    if (!res.ok) {
        throw new Error("Failed to fetch services");
    }

    const result = await res.json();

    return result
}

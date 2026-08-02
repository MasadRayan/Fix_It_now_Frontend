import { backendFetch } from "@/lib/fetch-backend";

const REVALIDATE_SECONDS = 7 * 24 * 60 * 60; // 7 days

export const getAllCategory = async () => {
    const res = await backendFetch(`${process.env.BACKEND_URL}/api/category`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "force-cache",
        next: {
            revalidate: REVALIDATE_SECONDS,
            tags: ["public-categories"],
        },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch categories");
    }

    const result = await res.json();

    return result
}

"use server"

export const getAllCategory = async () => {
    const res = await fetch(`${process.env.BACKEND_URL}/api/category`, {
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
        throw new Error("Failed to fetch categories");
    }

    const result = await res.json();

    return result
}
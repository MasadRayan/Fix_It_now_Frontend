"use server"

export const getAllServices = async () => {
    const res = await fetch(`${process.env.BACKEND_URL}/api/services/`, {
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

"use server"

export const getAllServices = async () => {
    const res = await fetch(`${process.env.BACKEND_URL}/api/services/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch services");
    }

    const result = await res.json();

    return result
}

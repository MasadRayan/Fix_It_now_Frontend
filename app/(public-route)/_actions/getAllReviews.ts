"use server"

export const getAllReviews = async () => {
    const res = await fetch(`${process.env.BACKEND_URL}/api/review`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch reviews");
    }

    const result = await res.json();

    console.log(result)
    return result
}
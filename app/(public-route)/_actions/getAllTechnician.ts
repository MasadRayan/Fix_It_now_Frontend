"use server"

import { unstable_cache } from "next/cache";

const fetchTechnicians = async () => {
    const res = await fetch(`${process.env.BACKEND_URL}/api/technician`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch technicians");
    }

    return res.json();
}

export const getAllTechnician = async () =>
    unstable_cache(
        fetchTechnicians,
        ["getAllTechnician"],
        { revalidate: 24 * 60 * 60 * 7 } // 7 days
    )();

"use server";

import { serverFetch } from "@/lib/api";
import type { Category } from "@/lib/types";

export const getCategories = async (): Promise<Category[]> => {
  return serverFetch<Category[]>("/api/category/").catch(() => []);
};

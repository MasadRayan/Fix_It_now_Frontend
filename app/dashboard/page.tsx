import { redirect } from "next/navigation";
import { getRole } from "@/lib/session";

export default async function DashboardIndex() {
  const role = await getRole();

  if (role === "CUSTOMER") return redirect("/dashboard/customer");
  if (role === "TECHNICIAN") return redirect("/dashboard/technician");
  if (role === "ADMIN") return redirect("/dashboard/admin");

  return redirect("/login");
}

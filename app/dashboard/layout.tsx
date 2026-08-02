import { redirect } from "next/navigation";
import { getRole } from "@/lib/api";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = await getRole();

  if (!role) {
    redirect("/login");
  }

  return <DashboardShell role={role}>{children}</DashboardShell>;
}

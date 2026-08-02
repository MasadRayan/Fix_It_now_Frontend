"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { clientFetch } from "@/lib/client-fetch";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

const navByRole: Record<string, Array<{ href: string; label: string }>> = {
  CUSTOMER: [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/bookings", label: "My Bookings" },
    { href: "/dashboard/payments", label: "Payments" },
  ],
  TECHNICIAN: [
    { href: "/technician-dashboard", label: "Overview" },
    { href: "/technician-dashboard/profile", label: "Profile" },
    { href: "/technician-dashboard/availability", label: "Availability" },
    { href: "/technician-dashboard/services", label: "Services" },
    { href: "/technician-dashboard/bookings", label: "Bookings" },
  ],
  ADMIN: [
    { href: "/admin-dashboard", label: "Overview" },
    { href: "/admin-dashboard/users", label: "Users" },
    { href: "/admin-dashboard/bookings", label: "Bookings" },
    { href: "/admin-dashboard/categories", label: "Categories" },
  ],
};

export function DashboardShell({
  children,
  role,
}: {
  children: React.ReactNode;
  role: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => clientFetch<User>("/api/auth/me"),
  });

  const links = navByRole[role] ?? navByRole.CUSTOMER;

  async function handleLogout() {
    await clientFetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out");
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold tracking-tight">
            FixItNow
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500">
              {user?.name ?? "…"}
            </span>
            <button
              onClick={handleLogout}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
            >
              Log out
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium",
                  active
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}

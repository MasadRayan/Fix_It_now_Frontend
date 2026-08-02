"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { clientFetch } from "@/lib/client-fetch";
import type { User } from "@/lib/types";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function DashboardShell({
  role,
  children,
}: {
  role: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => clientFetch<User>("/api/auth/me"),
  });

  return (
    <div className="flex min-h-dvh bg-ticket-hi">
      <Sidebar
        role={role}
        user={user}
        mobileOpen={open}
        onClose={() => setOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar role={role} user={user} onMenu={() => setOpen(true)} />
        <main className="flex-1 bg-[repeating-linear-gradient(0deg,rgba(33,30,25,0.04)_0px,rgba(33,30,25,0.04)_1px,transparent_1px,transparent_32px)]">
          <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

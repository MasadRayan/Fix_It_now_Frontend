"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import type {
  AdminUserListItem,
  PaginationMeta,
  Role,
  UserStatus,
} from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Pagination } from "./pagination";
import { UserStatusStamp } from "./user-status-stamp";
import { BanUserDialog } from "./ban-user-dialog";
import { EmptyState } from "./empty-state";

const labelCls =
  "font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-steel";
const fieldCls =
  "mt-1.5 w-full rounded-[2px] border-2 border-ink/30 bg-ticket px-3 py-2 font-mono text-sm text-ink placeholder:text-ink/30 focus:border-safety focus:outline-none";
const selectCls =
  "mt-1.5 rounded-[2px] border-2 border-ink/30 bg-ticket px-3 py-2 font-mono text-sm text-ink focus:border-safety focus:outline-none";

const ROSTER_COLS =
  "lg:grid-cols-[4.5rem_minmax(0,1.4fr)_minmax(0,12rem)_6.5rem_8rem_minmax(0,9rem)_6.5rem_5rem]";

function makeHref(search: string, role?: string, status?: string, page?: number) {
  const q = new URLSearchParams();
  if (search) q.set("search", search);
  if (role) q.set("role", role);
  if (status) q.set("status", status);
  if (page && page > 1) q.set("page", String(page));
  const qs = q.toString();
  return qs ? `/admin-dashboard/users?${qs}` : "/admin-dashboard/users";
}

function FilterTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-[2px] border border-ink/40 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-ink/70">
      {children}
    </span>
  );
}

export function UsersBoard({
  users,
  meta,
  search,
  role,
  status,
}: {
  users: AdminUserListItem[];
  meta: PaginationMeta;
  search: string;
  role?: Role;
  status?: UserStatus;
}) {
  const [banTarget, setBanTarget] = useState<AdminUserListItem | null>(null);
  const hasFilters = Boolean(search || role || status);

  return (
    <div className="space-y-6 animate-ticket">
      <header className="space-y-1">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-safety">
          Operations · personnel roster
        </p>
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink">
          Users
        </h2>
        <p className="text-sm text-steel">
          Everyone on file — customers and technicians, service stats included.
          Ban to lock an account.
        </p>
      </header>

      <form
        action="/admin-dashboard/users"
        method="get"
        className="border-2 border-ink bg-bone p-4 shadow-[4px_4px_0_rgba(33,30,25,0.1)]"
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1 basis-52">
            <label htmlFor="admin-users-search" className={labelCls}>
              Find
            </label>
            <input
              id="admin-users-search"
              name="search"
              type="search"
              defaultValue={search}
              placeholder="Name or email…"
              className={fieldCls}
            />
          </div>
          <div>
            <label htmlFor="admin-users-role" className={labelCls}>
              Role
            </label>
            <select
              id="admin-users-role"
              name="role"
              defaultValue={role ?? ""}
              className={selectCls}
            >
              <option value="">All roles</option>
              <option value="CUSTOMER">Customer</option>
              <option value="TECHNICIAN">Technician</option>
            </select>
          </div>
          <div>
            <label htmlFor="admin-users-status" className={labelCls}>
              Status
            </label>
            <select
              id="admin-users-status"
              name="status"
              defaultValue={status ?? ""}
              className={selectCls}
            >
              <option value="">Any status</option>
              <option value="ACTIVE">Active</option>
              <option value="BANNED">Banned</option>
            </select>
          </div>
          <button
            type="submit"
            className="h-10 rounded-[2px] border-2 border-ink bg-ink px-4 font-mono text-xs font-bold uppercase tracking-widest text-bone transition-colors hover:bg-safety hover:text-ink"
          >
            Apply
          </button>
          {hasFilters && (
            <a
              href="/admin-dashboard/users"
              className="h-10 rounded-[2px] border-2 border-safety px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest text-safety transition-colors hover:bg-safety hover:text-ink"
            >
              Clear
            </a>
          )}
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-steel">
        <span>
          {"// "}
          {meta.total} record{meta.total === 1 ? "" : "s"} on file
        </span>
        {search && <FilterTag>find “{search}”</FilterTag>}
        {role && <FilterTag>role {role}</FilterTag>}
        {status && <FilterTag>status {status}</FilterTag>}
      </div>

      {users.length > 0 ? (
        <div className="overflow-hidden rounded-md border-2 border-ink bg-bone shadow-[4px_4px_0_rgba(33,30,25,0.1)]">
          <div
            className={`hidden gap-x-4 border-b-2 border-ink bg-board px-5 py-2.5 lg:grid ${ROSTER_COLS}`}
          >
            {["REC", "Person", "Contact", "Base", "Role", "Stats", "Status", "Action"].map(
              (label) => (
                <span
                  key={label}
                  className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-ticket/55"
                >
                  {label}
                </span>
              )
            )}
          </div>

          <ul className="divide-y divide-dashed divide-ink/15">
            {users.map((user) => {
              const profile = user.technicianProfile;
              const initial =
                user.name?.trim().charAt(0).toUpperCase() ?? user.role.charAt(0);

              return (
                <li
                  key={user.id}
                  className={`grid items-start gap-x-4 gap-y-2.5 px-4 py-4 transition-colors hover:bg-ticket/30 sm:px-5 lg:items-center ${ROSTER_COLS}`}
                >
                  <span className="hidden font-mono text-[10px] text-steel/60 lg:col-start-1 lg:block">
                    #{user.id.slice(0, 6).toUpperCase()}
                  </span>

                  <div className="flex min-w-0 items-center gap-3 lg:col-start-2">
                    {user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.avatarUrl}
                        alt=""
                        className="size-10 shrink-0 rounded-[3px] border-2 border-ink/25 object-cover"
                      />
                    ) : (
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-[3px] border-2 border-ink/25 bg-ticket font-display text-sm font-bold text-ink shadow-[inset_0_-2px_0_rgba(33,30,25,0.12)]">
                        {initial}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-display text-[15px] font-bold text-ink">
                        {user.name}
                      </p>
                      <p className="truncate font-mono text-[11px] text-steel">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="col-start-2 min-w-0 font-mono text-[11px] lg:col-start-7">
                    <UserStatusStamp status={user.status} />
                  </div>

                  <div className="col-span-2 min-w-0 font-mono text-[11px] lg:col-span-1 lg:col-start-3">
                    <p className="truncate text-ink">{user.phone || "—"}</p>
                    <p className="truncate text-steel/70">
                      {user.address || "No address on file"}
                    </p>
                  </div>

                  <span className="font-mono text-[11px] text-steel lg:col-start-4">
                    {profile?.location ?? "—"}
                  </span>

                  <span className="w-fit rounded-[2px] border-2 border-ink/50 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-ink lg:col-start-5">
                    {user.role}
                  </span>

                  {profile ? (
                    <div className="col-span-2 font-mono text-[11px] leading-snug lg:col-span-1 lg:col-start-6">
                      <p className="flex items-center gap-1 text-ink">
                        <Star
                          className="size-3 fill-safety text-safety"
                          aria-hidden
                        />
                        {profile.avgRating ? profile.avgRating.toFixed(1) : "—"}
                        <span className="text-steel/70">
                          · {profile.totalReviews} rev
                        </span>
                      </p>
                      <p className="text-ink/70">
                        {profile.isVerified ? "✓ VERIFIED" : "✗ NOT VERIFIED"}
                      </p>
                    </div>
                  ) : (
                    <div className="col-span-2 font-mono text-[11px] lg:col-span-1 lg:col-start-6">
                      <p className="text-steel">Since {formatDate(user.createdAt)}</p>
                    </div>
                  )}

                  <div className="col-span-2 flex justify-end lg:col-span-1 lg:col-start-8 lg:justify-start">
                    <button
                      type="button"
                      onClick={() => setBanTarget(user)}
                      className={
                        user.status === "ACTIVE"
                          ? "w-fit rounded-[2px] border-2 border-ink/70 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-ink transition-colors hover:border-red-700 hover:bg-red-700 hover:text-white"
                          : "w-fit rounded-[2px] border-2 border-green-700/70 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-green-700 transition-colors hover:bg-green-700 hover:text-white"
                      }
                    >
                      {user.status === "ACTIVE" ? "Ban" : "Unban"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <EmptyState
          title="No records match."
          description="Nothing on the roster for that search. Try another name, role, or status."
          actionHref="/admin-dashboard/users"
          actionLabel="Clear filters"
        />
      )}

      <Pagination
        currentPage={meta.page}
        totalPages={meta.totalPages}
        makeHref={(page) => makeHref(search, role, status, page)}
      />

      {banTarget && (
        <BanUserDialog
          user={banTarget}
          open={true}
          onClose={() => setBanTarget(null)}
        />
      )}
    </div>
  );
}

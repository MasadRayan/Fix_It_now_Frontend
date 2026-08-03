import type { Role, UserStatus } from "@/lib/types";
import { getAdminUsers } from "../../_actions/getAdminUsers";
import { UsersBoard } from "../../_components/users-board";

interface AdminUsersSearchParams {
  [key: string]: string | string[] | undefined;
}

const ROLES: Role[] = ["CUSTOMER", "TECHNICIAN"];
const STATUSES: UserStatus[] = ["ACTIVE", "BANNED"];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<AdminUsersSearchParams>;
}) {
  const sp = await searchParams;

  const search = typeof sp.search === "string" ? sp.search : "";
  const role = ROLES.includes(sp.role as Role)
    ? (sp.role as Role)
    : undefined;
  const status = STATUSES.includes(sp.status as UserStatus)
    ? (sp.status as UserStatus)
    : undefined;
  const page = Math.max(1, Number(typeof sp.page === "string" ? sp.page : "1") || 1);

  const { data, meta } = await getAdminUsers({
    role,
    status,
    search: search || undefined,
    page,
    limit: 25,
  }).catch(() => ({
    data: [],
    meta: { page: 1, limit: 25, total: 0, totalPages: 0 },
  }));

  return (
    <UsersBoard
      users={data}
      meta={meta}
      search={search}
      role={role}
      status={status}
    />
  );
}

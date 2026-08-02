import type { User } from "@/lib/types";
import { RecordCard } from "../../_components/profile/record-card";
import { RecordError } from "../../_components/profile/record-error";
import { getMyProfile } from "../../_actions/getMyProfile";

async function loadProfile(): Promise<User | null> {
  try {
    return await getMyProfile();
  } catch {
    return null;
  }
}

export default async function UserProfilePage() {
  const user = await loadProfile();

  if (!user) {
    return <RecordError />;
  }

  return <RecordCard user={user} />;
}

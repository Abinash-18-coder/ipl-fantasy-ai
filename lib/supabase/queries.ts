import { createClient } from "@/lib/supabase/server";
import type { FranchiseRow, UserProfileRow } from "@/types";

export interface RlsSecuritySnapshot {
  isAuthenticated: boolean;
  profile: UserProfileRow | null;
  franchises: FranchiseRow[];
  rlsVerifiedAtUtc: string;
}

export async function getMemberRlsSnapshot(): Promise<RlsSecuritySnapshot> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: franchiseData } = await supabase
    .from("franchises")
    .select("*")
    .order("code", { ascending: true });

  const franchises = (franchiseData ?? []) as FranchiseRow[];

  if (!user) {
    return {
      isAuthenticated: false,
      profile: null,
      franchises,
      rlsVerifiedAtUtc: new Date().toISOString(),
    };
  }

  const { data: existingProfile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfile) {
    return {
      isAuthenticated: true,
      profile: existingProfile as UserProfileRow,
      franchises,
      rlsVerifiedAtUtc: new Date().toISOString(),
    };
  }

  const fallbackName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : user.email?.split("@")[0] ?? "Member";

  const fallbackAvatar =
    typeof user.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : null;

  const { data: createdProfile } = await supabase
    .from("users")
    .upsert(
      {
        id: user.id,
        email: user.email ?? "",
        full_name: fallbackName,
        avatar_url: fallbackAvatar,
      },
      { onConflict: "id" }
    )
    .select("*")
    .maybeSingle();

  return {
    isAuthenticated: true,
    profile: (createdProfile as UserProfileRow | null) ?? null,
    franchises,
    rlsVerifiedAtUtc: new Date().toISOString(),
  };
}
import { createClient } from "@supabase/supabase-js";

export interface EdgeSyncResponse {
  ok: boolean;
  active_live_matches: number;
  synced_match_ids: string[];
  executed_at_utc: string;
}

export async function handleLiveScoreEdgeSync(
  supabaseUrl: string,
  serviceRoleKey: string,
  appBaseUrl: string
): Promise<EdgeSyncResponse> {
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: liveMatches } = await supabase
    .from("matches")
    .select("id, external_match_id, status")
    .in("status", ["LIVE", "TOSS_COMPLETED"]);

  const activeList = liveMatches ?? [];

  if (activeList.length === 0) {
    return {
      ok: true,
      active_live_matches: 0,
      synced_match_ids: [],
      executed_at_utc: new Date().toISOString(),
    };
  }

  const syncedIds: string[] = [];

  for (const match of activeList) {
    const extId = String(match.external_match_id ?? "ipl-sim-match-42");
    try {
      const response = await fetch(`${appBaseUrl}/api/scores/live`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ matchId: extId }),
      });

      if (response.ok) {
        syncedIds.push(extId);
      }
    } catch {
      continue;
    }
  }

  return {
    ok: true,
    active_live_matches: activeList.length,
    synced_match_ids: syncedIds,
    executed_at_utc: new Date().toISOString(),
  };
}
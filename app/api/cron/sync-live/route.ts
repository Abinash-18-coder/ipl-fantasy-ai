import { NextResponse, type NextRequest } from "next/server";
import { syncAndGetLiveMatchScorecard } from "@/lib/cricket/liveScoreSync";
import { getServerEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/server";

export interface CronSyncLiveSummary {
  ok: boolean;
  mode: "SMART_SLEEP" | "ACTIVE_SYNC";
  active_matches_found: number;
  synced_match_ids: string[];
  duration_ms: number;
  executed_at_utc: string;
}

async function executeSmartCronSync(
  simulateLive: boolean
): Promise<CronSyncLiveSummary> {
  const startMs = Date.now();
  const env = getServerEnv();

  const isPlaceholderSupabase =
    env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-project.supabase.co") ||
    env.SUPABASE_SERVICE_ROLE_KEY.includes("placeholder-service-role-key");

  const targetMatchIds: string[] = [];

  if (!isPlaceholderSupabase) {
    try {
      const supabaseAdmin = createAdminClient();
      const { data: activeRows } = await supabaseAdmin
        .from("matches")
        .select("external_match_id, status")
        .in("status", ["LIVE", "TOSS_COMPLETED"]);

      for (const row of activeRows ?? []) {
        if (typeof row.external_match_id === "string" && row.external_match_id) {
          targetMatchIds.push(row.external_match_id);
        }
      }
    } catch {
      targetMatchIds.length = 0;
    }
  }

  if (targetMatchIds.length === 0 && simulateLive) {
    targetMatchIds.push("ipl-sim-match-42");
  }

  if (targetMatchIds.length === 0) {
    return {
      ok: true,
      mode: "SMART_SLEEP",
      active_matches_found: 0,
      synced_match_ids: [],
      duration_ms: Date.now() - startMs,
      executed_at_utc: new Date().toISOString(),
    };
  }

  const syncedIds: string[] = [];

  for (const extId of targetMatchIds) {
    try {
      const syncRes = await syncAndGetLiveMatchScorecard(extId, true);
      if (syncRes.ok) {
        syncedIds.push(syncRes.match_id);
      }
    } catch {
      continue;
    }
  }

  return {
    ok: true,
    mode: "ACTIVE_SYNC",
    active_matches_found: targetMatchIds.length,
    synced_match_ids: syncedIds,
    duration_ms: Date.now() - startMs,
    executed_at_utc: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const simulateLive = searchParams.get("simulate") === "true";

  const summary = await executeSmartCronSync(simulateLive);

  return NextResponse.json(summary, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "X-CricIntel-Cron-Mode": summary.mode,
    },
  });
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const simulateLive = searchParams.get("simulate") === "true";

  const summary = await executeSmartCronSync(simulateLive);

  return NextResponse.json(summary, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "X-CricIntel-Cron-Mode": summary.mode,
    },
  });
}
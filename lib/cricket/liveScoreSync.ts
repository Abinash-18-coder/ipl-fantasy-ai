import {
  getCachedMatchScorecard,
  invalidateCricketCacheKey,
} from "@/lib/cache/redis";
import { getServerEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/server";
import type {
  CacheBackendMode,
  CacheShieldStatus,
  CricketDataSource,
  NormalizedMatchScorecard,
} from "@/types";

export interface LiveScoreSyncResult {
  ok: boolean;
  match_id: string;
  source: CricketDataSource;
  cache_status: CacheShieldStatus;
  cache_backend: CacheBackendMode;
  ttl_seconds: number;
  latency_ms: number;
  synced_with_supabase: boolean;
  scorecard: NormalizedMatchScorecard;
}

export async function syncAndGetLiveMatchScorecard(
  matchId: string,
  forceRefresh: boolean = false
): Promise<LiveScoreSyncResult> {
  const safeMatchId = (matchId || "ipl-sim-match-42").trim().toLowerCase();

  if (forceRefresh) {
    await invalidateCricketCacheKey(`cricintel:scorecard:${safeMatchId}:v1`);
  }

  const cachedEnvelope = await getCachedMatchScorecard(safeMatchId);
  const scorecard = cachedEnvelope.data;
  const firstInnings = scorecard.innings[0];
  const secondInnings = scorecard.innings[1];

  const env = getServerEnv();
  const isPlaceholderSupabase =
    env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-project.supabase.co") ||
    env.SUPABASE_SERVICE_ROLE_KEY.includes("placeholder-service-role-key");

  let syncedWithSupabase = false;

  if (!isPlaceholderSupabase) {
    try {
      const supabaseAdmin = createAdminClient();

      const liveSummaryPayload = {
        home_runs: firstInnings?.total_runs ?? 0,
        home_wickets: firstInnings?.total_wickets ?? 0,
        home_overs: firstInnings?.overs_completed ?? 0,
        away_runs: secondInnings?.total_runs ?? 0,
        away_wickets: secondInnings?.total_wickets ?? 0,
        away_overs: secondInnings?.overs_completed ?? 0,
        crr: scorecard.fixture.crr,
        rrr: scorecard.fixture.rrr,
        win_probability_home: scorecard.fixture.win_probability_home,
        status_note: scorecard.fixture.status_note,
      };

      const { error } = await supabaseAdmin
        .from("matches")
        .update({
          status: scorecard.fixture.status,
          live_score_summary: liveSummaryPayload,
        })
        .eq("external_match_id", scorecard.external_match_id);

      if (!error) {
        syncedWithSupabase = true;
      }
    } catch {
      syncedWithSupabase = false;
    }
  }

  return {
    ok: true,
    match_id: scorecard.external_match_id,
    source: cachedEnvelope.source,
    cache_status: cachedEnvelope.cache_status,
    cache_backend: cachedEnvelope.cache_backend,
    ttl_seconds: cachedEnvelope.ttl_seconds,
    latency_ms: cachedEnvelope.latency_ms,
    synced_with_supabase: syncedWithSupabase,
    scorecard,
  };
}
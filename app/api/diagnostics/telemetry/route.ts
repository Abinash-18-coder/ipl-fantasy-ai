import { NextResponse } from "next/server";
import {
  getCachedMatchScorecard,
  getCachedRollingMatches,
} from "@/lib/cache/redis";
import { getServerEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/server";

export interface CronAuditRow {
  id: string;
  execution_mode: "SMART_SLEEP" | "ACTIVE_DISPATCH";
  active_match_count: number;
  request_id: number | null;
  target_url: string | null;
  executed_at: string;
}

export interface TelemetryDiagnosticsResponse {
  ok: boolean;
  checked_at_utc: string;
  total_check_latency_ms: number;
  cache_shield: {
    backend: string;
    rolling_fixtures_status: string;
    live_scorecard_status: string;
    live_scorecard_ttl_seconds: number;
    scorecard_data_source: string;
  };
  database_counts: {
    connected: boolean;
    stadiums: number;
    franchises: number;
    players: number;
    matches: number;
  };
  cron_smart_sleep: {
    audit_table_ready: boolean;
    recent_logs: CronAuditRow[];
  };
}

export async function GET() {
  const startMs = Date.now();
  const env = getServerEnv();

  const [rollingEnvelope, scorecardEnvelope] = await Promise.all([
    getCachedRollingMatches(),
    getCachedMatchScorecard("ipl-sim-match-42"),
  ]);

  const isPlaceholderSupabase =
    env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-project.supabase.co") ||
    env.SUPABASE_SERVICE_ROLE_KEY.includes("placeholder-service-role-key");

  let dbConnected = false;
  let stadiumsCount = 0;
  let franchisesCount = 0;
  let playersCount = 0;
  let matchesCount = 0;
  let auditTableReady = false;
  let recentLogs: CronAuditRow[] = [];

  if (!isPlaceholderSupabase) {
    try {
      const supabaseAdmin = createAdminClient();

      const [
        stadiumsRes,
        franchisesRes,
        playersRes,
        matchesRes,
        cronAuditRes,
      ] = await Promise.all([
        supabaseAdmin
          .from("stadiums")
          .select("id", { count: "exact", head: true }),
        supabaseAdmin
          .from("franchises")
          .select("id", { count: "exact", head: true }),
        supabaseAdmin
          .from("players")
          .select("id", { count: "exact", head: true }),
        supabaseAdmin
          .from("matches")
          .select("id", { count: "exact", head: true }),
        supabaseAdmin
          .from("cron_sync_audit_log")
          .select(
            "id, execution_mode, active_match_count, request_id, target_url, executed_at"
          )
          .order("executed_at", { ascending: false })
          .limit(5),
      ]);

      dbConnected = !stadiumsRes.error;
      stadiumsCount = stadiumsRes.count ?? 0;
      franchisesCount = franchisesRes.count ?? 0;
      playersCount = playersRes.count ?? 0;
      matchesCount = matchesRes.count ?? 0;

      if (!cronAuditRes.error && Array.isArray(cronAuditRes.data)) {
        auditTableReady = true;
        recentLogs = cronAuditRes.data as CronAuditRow[];
      }
    } catch {
      dbConnected = false;
    }
  }

  const payload: TelemetryDiagnosticsResponse = {
    ok: true,
    checked_at_utc: new Date().toISOString(),
    total_check_latency_ms: Date.now() - startMs,
    cache_shield: {
      backend: scorecardEnvelope.cache_backend,
      rolling_fixtures_status: rollingEnvelope.cache_status,
      live_scorecard_status: scorecardEnvelope.cache_status,
      live_scorecard_ttl_seconds: scorecardEnvelope.ttl_seconds,
      scorecard_data_source: scorecardEnvelope.source,
    },
    database_counts: {
      connected: dbConnected,
      stadiums: stadiumsCount,
      franchises: franchisesCount,
      players: playersCount,
      matches: matchesCount,
    },
    cron_smart_sleep: {
      audit_table_ready: auditTableReady,
      recent_logs: recentLogs,
    },
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "X-CricIntel-Diagnostics": "week-3-verified",
    },
  });
}
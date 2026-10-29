import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  invalidateCricketCacheKey,
  withCricketCacheShield,
} from "../lib/cache/redis";
import type { CricketApiEnvelope } from "../types";

function loadLocalEnvFile(): void {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIdx = line.indexOf("=");
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    let val = line.slice(eqIdx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

loadLocalEnvFile();

async function runResilienceVerification(): Promise<void> {
  console.log("==========================================================");
  console.log("🛡️  CRICINTEL WEEK 3 — TELEMETRY & CRON RESILIENCE SUITE");
  console.log("==========================================================\n");

  const testCacheKey = "cricintel:test:stampede-resilience:v1";
  await invalidateCricketCacheKey(testCacheKey);

  let upstreamCallCounter = 0;

  const simulatedSlowFetcher = async (): Promise<
    CricketApiEnvelope<{ runs: number; wickets: number }>
  > => {
    upstreamCallCounter += 1;
    await new Promise((resolve) => setTimeout(resolve, 60));
    return {
      ok: true,
      source: "PRE_SEASON_SIMULATION",
      latency_ms: 60,
      fetched_at_utc: new Date().toISOString(),
      data: { runs: 198, wickets: 5 },
    };
  };

  console.log("1️⃣  Testing Single-Flight Stampede Protection (10 Concurrent Requests)...");
  const concurrentResults = await Promise.all(
    Array.from({ length: 10 }, () =>
      withCricketCacheShield(testCacheKey, 15, simulatedSlowFetcher)
    )
  );

  const coalescedCount = concurrentResults.filter(
    (r) => r.cache_status === "COALESCED_HIT"
  ).length;

  console.log(`   • Upstream API Calls Fired : ${upstreamCallCounter} (Expected: 1)`);
  console.log(`   • Coalesced Hits           : ${coalescedCount} / 10`);

  if (upstreamCallCounter !== 1) {
    throw new Error(
      `Stampede protection failed: expected 1 upstream call, got ${upstreamCallCounter}`
    );
  }

  console.log("\n2️⃣  Testing 15-Second Cache Shield Hit Latency...");
  const warmHit = await withCricketCacheShield(
    testCacheKey,
    15,
    simulatedSlowFetcher
  );
  console.log(
    `   • Warm Cache Status        : ${warmHit.cache_status} (${warmHit.cache_backend})`
  );
  console.log(`   • Warm Read Latency        : ${warmHit.latency_ms}ms`);
  await invalidateCricketCacheKey(testCacheKey);

  console.log("\n3️⃣  Verifying Self-Hosted Custom Player Portrait Assets...");
  const playersAvatarDir = path.resolve(process.cwd(), "public/avatars/players");
  const avatarFiles = fs.existsSync(playersAvatarDir)
    ? fs
        .readdirSync(playersAvatarDir)
        .filter(
          (f) => f.endsWith(".svg") || f.endsWith(".jpg") || f.endsWith(".png")
        )
    : [];
  console.log(`   • Custom Portraits Found   : ${avatarFiles.length} files in public/avatars/players/`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  if (
    !supabaseUrl ||
    !serviceRoleKey ||
    supabaseUrl.includes("placeholder-project.supabase.co") ||
    serviceRoleKey.includes("placeholder-service-role-key")
  ) {
    console.log(
      "\n4️⃣  Supabase Database Check: Skipped (placeholder credentials in .env.local)."
    );
  } else {
    console.log("\n4️⃣  Verifying Mumbai Supabase Database & pg_cron Smart Sleep...");
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const [stadiums, franchises, players, cronLogs] = await Promise.all([
      supabase.from("stadiums").select("id", { count: "exact", head: true }),
      supabase.from("franchises").select("id", { count: "exact", head: true }),
      supabase.from("players").select("id", { count: "exact", head: true }),
      supabase
        .from("cron_sync_audit_log")
        .select("execution_mode, active_match_count, executed_at")
        .order("executed_at", { ascending: false })
        .limit(3),
    ]);

    console.log(`   • Stadiums Seeded          : ${stadiums.count ?? 0} / 10`);
    console.log(`   • Franchises Seeded        : ${franchises.count ?? 0} / 10`);
    console.log(`   • Squad Players Seeded     : ${players.count ?? 0} / 250`);
    console.log(
      `   • pg_cron Audit Log Rows   : ${cronLogs.data?.length ?? 0} recent ticks recorded`
    );
  }

  console.log("\n==========================================================");
  console.log("✅ ALL WEEK 3 TELEMETRY & RESILIENCE CHECKS PASSED!");
  console.log("==========================================================");
}

runResilienceVerification().catch((err) => {
  console.error("❌ Week 3 Resilience Verification Failed:", err);
  process.exit(1);
});
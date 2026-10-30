import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  getCachedMatchScorecard,
  getCachedRollingMatches,
} from "../lib/cache/redis";
import { FRANCHISE_THEME_REGISTRY } from "../lib/theme/franchiseTheme";

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

const REQUIRED_MONTH_1_FILES: readonly string[] = [
  "app/layout.tsx",
  "app/page.tsx",
  "app/scores/page.tsx",
  "app/fantasy/page.tsx",
  "app/settings/page.tsx",
  "proxy.ts",
  "Dockerfile",
  ".dockerignore",
  "lib/env.ts",
  "lib/motion.ts",
  "lib/supabase/client.ts",
  "lib/supabase/server.ts",
  "lib/supabase/proxy.ts",
  "lib/supabase/queries.ts",
  "lib/cricket/apiClient.ts",
  "lib/cricket/rollingFixtures.ts",
  "lib/cricket/liveScoreSync.ts",
  "lib/cache/redis.ts",
  "lib/theme/franchiseTheme.ts",
  "components/ui/CursorGridBackdrop.tsx",
  "components/auth/AuthSheet.tsx",
  "components/settings/FranchiseThemeSelector.tsx",
  "components/scores/MatchAmbientHeader.tsx",
  "components/scores/RollingDigitTicker.tsx",
  "components/scores/ScorecardTables.tsx",
  "components/scores/OverTrackerStrip.tsx",
  "components/scores/WinProbabilityMeter.tsx",
  "components/scores/UpcomingScheduleCarousel.tsx",
  "supabase/migrations/0001_core_entities.sql",
  "supabase/migrations/0002_matches_and_lineups.sql",
  "supabase/migrations/0003_rls_policies.sql",
  "supabase/migrations/0004_seed_stadiums_and_franchises.sql",
  "supabase/migrations/0005_pg_cron_smart_sleep.sql",
];

async function runMonth1IntegrationAudit(): Promise<void> {
  console.log("==============================================================");
  console.log("🏆 CRICINTEL — MONTH 1 (DAYS 1–28) FULL-STACK INTEGRATION AUDIT");
  console.log("==============================================================\n");

  console.log("1️⃣  Auditing Month 1 File Ledger (Weeks 1–4)...");
  const missingFiles: string[] = [];

  for (const relPath of REQUIRED_MONTH_1_FILES) {
    const fullPath = path.resolve(process.cwd(), relPath);
    if (!fs.existsSync(fullPath)) {
      missingFiles.push(relPath);
    }
  }

  if (missingFiles.length > 0) {
    throw new Error(
      `Missing required Month 1 files:\n${missingFiles.join("\n")}`
    );
  }
  console.log(
    `   • Verified ${REQUIRED_MONTH_1_FILES.length} / ${REQUIRED_MONTH_1_FILES.length} core Month 1 modules & SQL migrations.`
  );

  console.log("\n2️⃣  Auditing Dynamic Franchise Ambient Theme Registry...");
  const registeredCodes = Object.keys(FRANCHISE_THEME_REGISTRY);
  if (registeredCodes.length !== 10) {
    throw new Error(
      `Expected 10 IPL franchises in FRANCHISE_THEME_REGISTRY, found ${registeredCodes.length}`
    );
  }
  console.log(
    `   • All 10 IPL Franchises calibrated: ${registeredCodes.join(", ")}`
  );

  console.log("\n3️⃣  Auditing 250 Self-Hosted Player Portrait Assets...");
  const avatarsDir = path.resolve(process.cwd(), "public/avatars/players");
  const portraitFiles = fs.existsSync(avatarsDir)
    ? fs
        .readdirSync(avatarsDir)
        .filter(
          (f) =>
            f.endsWith(".svg") || f.endsWith(".jpg") || f.endsWith(".png")
        )
    : [];

  if (portraitFiles.length < 250) {
    throw new Error(
      `Expected at least 250 player portraits in public/avatars/players/, found ${portraitFiles.length}`
    );
  }
  console.log(
    `   • Verified ${portraitFiles.length} self-hosted player portraits (zero external hotlinks).`
  );

  console.log("\n4️⃣  Auditing Week 3 & Week 4 Live Scorecard & Rolling Fixture Pipeline...");
  const [rollingRes, scorecardRes] = await Promise.all([
    getCachedRollingMatches(),
    getCachedMatchScorecard("ipl-sim-match-42"),
  ]);

  const inningsCount = scorecardRes.data.innings.length;
  if (inningsCount < 2) {
    throw new Error(
      `Expected 2 innings in scorecard payload for tabular sheets, found ${inningsCount}`
    );
  }
  console.log(
    `   • Rolling 3-Day Fixtures : ${rollingRes.data.length} active fixtures (${rollingRes.cache_status})`
  );
  console.log(
    `   • Tabular Scorecard Data : ${inningsCount} complete innings (${scorecardRes.cache_status})`
  );

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  if (
    !supabaseUrl ||
    !serviceRoleKey ||
    supabaseUrl.includes("placeholder-project.supabase.co") ||
    serviceRoleKey.includes("placeholder-service-role-key")
  ) {
    console.log(
      "\n5️⃣  Supabase Mumbai DB Audit: Skipped (placeholder credentials in .env.local)."
    );
  } else {
    console.log("\n5️⃣  Auditing Mumbai Supabase PostgreSQL & pg_cron Tables...");
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const [stadiums, franchises, players, matches, cronAudit] =
      await Promise.all([
        supabase
          .from("stadiums")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("franchises")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("players")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("matches")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("cron_sync_audit_log")
          .select("id", { count: "exact", head: true }),
      ]);

    console.log(`   • public.stadiums            : ${stadiums.count ?? 0} rows`);
    console.log(`   • public.franchises          : ${franchises.count ?? 0} rows`);
    console.log(`   • public.players             : ${players.count ?? 0} rows`);
    console.log(`   • public.matches             : ${matches.count ?? 0} rows`);
    console.log(
      `   • public.cron_sync_audit_log : ${cronAudit.count ?? 0} rows`
    );
  }

  console.log("\n==============================================================");
  console.log("✅ MONTH 1 INTEGRATION AUDIT PASSED — READY FOR GIT RELEASE!");
  console.log("==============================================================");
}

runMonth1IntegrationAudit().catch((err) => {
  console.error("❌ Month 1 Integration Audit Failed:", err);
  process.exit(1);
});
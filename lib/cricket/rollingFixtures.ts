import { getCachedRollingMatches } from "@/lib/cache/redis";
import { getServerEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/server";
import type {
  FranchiseCode,
  NormalizedMatchFixture,
  RollingFixtureCardItem,
  RollingFixturesApiResponse,
} from "@/types";

interface FranchiseMeta {
  city: string;
  primaryHex: string;
  coreCaptain: string;
  differentialPick: string;
}

const FRANCHISE_META_MAP: Record<FranchiseCode, FranchiseMeta> = {
  MI: {
    city: "Mumbai",
    primaryHex: "#3b6ea5",
    coreCaptain: "H. Pandya (2x)",
    differentialPick: "N. Dhir (Impact)",
  },
  CSK: {
    city: "Chennai",
    primaryHex: "#d9a74a",
    coreCaptain: "R. Jadeja (2x)",
    differentialPick: "M. Pathirana (Death)",
  },
  RCB: {
    city: "Bengaluru",
    primaryHex: "#b84242",
    coreCaptain: "V. Kohli (2x)",
    differentialPick: "S. Sharma (Spin)",
  },
  KKR: {
    city: "Kolkata",
    primaryHex: "#6d4c9c",
    coreCaptain: "S. Narine (2x)",
    differentialPick: "A. Russell (1.5x)",
  },
  RR: {
    city: "Jaipur",
    primaryHex: "#b85486",
    coreCaptain: "Y. Jaiswal (2x)",
    differentialPick: "Y. Chahal (Spin)",
  },
  GT: {
    city: "Ahmedabad",
    primaryHex: "#4a6b82",
    coreCaptain: "S. Gill (2x)",
    differentialPick: "R. Khan (1.5x)",
  },
  LSG: {
    city: "Lucknow",
    primaryHex: "#3b6fb6",
    coreCaptain: "N. Pooran (2x)",
    differentialPick: "M. Yadav (Pace)",
  },
  DC: {
    city: "Delhi",
    primaryHex: "#3b5998",
    coreCaptain: "KL Rahul (2x)",
    differentialPick: "K. Yadav (Spin)",
  },
  PBKS: {
    city: "Mohali",
    primaryHex: "#c2464c",
    coreCaptain: "S. Iyer (2x)",
    differentialPick: "A. Singh (Swing)",
  },
  SRH: {
    city: "Hyderabad",
    primaryHex: "#cf6a38",
    coreCaptain: "T. Head (2x)",
    differentialPick: "H. Klaasen (1.5x)",
  },
};

const VENUE_SOIL_BY_SLUG: Record<string, string> = {
  wankhede: "Red Soil • True Bounce",
  chinnaswamy: "Flat Deck • Short Square",
  chepauk: "Dry Clay • Grip & Turn",
  "eden-gardens": "Black Cotton • Fast Outfield",
  "sawai-mansingh": "Alluvial Loam • Big Square",
  "narendra-modi": "Hybrid Red & Black Soil",
  ekana: "Slow Black Clay • Low Bounce",
  "arun-jaitley": "Dry Loam • Compact Square",
  mullanpur: "Firm Northern Clay • Seam",
  uppal: "Hard Flat Deck • High Pace",
};

function getUtcDateString(daysOffset: number): string {
  const now = new Date();
  const target = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + daysOffset
    )
  );
  return target.toISOString().slice(0, 10);
}

function buildDayLabel(dayOffset: number, status: string): string {
  if (dayOffset <= 0) {
    return status === "LIVE" ? "Today • LIVE" : "Today • T-6h";
  }
  if (dayOffset === 1) {
    return "Tomorrow • T-24h";
  }
  return `Day +${dayOffset} • Preview`;
}

function mapNormalizedToCardItem(
  fixture: NormalizedMatchFixture,
  idx: number,
  dbId?: string
): RollingFixtureCardItem {
  const homeMeta = FRANCHISE_META_MAP[fixture.home_franchise];
  const awayMeta = FRANCHISE_META_MAP[fixture.away_franchise];
  const timeIst = fixture.is_day_match ? "15:30 IST" : "19:30 IST";
  const shortVenue = fixture.venue_name.split(" ")[0] ?? fixture.city;
  const parLow = Math.max(150, fixture.par_score_projection - 4);
  const parHigh = fixture.par_score_projection + 4;

  return {
    id: dbId ?? fixture.external_match_id,
    external_match_id: fixture.external_match_id,
    day_offset: idx,
    day_label: buildDayLabel(idx, fixture.status),
    match_number: fixture.match_number,
    match_date: fixture.match_date,
    start_time_utc: fixture.start_time_utc,
    time_ist_label: `${timeIst} • ${shortVenue}`,
    is_day_match: fixture.is_day_match,
    status: fixture.status,
    status_note: fixture.status_note,
    venue_slug: fixture.venue_slug,
    venue_name: fixture.venue_name,
    soil_profile:
      VENUE_SOIL_BY_SLUG[fixture.venue_slug] ?? "Red Soil • True Bounce",
    home_code: fixture.home_franchise,
    home_city: homeMeta.city,
    home_primary_hex: homeMeta.primaryHex,
    away_code: fixture.away_franchise,
    away_city: awayMeta.city,
    dew_index: fixture.dew_index,
    par_score_label: `${parLow} – ${parHigh}`,
    core_captain: homeMeta.coreCaptain,
    differential_pick: awayMeta.differentialPick,
    lineup_pool_count: 30,
  };
}

export async function getRollingThreeDayFixtures(): Promise<RollingFixturesApiResponse> {
  const windowStartDate = getUtcDateString(0);
  const windowEndDate = getUtcDateString(3);

  const cachedEnvelope = await getCachedRollingMatches();
  const normalizedList = cachedEnvelope.data.slice(0, 3);

  const env = getServerEnv();
  const isPlaceholderSupabase =
    env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-project.supabase.co") ||
    env.SUPABASE_SERVICE_ROLE_KEY.includes("placeholder-service-role-key");

  if (isPlaceholderSupabase) {
    return {
      ok: true,
      window_start_date: windowStartDate,
      window_end_date: windowEndDate,
      source: cachedEnvelope.source,
      cache_status: cachedEnvelope.cache_status,
      synced_with_supabase: false,
      fixtures: normalizedList.map((f, idx) => mapNormalizedToCardItem(f, idx)),
    };
  }

  try {
    const supabaseAdmin = createAdminClient();

    const [{ data: franchisesData }, { data: stadiumsData }] =
      await Promise.all([
        supabaseAdmin.from("franchises").select("id, code"),
        supabaseAdmin.from("stadiums").select("id, slug"),
      ]);

    const franchiseIdByCode = new Map<FranchiseCode, string>();
    for (const row of franchisesData ?? []) {
      franchiseIdByCode.set(row.code as FranchiseCode, String(row.id));
    }

    const stadiumIdBySlug = new Map<string, string>();
    for (const row of stadiumsData ?? []) {
      stadiumIdBySlug.set(String(row.slug), String(row.id));
    }

    const matchUpsertRows: Array<Record<string, unknown>> = [];

    for (const fixture of normalizedList) {
      const homeId = franchiseIdByCode.get(fixture.home_franchise);
      const awayId = franchiseIdByCode.get(fixture.away_franchise);
      const venueId =
        stadiumIdBySlug.get(fixture.venue_slug) ??
        Array.from(stadiumIdBySlug.values())[0];

      if (homeId && awayId && venueId && homeId !== awayId) {
        matchUpsertRows.push({
          external_match_id: fixture.external_match_id,
          match_number: fixture.match_number,
          season_year: fixture.season_year,
          home_franchise_id: homeId,
          away_franchise_id: awayId,
          venue_id: venueId,
          match_date: fixture.match_date,
          start_time_utc: fixture.start_time_utc,
          is_day_match: fixture.is_day_match,
          status: fixture.status,
          dew_index: fixture.dew_index,
          par_score_projection: fixture.par_score_projection,
          live_score_summary: {
            crr: fixture.crr,
            rrr: fixture.rrr,
            win_probability_home: fixture.win_probability_home,
            status_note: fixture.status_note,
          },
        });
      }
    }

    const dbIdByExternalId = new Map<string, string>();

    if (matchUpsertRows.length > 0) {
      const { data: upsertedMatches } = await supabaseAdmin
        .from("matches")
        .upsert(matchUpsertRows, { onConflict: "external_match_id" })
        .select("id, external_match_id, match_date")
        .gte("match_date", windowStartDate)
        .lte("match_date", windowEndDate)
        .order("match_date", { ascending: true });

      for (const m of upsertedMatches ?? []) {
        if (m.external_match_id) {
          dbIdByExternalId.set(String(m.external_match_id), String(m.id));
        }
      }
    }

    return {
      ok: true,
      window_start_date: windowStartDate,
      window_end_date: windowEndDate,
      source: cachedEnvelope.source,
      cache_status: cachedEnvelope.cache_status,
      synced_with_supabase: dbIdByExternalId.size > 0,
      fixtures: normalizedList.map((f, idx) =>
        mapNormalizedToCardItem(
          f,
          idx,
          dbIdByExternalId.get(f.external_match_id)
        )
      ),
    };
  } catch {
    return {
      ok: true,
      window_start_date: windowStartDate,
      window_end_date: windowEndDate,
      source: cachedEnvelope.source,
      cache_status: cachedEnvelope.cache_status,
      synced_with_supabase: false,
      fixtures: normalizedList.map((f, idx) => mapNormalizedToCardItem(f, idx)),
    };
  }
}
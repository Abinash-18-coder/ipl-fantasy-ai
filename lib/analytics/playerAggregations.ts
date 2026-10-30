import { getServerEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/server";
import { FRANCHISE_THEME_REGISTRY } from "@/lib/theme/franchiseTheme";
import type {
  AnalyticsSortField,
  CareerStats3Yr,
  FranchiseAnalyticsRollup,
  FranchiseCode,
  PlayerAnalyticsAggregatedRow,
  PlayerAnalyticsQueryResponse,
  PlayerRole,
  RiskBucket,
} from "@/types";

export interface PlayerAnalyticsFilterOptions {
  franchise?: FranchiseCode | "ALL";
  role?: PlayerRole | "ALL";
  riskBucket?: RiskBucket | "ALL";
  search?: string;
  sortBy?: AnalyticsSortField;
  limit?: number;
}

function buildDefaultCareer3Yr(
  role: PlayerRole,
  credits: number
): CareerStats3Yr {
  const isBowler = role === "BOWL" || role === "ALL";
  const baseRuns = role === "BOWL" ? 48 : Math.round(credits * 44);
  const baseWickets = isBowler ? Math.round(credits * 1.9) : 0;

  return {
    "2024": {
      matches: 14,
      runs: baseRuns,
      batting_avg: role === "BOWL" ? 13.0 : 35.4,
      strike_rate: role === "BOWL" ? 120.0 : 149.5,
      wickets: baseWickets,
      economy: isBowler ? 8.1 : 0,
      fantasy_points_avg: Math.round(credits * 6.5),
    },
    "2025": {
      matches: 14,
      runs: Math.round(baseRuns * 1.08),
      batting_avg: role === "BOWL" ? 14.2 : 38.1,
      strike_rate: role === "BOWL" ? 124.0 : 154.8,
      wickets: baseWickets + (isBowler ? 2 : 0),
      economy: isBowler ? 7.9 : 0,
      fantasy_points_avg: Math.round(credits * 6.9),
    },
    "2026": {
      matches: 10,
      runs: Math.round(baseRuns * 0.8),
      batting_avg: role === "BOWL" ? 14.5 : 39.6,
      strike_rate: role === "BOWL" ? 126.0 : 158.2,
      wickets: Math.max(0, baseWickets - 1),
      economy: isBowler ? 7.75 : 0,
      fantasy_points_avg: Math.round(credits * 7.2),
    },
  };
}

const FALLBACK_STAR_SEED: ReadonlyArray<{
  external_api_id: string;
  full_name: string;
  short_name: string;
  franchise_code: FranchiseCode;
  role: PlayerRole;
  credits: number;
  is_overseas: boolean;
  is_uncapped_debutant: boolean;
  selection_pct: number;
  recent_form_points: [number, number, number, number];
}> = [
  {
    external_api_id: "rcb-virat-kohli",
    full_name: "Virat Kohli",
    short_name: "V. Kohli",
    franchise_code: "RCB",
    role: "BAT",
    credits: 10.5,
    is_overseas: false,
    is_uncapped_debutant: false,
    selection_pct: 91.2,
    recent_form_points: [68, 84, 79, 96],
  },
  {
    external_api_id: "mi-jasprit-bumrah",
    full_name: "Jasprit Bumrah",
    short_name: "J. Bumrah",
    franchise_code: "MI",
    role: "BOWL",
    credits: 10.0,
    is_overseas: false,
    is_uncapped_debutant: false,
    selection_pct: 89.1,
    recent_form_points: [75, 62, 91, 88],
  },
  {
    external_api_id: "kkr-sunil-narine",
    full_name: "Sunil Narine",
    short_name: "S. Narine",
    franchise_code: "KKR",
    role: "ALL",
    credits: 10.0,
    is_overseas: true,
    is_uncapped_debutant: false,
    selection_pct: 87.6,
    recent_form_points: [82, 94, 71, 89],
  },
  {
    external_api_id: "mi-suryakumar-yadav",
    full_name: "Suryakumar Yadav",
    short_name: "S. Yadav",
    franchise_code: "MI",
    role: "BAT",
    credits: 10.0,
    is_overseas: false,
    is_uncapped_debutant: false,
    selection_pct: 86.5,
    recent_form_points: [64, 78, 88, 92],
  },
  {
    external_api_id: "srh-travis-head",
    full_name: "Travis Head",
    short_name: "T. Head",
    franchise_code: "SRH",
    role: "BAT",
    credits: 10.0,
    is_overseas: true,
    is_uncapped_debutant: false,
    selection_pct: 86.4,
    recent_form_points: [72, 85, 64, 90],
  },
  {
    external_api_id: "gt-shubman-gill",
    full_name: "Shubman Gill",
    short_name: "S. Gill",
    franchise_code: "GT",
    role: "BAT",
    credits: 10.0,
    is_overseas: false,
    is_uncapped_debutant: false,
    selection_pct: 85.7,
    recent_form_points: [61, 74, 83, 79],
  },
  {
    external_api_id: "gt-rashid-khan",
    full_name: "Rashid Khan",
    short_name: "R. Khan",
    franchise_code: "GT",
    role: "BOWL",
    credits: 9.5,
    is_overseas: true,
    is_uncapped_debutant: false,
    selection_pct: 84.9,
    recent_form_points: [58, 76, 81, 84],
  },
  {
    external_api_id: "srh-heinrich-klaasen",
    full_name: "Heinrich Klaasen",
    short_name: "H. Klaasen",
    franchise_code: "SRH",
    role: "WK",
    credits: 9.5,
    is_overseas: true,
    is_uncapped_debutant: false,
    selection_pct: 84.7,
    recent_form_points: [66, 79, 74, 86],
  },
  {
    external_api_id: "mi-hardik-pandya",
    full_name: "Hardik Pandya",
    short_name: "H. Pandya",
    franchise_code: "MI",
    role: "ALL",
    credits: 9.5,
    is_overseas: false,
    is_uncapped_debutant: false,
    selection_pct: 84.2,
    recent_form_points: [70, 65, 84, 89],
  },
  {
    external_api_id: "dc-kl-rahul",
    full_name: "KL Rahul",
    short_name: "KL Rahul",
    franchise_code: "DC",
    role: "WK",
    credits: 9.5,
    is_overseas: false,
    is_uncapped_debutant: false,
    selection_pct: 84.1,
    recent_form_points: [59, 72, 68, 81],
  },
  {
    external_api_id: "lsg-rishabh-pant",
    full_name: "Rishabh Pant",
    short_name: "R. Pant",
    franchise_code: "LSG",
    role: "WK",
    credits: 9.5,
    is_overseas: false,
    is_uncapped_debutant: false,
    selection_pct: 83.6,
    recent_form_points: [62, 74, 79, 85],
  },
  {
    external_api_id: "rr-yashasvi-jaiswal",
    full_name: "Yashasvi Jaiswal",
    short_name: "Y. Jaiswal",
    franchise_code: "RR",
    role: "BAT",
    credits: 9.5,
    is_overseas: false,
    is_uncapped_debutant: false,
    selection_pct: 82.9,
    recent_form_points: [54, 81, 76, 88],
  },
  {
    external_api_id: "csk-ravindra-jadeja",
    full_name: "Ravindra Jadeja",
    short_name: "R. Jadeja",
    franchise_code: "CSK",
    role: "ALL",
    credits: 9.5,
    is_overseas: false,
    is_uncapped_debutant: false,
    selection_pct: 81.0,
    recent_form_points: [64, 71, 78, 83],
  },
  {
    external_api_id: "pbks-shreyas-iyer",
    full_name: "Shreyas Iyer",
    short_name: "S. Iyer",
    franchise_code: "PBKS",
    role: "BAT",
    credits: 9.5,
    is_overseas: false,
    is_uncapped_debutant: false,
    selection_pct: 81.2,
    recent_form_points: [58, 69, 75, 80],
  },
  {
    external_api_id: "csk-ruturaj-gaikwad",
    full_name: "Ruturaj Gaikwad",
    short_name: "R. Gaikwad",
    franchise_code: "CSK",
    role: "BAT",
    credits: 9.5,
    is_overseas: false,
    is_uncapped_debutant: false,
    selection_pct: 78.4,
    recent_form_points: [60, 73, 68, 84],
  },
  {
    external_api_id: "csk-matheesha-pathirana",
    full_name: "Matheesha Pathirana",
    short_name: "M. Pathirana",
    franchise_code: "CSK",
    role: "BOWL",
    credits: 9.0,
    is_overseas: true,
    is_uncapped_debutant: false,
    selection_pct: 76.8,
    recent_form_points: [62, 79, 85, 87],
  },
  {
    external_api_id: "mi-naman-dhir",
    full_name: "Naman Dhir",
    short_name: "N. Dhir",
    franchise_code: "MI",
    role: "ALL",
    credits: 7.5,
    is_overseas: false,
    is_uncapped_debutant: true,
    selection_pct: 22.4,
    recent_form_points: [48, 64, 71, 76],
  },
  {
    external_api_id: "rr-vaibhav-suryavanshi",
    full_name: "Vaibhav Suryavanshi",
    short_name: "V. Suryavanshi",
    franchise_code: "RR",
    role: "BAT",
    credits: 6.5,
    is_overseas: false,
    is_uncapped_debutant: true,
    selection_pct: 16.5,
    recent_form_points: [42, 58, 67, 74],
  },
];

function buildFallbackAggregatedData(): {
  players: PlayerAnalyticsAggregatedRow[];
  franchiseRollups: FranchiseAnalyticsRollup[];
} {
  const players: PlayerAnalyticsAggregatedRow[] = FALLBACK_STAR_SEED.map(
    (item, idx) => {
      const spec = FRANCHISE_THEME_REGISTRY[item.franchise_code];
      const career = buildDefaultCareer3Yr(item.role, item.credits);
      const [m1, m2, m3, m4] = item.recent_form_points;
      const form4mAvg = Number(((m1 + m2 + m3 + m4) / 4).toFixed(2));
      const momentumDelta = Number((m4 - m1).toFixed(2));
      const pointsPerCredit = Number(
        (form4mAvg / item.credits).toFixed(2)
      );

      const s24 = career["2024"];
      const s25 = career["2025"];
      const s26 = career["2026"];

      const careerMatches =
        (s24?.matches ?? 0) + (s25?.matches ?? 0) + (s26?.matches ?? 0);
      const careerRuns =
        (s24?.runs ?? 0) + (s25?.runs ?? 0) + (s26?.runs ?? 0);
      const careerWickets =
        (s24?.wickets ?? 0) + (s25?.wickets ?? 0) + (s26?.wickets ?? 0);
      const careerSr = Number(
        (
          ((s24?.strike_rate ?? 0) +
            (s25?.strike_rate ?? 0) +
            (s26?.strike_rate ?? 0)) /
          3
        ).toFixed(2)
      );
      const careerEco = Number(
        (
          ((s24?.economy ?? 0) +
            (s25?.economy ?? 0) +
            (s26?.economy ?? 0)) /
          3
        ).toFixed(2)
      );
      const careerFantasyAvg = Number(
        (
          ((s24?.fantasy_points_avg ?? 0) +
            (s25?.fantasy_points_avg ?? 0) +
            (s26?.fantasy_points_avg ?? 0)) /
          3
        ).toFixed(2)
      );

      const riskBucket: RiskBucket =
        item.selection_pct >= 65
          ? "Core"
          : item.is_uncapped_debutant || item.selection_pct < 20
            ? "Punt"
            : form4mAvg >= careerFantasyAvg
              ? "Form"
              : "Historic";

      return {
        id: `fallback-player-${idx + 1}`,
        external_api_id: item.external_api_id,
        full_name: item.full_name,
        short_name: item.short_name,
        franchise_id: `fallback-franchise-${item.franchise_code}`,
        franchise_code: item.franchise_code,
        franchise_name: spec.name,
        franchise_primary_hex: spec.primaryHex,
        role: item.role,
        credits: item.credits,
        avatar_url: `/avatars/players/${item.external_api_id}.svg`,
        is_overseas: item.is_overseas,
        is_uncapped_debutant: item.is_uncapped_debutant,
        selection_pct: item.selection_pct,
        recent_form_points: [...item.recent_form_points],
        career_stats_3yr: career,
        season_total_points: m1 + m2 + m3 + m4,
        form_4m_avg: form4mAvg,
        form_momentum_delta: momentumDelta,
        points_per_credit: pointsPerCredit,
        career_3yr_matches: careerMatches,
        career_3yr_runs: careerRuns,
        career_3yr_wickets: careerWickets,
        career_3yr_sr: careerSr,
        career_3yr_economy: careerEco,
        career_3yr_fantasy_avg: careerFantasyAvg,
        recommended_risk_bucket: riskBucket,
      };
    }
  );

  const allCodes = Object.keys(
    FRANCHISE_THEME_REGISTRY
  ) as FranchiseCode[];
  const franchiseRollups: FranchiseAnalyticsRollup[] = allCodes.map(
    (code) => {
      const spec = FRANCHISE_THEME_REGISTRY[code];
      const teamPlayers = players.filter((p) => p.franchise_code === code);
      const avgForm =
        teamPlayers.length > 0
          ? Number(
              (
                teamPlayers.reduce((s, p) => s + p.form_4m_avg, 0) /
                teamPlayers.length
              ).toFixed(2)
            )
          : 68.5;
      const topRoi =
        teamPlayers.length > 0
          ? Math.max(...teamPlayers.map((p) => p.points_per_credit))
          : 8.6;

      return {
        franchise_code: code,
        franchise_name: spec.name,
        franchise_primary_hex: spec.primaryHex,
        squad_size: 25,
        overseas_count: 8,
        uncapped_count: 7,
        avg_credits: 7.8,
        avg_squad_form_pts: avgForm,
        top_value_roi: topRoi,
      };
    }
  );

  return { players, franchiseRollups };
}

function applyFiltersAndSorting(
  list: PlayerAnalyticsAggregatedRow[],
  options: PlayerAnalyticsFilterOptions
): PlayerAnalyticsAggregatedRow[] {
  let filtered = [...list];

  if (options.franchise && options.franchise !== "ALL") {
    filtered = filtered.filter(
      (p) => p.franchise_code === options.franchise
    );
  }

  if (options.role && options.role !== "ALL") {
    filtered = filtered.filter((p) => p.role === options.role);
  }

  if (options.riskBucket && options.riskBucket !== "ALL") {
    filtered = filtered.filter(
      (p) => p.recommended_risk_bucket === options.riskBucket
    );
  }

  if (options.search && options.search.trim() !== "") {
    const q = options.search.trim().toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.full_name.toLowerCase().includes(q) ||
        p.short_name.toLowerCase().includes(q) ||
        p.franchise_code.toLowerCase().includes(q)
    );
  }

  const sortField: AnalyticsSortField = options.sortBy ?? "form_4m_avg";
  filtered.sort((a, b) => Number(b[sortField]) - Number(a[sortField]));

  if (typeof options.limit === "number" && options.limit > 0) {
    return filtered.slice(0, options.limit);
  }

  return filtered;
}

export async function getAggregatedPlayerAnalytics(
  options: PlayerAnalyticsFilterOptions = {}
): Promise<PlayerAnalyticsQueryResponse> {
  const env = getServerEnv();
  const isPlaceholderSupabase =
    env.NEXT_PUBLIC_SUPABASE_URL.includes(
      "placeholder-project.supabase.co"
    ) ||
    env.SUPABASE_SERVICE_ROLE_KEY.includes("placeholder-service-role-key");

  if (!isPlaceholderSupabase) {
    try {
      const supabase = createAdminClient();

      const [playersViewRes, rollupsViewRes] = await Promise.all([
        supabase.from("v_player_analytics_summary").select("*"),
        supabase.from("v_franchise_analytics_rollup").select("*"),
      ]);

      if (
        !playersViewRes.error &&
        Array.isArray(playersViewRes.data) &&
        playersViewRes.data.length > 0
      ) {
        const normalizedPlayers: PlayerAnalyticsAggregatedRow[] =
          playersViewRes.data.map((row: Record<string, unknown>) => ({
            id: String(row.id ?? ""),
            external_api_id: String(row.external_api_id ?? ""),
            full_name: String(row.full_name ?? ""),
            short_name: String(row.short_name ?? ""),
            franchise_id: String(row.franchise_id ?? ""),
            franchise_code: (row.franchise_code as FranchiseCode) ?? "MI",
            franchise_name: String(row.franchise_name ?? ""),
            franchise_primary_hex: String(
              row.franchise_primary_hex ?? "#c8b273"
            ),
            role: (row.role as PlayerRole) ?? "BAT",
            credits: Number(row.credits ?? 8.0),
            avatar_url: String(
              row.avatar_url ?? "/avatars/player-silhouette.svg"
            ),
            is_overseas: Boolean(row.is_overseas),
            is_uncapped_debutant: Boolean(row.is_uncapped_debutant),
            selection_pct: Number(row.selection_pct ?? 0),
            recent_form_points: Array.isArray(row.recent_form_points)
              ? (row.recent_form_points as number[]).map((n) => Number(n))
              : [60, 65, 70, 72],
            career_stats_3yr: (row.career_stats_3yr ??
              {}) as CareerStats3Yr,
            season_total_points: Number(row.season_total_points ?? 0),
            form_4m_avg: Number(row.form_4m_avg ?? 0),
            form_momentum_delta: Number(row.form_momentum_delta ?? 0),
            points_per_credit: Number(row.points_per_credit ?? 0),
            career_3yr_matches: Number(row.career_3yr_matches ?? 0),
            career_3yr_runs: Number(row.career_3yr_runs ?? 0),
            career_3yr_wickets: Number(row.career_3yr_wickets ?? 0),
            career_3yr_sr: Number(row.career_3yr_sr ?? 0),
            career_3yr_economy: Number(row.career_3yr_economy ?? 0),
            career_3yr_fantasy_avg: Number(row.career_3yr_fantasy_avg ?? 0),
            recommended_risk_bucket:
              (row.recommended_risk_bucket as RiskBucket) ?? "Form",
          }));

        const normalizedRollups: FranchiseAnalyticsRollup[] =
          Array.isArray(rollupsViewRes.data) &&
          rollupsViewRes.data.length > 0
            ? rollupsViewRes.data.map((r: Record<string, unknown>) => ({
                franchise_code:
                  (r.franchise_code as FranchiseCode) ?? "MI",
                franchise_name: String(r.franchise_name ?? ""),
                franchise_primary_hex: String(
                  r.franchise_primary_hex ?? "#c8b273"
                ),
                squad_size: Number(r.squad_size ?? 25),
                overseas_count: Number(r.overseas_count ?? 8),
                uncapped_count: Number(r.uncapped_count ?? 6),
                avg_credits: Number(r.avg_credits ?? 7.8),
                avg_squad_form_pts: Number(r.avg_squad_form_pts ?? 65),
                top_value_roi: Number(r.top_value_roi ?? 8.5),
              }))
            : buildFallbackAggregatedData().franchiseRollups;

        const filteredPlayers = applyFiltersAndSorting(
          normalizedPlayers,
          options
        );

        return {
          ok: true,
          source: "POSTGRES_VIEW",
          total_players: filteredPlayers.length,
          franchise_rollups: normalizedRollups,
          players: filteredPlayers,
        };
      }
    } catch {
      // Fall through to deterministic fallback engine
    }
  }

  const fallback = buildFallbackAggregatedData();
  const filteredFallback = applyFiltersAndSorting(
    fallback.players,
    options
  );

  return {
    ok: true,
    source: "FALLBACK_ENGINE",
    total_players: filteredFallback.length,
    franchise_rollups: fallback.franchiseRollups,
    players: filteredFallback,
  };
}
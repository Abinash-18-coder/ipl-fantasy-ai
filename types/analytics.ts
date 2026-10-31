import type {
  CareerStats3Yr,
  FranchiseCode,
  PlayerRole,
  RiskBucket,
} from "@/types";

export interface PlayerAnalyticsAggregatedRow {
  id: string;
  external_api_id: string;
  full_name: string;
  short_name: string;
  franchise_id: string;
  franchise_code: FranchiseCode;
  franchise_name: string;
  franchise_primary_hex: string;
  role: PlayerRole;
  credits: number;
  avatar_url: string;
  is_overseas: boolean;
  is_uncapped_debutant: boolean;
  selection_pct: number;
  recent_form_points: number[];
  career_stats_3yr: CareerStats3Yr;
  season_total_points: number;
  form_4m_avg: number;
  avg_points_per_match: number;
  form_momentum_delta: number;
  points_per_credit: number;
  boundary_pct: number;
  death_overs_economy: number;
  career_3yr_matches: number;
  career_3yr_runs: number;
  career_3yr_wickets: number;
  career_3yr_sr: number;
  career_3yr_economy: number;
  career_3yr_fantasy_avg: number;
  recommended_risk_bucket: RiskBucket;
}

export interface FranchiseAnalyticsRollup {
  franchise_code: FranchiseCode;
  franchise_name: string;
  franchise_primary_hex: string;
  squad_size: number;
  overseas_count: number;
  uncapped_count: number;
  avg_credits: number;
  avg_squad_form_pts: number;
  top_value_roi: number;
}

export type AnalyticsSortField =
  | "form_4m_avg"
  | "points_per_credit"
  | "boundary_pct"
  | "death_overs_economy"
  | "selection_pct"
  | "credits"
  | "career_3yr_runs"
  | "career_3yr_wickets";

export interface PlayerAnalyticsQueryResponse {
  ok: boolean;
  source: "POSTGRES_VIEW" | "FALLBACK_ENGINE";
  total_players: number;
  franchise_rollups: FranchiseAnalyticsRollup[];
  players: PlayerAnalyticsAggregatedRow[];
}
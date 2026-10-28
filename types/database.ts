import type {
  FranchiseCode,
  LineupStatus,
  MatchStatus,
  PlayerRole,
  RiskBucket,
} from "@/types";

export type AccountTier = "FREE" | "PRO" | "ADMIN";

export type TossDecision = "BAT" | "BOWL";

export interface CareerSeasonSummary {
  matches: number;
  runs: number;
  batting_avg: number;
  strike_rate: number;
  wickets: number;
  economy: number;
  fantasy_points_avg: number;
}

export type CareerStats3Yr = Record<string, CareerSeasonSummary>;

export interface StadiumRow {
  id: string;
  slug: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  soil_type: string;
  straight_boundary_m: number;
  square_boundary_m: number;
  pace_wicket_pct: number;
  spin_wicket_pct: number;
  chase_win_pct: number;
  avg_first_innings_score: number;
  created_at: string;
  updated_at: string;
}

export interface FranchiseRow {
  id: string;
  code: FranchiseCode;
  name: string;
  city: string;
  primary_hex: string;
  secondary_hex: string;
  logo_url: string | null;
  home_stadium_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  account_tier: AccountTier;
  favorite_franchise_id: string | null;
  sound_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlayerRow {
  id: string;
  external_api_id: string | null;
  full_name: string;
  short_name: string;
  franchise_id: string;
  role: PlayerRole;
  credits: number;
  batting_style: string | null;
  bowling_style: string | null;
  avatar_url: string | null;
  is_overseas: boolean;
  is_uncapped_debutant: boolean;
  selection_pct: number;
  recent_form_points: number[];
  career_stats_3yr: CareerStats3Yr;
  season_total_points: number;
  is_active_squad: boolean;
  created_at: string;
  updated_at: string;
}

export interface LiveScoreSummaryJson {
  home_runs?: number;
  home_wickets?: number;
  home_overs?: number;
  away_runs?: number;
  away_wickets?: number;
  away_overs?: number;
  crr?: number;
  rrr?: number;
  win_probability_home?: number;
  status_note?: string;
}

export interface MatchRow {
  id: string;
  external_match_id: string | null;
  match_number: number;
  season_year: number;
  home_franchise_id: string;
  away_franchise_id: string;
  venue_id: string;
  match_date: string;
  start_time_utc: string;
  is_day_match: boolean;
  status: MatchStatus;
  toss_winner_franchise_id: string | null;
  toss_decision: TossDecision | null;
  playing_xi_confirmed: boolean;
  announced_xi_ids: string[];
  impact_sub_ids: string[];
  dew_index: number;
  par_score_projection: number;
  live_score_summary: LiveScoreSummaryJson;
  computed_dream_team_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface FantasyTeamPlayerSlot {
  player_id: string;
  short_name: string;
  franchise_code: FranchiseCode;
  role: PlayerRole;
  credits: number;
  is_captain: boolean;
  is_vc: boolean;
  fielding_zone: "WK" | "SLIPS" | "RING" | "BOUNDARY";
}

export interface SwapLogEntry {
  swapped_at_utc: string;
  benched_player_id: string;
  benched_player_name: string;
  replacement_player_id: string;
  replacement_player_name: string;
  role: PlayerRole;
  credits: number;
  inherited_badge: "C" | "VC" | null;
}

export interface FantasyTeamRow {
  id: string;
  match_id: string;
  team_index: number;
  bucket_tier: RiskBucket;
  lineup_status: LineupStatus;
  is_locked_core: boolean;
  captain_id: string;
  vc_id: string;
  players: FantasyTeamPlayerSlot[];
  total_credits: number;
  win_probability_score: number;
  projected_points: number;
  actual_points: number;
  swap_log: SwapLogEntry[];
  created_at: string;
  updated_at: string;
}

export interface UserTeamAllocationRow {
  id: string;
  user_id: string;
  match_id: string;
  team_id: string;
  slot_number: number;
  is_core_shared: boolean;
  live_points: number;
  live_rank: number;
  previous_rank: number;
  created_at: string;
  updated_at: string;
}
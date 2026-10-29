import type {
  FranchiseCode,
  MatchStatus,
  PlayerRole,
  TossDecision,
} from "@/types";

export type CricketDataSource = "LIVE_API" | "PRE_SEASON_SIMULATION";

export type CacheShieldStatus = "REDIS_HIT" | "MEMORY_HIT" | "COALESCED_HIT" | "MISS";

export type CacheBackendMode = "UPSTASH_REDIS" | "IN_MEMORY_FALLBACK";

export interface BatterInningsStat {
  player_external_id: string;
  player_name: string;
  short_name: string;
  dismissal_text: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strike_rate: number;
  is_striker: boolean;
  is_non_striker: boolean;
  is_out: boolean;
}

export interface BowlerSpellStat {
  player_external_id: string;
  player_name: string;
  short_name: string;
  overs: number;
  maidens: number;
  runs_conceded: number;
  wickets: number;
  economy: number;
  dot_balls: number;
  wides: number;
  no_balls: number;
  is_current_bowler: boolean;
}

export interface BallDeliveryEvent {
  ball_id: string;
  over_number: number;
  ball_in_over: number;
  label: string;
  runs_scored: number;
  is_boundary_four: boolean;
  is_boundary_six: boolean;
  is_wicket: boolean;
  is_extra: boolean;
  commentary_short: string;
}

export interface InningsScorecard {
  innings_number: 1 | 2;
  batting_franchise: FranchiseCode;
  bowling_franchise: FranchiseCode;
  total_runs: number;
  total_wickets: number;
  overs_completed: number;
  extras_total: number;
  extras_detail: string;
  batters: BatterInningsStat[];
  bowlers: BowlerSpellStat[];
  did_not_bat: string[];
  recent_deliveries: BallDeliveryEvent[];
}

export interface NormalizedMatchFixture {
  external_match_id: string;
  match_number: number;
  season_year: number;
  home_franchise: FranchiseCode;
  away_franchise: FranchiseCode;
  venue_slug: string;
  venue_name: string;
  city: string;
  match_date: string;
  start_time_utc: string;
  is_day_match: boolean;
  status: MatchStatus;
  status_note: string;
  home_score_short: string;
  away_score_short: string;
  crr: number;
  rrr: number;
  win_probability_home: number;
  dew_index: number;
  par_score_projection: number;
}

export interface NormalizedMatchScorecard {
  external_match_id: string;
  fixture: NormalizedMatchFixture;
  innings: InningsScorecard[];
  data_source: CricketDataSource;
  fetched_at_utc: string;
}

export interface SquadPlayerEntry {
  external_player_id: string;
  full_name: string;
  short_name: string;
  franchise_code: FranchiseCode;
  role: PlayerRole;
  credits: number;
  is_overseas: boolean;
  is_uncapped_debutant: boolean;
  is_playing_xi: boolean;
  is_impact_sub: boolean;
}

export interface NormalizedMatchSquadAndToss {
  external_match_id: string;
  toss_completed: boolean;
  toss_winner: FranchiseCode | null;
  toss_decision: TossDecision | null;
  playing_xi_confirmed: boolean;
  announced_xi_ids: string[];
  impact_sub_ids: string[];
  squads: SquadPlayerEntry[];
  data_source: CricketDataSource;
  fetched_at_utc: string;
}

export interface CricketApiEnvelope<T> {
  ok: boolean;
  source: CricketDataSource;
  latency_ms: number;
  fetched_at_utc: string;
  data: T;
  error_message?: string;
}

export interface CachedCricketEnvelope<T> extends CricketApiEnvelope<T> {
  cache_status: CacheShieldStatus;
  cache_backend: CacheBackendMode;
  cache_key: string;
  ttl_seconds: number;
}

export interface RollingFixtureCardItem {
  id: string;
  external_match_id: string;
  day_offset: number;
  day_label: string;
  match_number: number;
  match_date: string;
  start_time_utc: string;
  time_ist_label: string;
  is_day_match: boolean;
  status: MatchStatus;
  status_note: string;
  venue_slug: string;
  venue_name: string;
  soil_profile: string;
  home_code: FranchiseCode;
  home_city: string;
  home_primary_hex: string;
  away_code: FranchiseCode;
  away_city: string;
  dew_index: number;
  par_score_label: string;
  core_captain: string;
  differential_pick: string;
  lineup_pool_count: number;
}

export interface RollingFixturesApiResponse {
  ok: boolean;
  window_start_date: string;
  window_end_date: string;
  source: CricketDataSource;
  cache_status: CacheShieldStatus;
  synced_with_supabase: boolean;
  fixtures: RollingFixtureCardItem[];
}
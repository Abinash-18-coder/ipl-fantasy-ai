import type { FranchiseCode, PlayerRole } from "@/types";

export type AccountTier = "FREE" | "PRO" | "ADMIN";

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
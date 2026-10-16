// File: types/index.ts

/**
 * Official 4 player roles required by Dream11 & My11Circle roster rules (Day 65)
 */
export type PlayerRole = "WK" | "BAT" | "ALL" | "BOWL";

/**
 * The 4 Strategic Diversity Buckets for our 30-team generator (Day 58 & Day 67):
 * - Core: 5 High-Probability safe teams
 * - Form: 15 Recent 4-match form-heavy teams
 * - Historic: 5 3-Year IPL consistency teams
 * - Punt: 5 Low-ownership / Debutant differential teams
 */
export type RiskBucket = "Core" | "Form" | "Historic" | "Punt";

/**
 * Live match lifecycle states used by our Supabase pg_cron Smart Sleep check (Day 20)
 */
export type MatchStatus = "UPCOMING" | "TOSS_COMPLETED" | "LIVE" | "COMPLETED";

/**
 * Two-stage lineup status:
 * - PROVISIONAL: Generated at T-24h before toss (Amber badge)
 * - CONFIRMED_PLAYING: Verified/Auto-swapped at T-30m after toss (Emerald badge)
 */
export type LineupStatus = "PROVISIONAL" | "CONFIRMED_PLAYING";

/**
 * All 10 IPL Franchises for ambient stadium theming (Day 22) and max-player constraints
 */
export type FranchiseCode =
  | "CSK"
  | "MI"
  | "RCB"
  | "KKR"
  | "RR"
  | "GT"
  | "LSG"
  | "DC"
  | "PBKS"
  | "SRH";

/**
 * Navigation item structure for Navbar, MobileNav dock, and Cmd+K Command Palette (Day 4)
 */
export interface NavItem {
  label: string;
  href: string;
  shortcut: string;
  description: string;
  requiresAuth: boolean;
  badgeText?: string;
}
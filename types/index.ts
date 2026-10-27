export type PlayerRole = "WK" | "BAT" | "ALL" | "BOWL";

export type RiskBucket = "Core" | "Form" | "Historic" | "Punt";

export type MatchStatus = "UPCOMING" | "TOSS_COMPLETED" | "LIVE" | "COMPLETED";

export type LineupStatus = "PROVISIONAL" | "CONFIRMED_PLAYING";

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

export interface NavItem {
  label: string;
  href: string;
  shortcut: string;
  description: string;
  requiresAuth: boolean;
  badgeText?: string;
}

export type {
  AccountTier,
  CareerSeasonSummary,
  CareerStats3Yr,
  StadiumRow,
  FranchiseRow,
  UserProfileRow,
  PlayerRow,
} from "./database";
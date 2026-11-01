import type { PlayerAnalyticsAggregatedRow } from "@/types";

export const OWNERSHIP_DIFFERENTIAL_THRESHOLD_PCT = 15.0;
export const LOW_CREDIT_SAVER_THRESHOLD = 7.5;
export const HIGH_ROI_EFFICIENCY_THRESHOLD = 6.2;

export type PuntBadgeCategory =
  | "DUAL_DEBUTANT_DIFF"
  | "UNCAPPED_DEBUTANT"
  | "LOW_OWNED_DIFFERENTIAL"
  | "LOW_CREDIT_ENABLER"
  | "STANDARD_ROSTER";

export type SolverTicketAllocationPool =
  | "GL_PUNT_TICKETS_26_30"
  | "FORM_SURGE_TICKETS_6_20"
  | "CORE_SAFE_TICKETS_1_5"
  | "HISTORIC_TICKETS_21_25";

export interface PlayerPuntClassification {
  external_api_id: string;
  category: PuntBadgeCategory;
  isQualifyingPunt: boolean;
  isUncappedDebutant: boolean;
  isLowOwnershipGem: boolean;
  isLowCreditEnabler: boolean;
  differentialLeverageScore: number;
  creditReliefIndex: number;
  badgeLabel: string | null;
  secondaryBadgeLabel: string | null;
  badgeColorVariant: "crimson" | "gold" | "emerald" | "slate";
  solverPoolTarget: SolverTicketAllocationPool;
  tacticalRationale: string;
}

export interface SquadDifferentialSummary {
  totalUncappedDebutants: number;
  totalUnder15PctOwned: number;
  totalLowCreditEnablers: number;
  totalQualifyingPunts: number;
  topDifferentialPicks: Array<{
    player: PlayerAnalyticsAggregatedRow;
    classification: PlayerPuntClassification;
  }>;
}

export function classifyPlayerPuntProfile(
  player: PlayerAnalyticsAggregatedRow
): PlayerPuntClassification {
  const isUncappedDebutant = Boolean(player.is_uncapped_debutant);
  const isLowOwnershipGem =
    player.selection_pct < OWNERSHIP_DIFFERENTIAL_THRESHOLD_PCT;
  const isLowCreditEnabler =
    player.credits <= LOW_CREDIT_SAVER_THRESHOLD &&
    player.points_per_credit >= HIGH_ROI_EFFICIENCY_THRESHOLD;

  const ownershipScarcityBoost = Math.max(
    0,
    (30 - Math.min(30, player.selection_pct)) * 1.15
  );
  const creditSavingsBoost = Math.max(0, (9.5 - player.credits) * 6.5);
  const formEfficiencyBoost = Math.min(28, player.points_per_credit * 3.1);
  const debutantSurpriseBoost = isUncappedDebutant ? 14 : 0;

  const rawLeverage =
    ownershipScarcityBoost +
    creditSavingsBoost +
    formEfficiencyBoost +
    debutantSurpriseBoost;

  const differentialLeverageScore = Number(
    Math.min(99.4, Math.max(18.0, rawLeverage)).toFixed(1)
  );

  const creditReliefIndex = Number(
    Math.max(0, 10.0 - player.credits).toFixed(1)
  );

  if (isUncappedDebutant && isLowOwnershipGem) {
    return {
      external_api_id: player.external_api_id,
      category: "DUAL_DEBUTANT_DIFF",
      isQualifyingPunt: true,
      isUncappedDebutant: true,
      isLowOwnershipGem: true,
      isLowCreditEnabler,
      differentialLeverageScore,
      creditReliefIndex,
      badgeLabel: "DEBUTANT • <15% DIFF",
      secondaryBadgeLabel: isLowCreditEnabler
        ? `${player.credits.toFixed(1)} Cr SAVER`
        : null,
      badgeColorVariant: "crimson",
      solverPoolTarget: "GL_PUNT_TICKETS_26_30",
      tacticalRationale: `Uncapped IPL talent at ${player.selection_pct.toFixed(1)}% ownership (${player.credits.toFixed(1)} Cr). Saves ${creditReliefIndex} credits for marquee captains in Grand League Tickets #26–#30.`,
    };
  }

  if (isLowOwnershipGem) {
    return {
      external_api_id: player.external_api_id,
      category: "LOW_OWNED_DIFFERENTIAL",
      isQualifyingPunt: true,
      isUncappedDebutant: false,
      isLowOwnershipGem: true,
      isLowCreditEnabler,
      differentialLeverageScore,
      creditReliefIndex,
      badgeLabel: `<15% DIFF (${player.selection_pct.toFixed(1)}%)`,
      secondaryBadgeLabel: isLowCreditEnabler
        ? `${player.credits.toFixed(1)} Cr ENABLER`
        : null,
      badgeColorVariant: "crimson",
      solverPoolTarget: "GL_PUNT_TICKETS_26_30",
      tacticalRationale: `Contrarian sub-15% ownership differential (${player.selection_pct.toFixed(1)}% sel) averaging ${player.form_4m_avg.toFixed(1)} pts over the last 4 matches.`,
    };
  }

  if (isUncappedDebutant) {
    return {
      external_api_id: player.external_api_id,
      category: "UNCAPPED_DEBUTANT",
      isQualifyingPunt: true,
      isUncappedDebutant: true,
      isLowOwnershipGem: false,
      isLowCreditEnabler,
      differentialLeverageScore,
      creditReliefIndex,
      badgeLabel: "UNCAPPED BREAKOUT",
      secondaryBadgeLabel: isLowCreditEnabler
        ? `${player.credits.toFixed(1)} Cr VALUE`
        : null,
      badgeColorVariant: "gold",
      solverPoolTarget: "GL_PUNT_TICKETS_26_30",
      tacticalRationale: `Uncapped domestic impact player (${player.credits.toFixed(1)} Cr) delivering ${player.points_per_credit.toFixed(2)} pts/credit ROI.`,
    };
  }

  if (isLowCreditEnabler) {
    return {
      external_api_id: player.external_api_id,
      category: "LOW_CREDIT_ENABLER",
      isQualifyingPunt: false,
      isUncappedDebutant: false,
      isLowOwnershipGem: false,
      isLowCreditEnabler: true,
      differentialLeverageScore,
      creditReliefIndex,
      badgeLabel: `${player.credits.toFixed(1)} Cr ENABLER`,
      secondaryBadgeLabel: `ROI ${player.points_per_credit.toFixed(1)}/Cr`,
      badgeColorVariant: "emerald",
      solverPoolTarget: "FORM_SURGE_TICKETS_6_20",
      tacticalRationale: `Budget salary-cap enabler (${player.credits.toFixed(1)} Cr) unlocking +${creditReliefIndex} Cr cap space for 10.5 Cr core stars.`,
    };
  }

  return {
    external_api_id: player.external_api_id,
    category: "STANDARD_ROSTER",
    isQualifyingPunt: false,
    isUncappedDebutant: false,
    isLowOwnershipGem: false,
    isLowCreditEnabler: false,
    differentialLeverageScore,
    creditReliefIndex,
    badgeLabel: null,
    secondaryBadgeLabel: null,
    badgeColorVariant: "slate",
    solverPoolTarget:
      player.recommended_risk_bucket === "Core"
        ? "CORE_SAFE_TICKETS_1_5"
        : player.recommended_risk_bucket === "Historic"
          ? "HISTORIC_TICKETS_21_25"
          : "FORM_SURGE_TICKETS_6_20",
    tacticalRationale: `High-ownership anchor (${player.selection_pct.toFixed(1)}% sel) assigned to ${player.recommended_risk_bucket} solver pool.`,
  };
}

export function summarizeSquadDifferentials(
  players: readonly PlayerAnalyticsAggregatedRow[]
): SquadDifferentialSummary {
  let totalUncappedDebutants = 0;
  let totalUnder15PctOwned = 0;
  let totalLowCreditEnablers = 0;
  let totalQualifyingPunts = 0;

  const classifiedPairs: Array<{
    player: PlayerAnalyticsAggregatedRow;
    classification: PlayerPuntClassification;
  }> = [];

  for (const player of players) {
    const classification = classifyPlayerPuntProfile(player);
    if (classification.isUncappedDebutant) totalUncappedDebutants += 1;
    if (classification.isLowOwnershipGem) totalUnder15PctOwned += 1;
    if (classification.isLowCreditEnabler) totalLowCreditEnablers += 1;
    if (classification.isQualifyingPunt) {
      totalQualifyingPunts += 1;
      classifiedPairs.push({ player, classification });
    }
  }

  classifiedPairs.sort(
    (a, b) =>
      b.classification.differentialLeverageScore -
      a.classification.differentialLeverageScore
  );

  return {
    totalUncappedDebutants,
    totalUnder15PctOwned,
    totalLowCreditEnablers,
    totalQualifyingPunts,
    topDifferentialPicks: classifiedPairs.slice(0, 6),
  };
}
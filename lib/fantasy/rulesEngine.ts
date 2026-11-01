import { z } from "zod";
import rawDream11Rules from "@/rules/dream11-t20.json";
import type { PlayerRole } from "@/types";

const EconomyBandSchema = z.object({
  min_eco: z.number().optional(),
  max_eco: z.number().optional(),
  points: z.number(),
  label: z.string(),
});

const StrikeRateBandSchema = z.object({
  min_sr: z.number().optional(),
  max_sr: z.number().optional(),
  points: z.number(),
  label: z.string(),
});

export const Dream11RulesConfigSchema = z.object({
  version: z.string(),
  last_verified: z.string(),
  reverify_before: z.string(),
  multipliers: z.object({
    captain: z.number(),
    vice_captain: z.number(),
    normal: z.number(),
  }),
  appearance: z.object({
    playing_xi: z.number(),
    impact_substitute_activated: z.number(),
  }),
  batting: z.object({
    run: z.number(),
    boundary_four_bonus: z.number(),
    boundary_six_bonus: z.number(),
    duck_penalty: z.number(),
    duck_exempt_roles: z.array(z.enum(["WK", "BAT", "ALL", "BOWL"])),
    milestones: z.object({
      runs_25_bonus: z.number(),
      runs_50_bonus: z.number(),
      runs_75_bonus: z.number(),
      runs_100_bonus: z.number(),
    }),
  }),
  bowling: z.object({
    wicket_excluding_run_out: z.number(),
    lbw_or_bowled_bonus: z.number(),
    maiden_over: z.number(),
    crex_dot_ball_bonus: z.number(),
    hauls: z.object({
      wickets_3_bonus: z.number(),
      wickets_4_bonus: z.number(),
      wickets_5_bonus: z.number(),
    }),
  }),
  fielding: z.object({
    catch: z.number(),
    three_catches_haul_bonus: z.number(),
    stumping: z.number(),
    run_out_direct_hit: z.number(),
    run_out_indirect: z.number(),
  }),
  economy_rate: z.object({
    min_balls_bowled: z.number(),
    bands: z.array(EconomyBandSchema),
  }),
  economy_rate_override: z.boolean().optional(),
  strike_rate: z.object({
    min_balls_faced: z.number(),
    exempt_roles: z.array(z.enum(["WK", "BAT", "ALL", "BOWL"])),
    bands: z.array(StrikeRateBandSchema),
  }),
});

export type Dream11RulesConfig = z.infer<typeof Dream11RulesConfigSchema>;

export const DREAM11_T20_RULES: Dream11RulesConfig =
  Dream11RulesConfigSchema.parse(rawDream11Rules);

export type MultiplierRole = "CAPTAIN" | "VICE_CAPTAIN" | "NONE";

export interface PlayerMatchPerformanceInput {
  player_id: string;
  player_name: string;
  role: PlayerRole;
  in_starting_xi: boolean;
  activated_as_impact_sub?: boolean;
  multiplier_role?: "CAPTAIN" | "VICE_CAPTAIN" | "NONE";
  runs_scored?: number;
  balls_faced?: number;
  fours?: number;
  sixes?: number;
  is_dismissed?: boolean;
  overs_bowled?: number;
  balls_bowled?: number;
  maidens?: number;
  runs_conceded?: number;
  wickets_taken?: number;
  lbw_or_bowled_wickets?: number;
  dot_balls_bowled?: number;
  catches?: number;
  stumpings?: number;
  run_outs_direct?: number;
  run_outs_indirect?: number;
}

export interface PlayerFantasyPointsBreakdown {
  player_id: string;
  player_name: string;
  role: PlayerRole;
  rule_version: string;
  appearance_points: number;
  batting_run_points: number;
  boundary_four_points: number;
  boundary_six_points: number;
  batting_milestone_points: number;
  duck_penalty_points: number;
  strike_rate_points: number;
  computed_strike_rate: number | null;
  wicket_points: number;
  lbw_bowled_bonus_points: number;
  bowling_haul_points: number;
  maiden_over_points: number;
  economy_rate_points: number;
  computed_economy_rate: number | null;
  legal_balls_bowled: number;
  fielding_catch_points: number;
  fielding_catch_haul_bonus: number;
  fielding_stumping_points: number;
  fielding_run_out_points: number;
  batting_subtotal: number;
  bowling_subtotal: number;
  fielding_subtotal: number;
  dream11_raw_base_points: number;
  crex_dot_ball_bonus_points: number;
  crex_raw_base_points: number;
  applied_multiplier: number;
  dream11_final_points: number;
  crex_final_points: number;
}

export interface DualScoringReconciliationResult {
  player_id: string;
  player_name: string;
  dream11_base_points: number;
  dream11_multiplied_points: number;
  crex_base_points: number;
  crex_multiplied_points: number;
  dot_ball_delta: number;
  reconciled_100_pct: boolean;
  breakdown: PlayerFantasyPointsBreakdown;
}

export interface TeamFantasyScoreSummary {
  rule_version: string;
  captain_id: string;
  vice_captain_id: string;
  dream11_team_total: number;
  crex_team_total: number;
  player_breakdowns: PlayerFantasyPointsBreakdown[];
}

export function convertCricketOversToLegalBalls(oversInput: number): number {
  if (oversInput <= 0) return 0;
  const wholeOvers = Math.floor(oversInput + 1e-6);
  const ballsRemainder = Math.round((oversInput - wholeOvers) * 10);

  if (ballsRemainder >= 0 && ballsRemainder <= 5) {
    return wholeOvers * 6 + ballsRemainder;
  }

  return Math.round(oversInput * 6);
}

function evaluateBattingMilestoneBonus(
  runs: number,
  rules: Dream11RulesConfig
): number {
  const m = rules.batting.milestones;
  if (runs >= 100) return m.runs_100_bonus;
  if (runs >= 75) return m.runs_75_bonus;
  if (runs >= 50) return m.runs_50_bonus;
  if (runs >= 25) return m.runs_25_bonus;
  return 0;
}

function evaluateBowlingHaulBonus(
  wickets: number,
  rules: Dream11RulesConfig
): number {
  const h = rules.bowling.hauls;
  if (wickets >= 5) return h.wickets_5_bonus;
  if (wickets === 4) return h.wickets_4_bonus;
  if (wickets === 3) return h.wickets_3_bonus;
  return 0;
}

function evaluateEconomyRatePoints(
  runsConceded: number,
  legalBallsBowled: number,
  rules: Dream11RulesConfig
): { economyRate: number | null; points: number } {
  if (legalBallsBowled < rules.economy_rate.min_balls_bowled) {
    const partialEco =
      legalBallsBowled > 0
        ? Number(((runsConceded / legalBallsBowled) * 6).toFixed(2))
        : null;
    return { economyRate: partialEco, points: 0 };
  }

  const exactEconomy = (runsConceded / legalBallsBowled) * 6;
  const roundedEconomy = Number(exactEconomy.toFixed(2));

  if (roundedEconomy < 5.0) {
    return { economyRate: roundedEconomy, points: 6 };
  }
  if (roundedEconomy >= 5.0 && roundedEconomy <= 5.99) {
    return { economyRate: roundedEconomy, points: 4 };
  }
  if (roundedEconomy >= 6.0 && roundedEconomy <= 7.0) {
    return { economyRate: roundedEconomy, points: 2 };
  }
  if (roundedEconomy >= 10.0 && roundedEconomy <= 11.0) {
    return { economyRate: roundedEconomy, points: -2 };
  }
  if (roundedEconomy > 11.0 && roundedEconomy <= 12.0) {
    return { economyRate: roundedEconomy, points: -4 };
  }
  if (roundedEconomy > 12.0) {
    return { economyRate: roundedEconomy, points: -6 };
  }

  return { economyRate: roundedEconomy, points: 0 };
}

function evaluateStrikeRatePoints(
  runsScored: number,
  ballsFaced: number,
  role: PlayerRole,
  rules: Dream11RulesConfig
): { strikeRate: number | null; points: number } {
  const partialSr =
    ballsFaced > 0
      ? Number(((runsScored / ballsFaced) * 100).toFixed(2))
      : null;

  if (
    ballsFaced < rules.strike_rate.min_balls_faced ||
    rules.strike_rate.exempt_roles.includes(role)
  ) {
    return { strikeRate: partialSr, points: 0 };
  }

  const roundedSr = Number(((runsScored / ballsFaced) * 100).toFixed(2));

  if (roundedSr > 170.0) {
    return { strikeRate: roundedSr, points: 6 };
  }
  if (roundedSr > 150.0 && roundedSr <= 170.0) {
    return { strikeRate: roundedSr, points: 4 };
  }
  if (roundedSr >= 130.0 && roundedSr <= 150.0) {
    return { strikeRate: roundedSr, points: 2 };
  }
  if (roundedSr >= 60.0 && roundedSr <= 70.0) {
    return { strikeRate: roundedSr, points: -2 };
  }
  if (roundedSr >= 50.0 && roundedSr < 60.0) {
    return { strikeRate: roundedSr, points: -4 };
  }
  if (roundedSr < 50.0) {
    return { strikeRate: roundedSr, points: -6 };
  }

  return { strikeRate: roundedSr, points: 0 };
}

export function calculatePlayerFantasyPoints(
  input: PlayerMatchPerformanceInput,
  rules: Dream11RulesConfig = DREAM11_T20_RULES
): PlayerFantasyPointsBreakdown {
  const isParticipating =
    input.in_starting_xi || Boolean(input.activated_as_impact_sub);

  if (!isParticipating) {
    return {
      player_id: input.player_id,
      player_name: input.player_name,
      role: input.role,
      rule_version: rules.version,
      appearance_points: 0,
      batting_run_points: 0,
      boundary_four_points: 0,
      boundary_six_points: 0,
      batting_milestone_points: 0,
      duck_penalty_points: 0,
      strike_rate_points: 0,
      computed_strike_rate: null,
      wicket_points: 0,
      lbw_bowled_bonus_points: 0,
      bowling_haul_points: 0,
      maiden_over_points: 0,
      economy_rate_points: 0,
      computed_economy_rate: null,
      legal_balls_bowled: 0,
      fielding_catch_points: 0,
      fielding_catch_haul_bonus: 0,
      fielding_stumping_points: 0,
      fielding_run_out_points: 0,
      batting_subtotal: 0,
      bowling_subtotal: 0,
      fielding_subtotal: 0,
      dream11_raw_base_points: 0,
      crex_dot_ball_bonus_points: 0,
      crex_raw_base_points: 0,
      applied_multiplier: 1.0,
      dream11_final_points: 0,
      crex_final_points: 0,
    };
  }

  const appearancePoints = input.in_starting_xi
    ? rules.appearance.playing_xi
    : rules.appearance.impact_substitute_activated;

  const runsScored = Math.max(0, input.runs_scored ?? 0);
  const ballsFaced = Math.max(0, input.balls_faced ?? 0);
  const fours = Math.max(0, input.fours ?? 0);
  const sixes = Math.max(0, input.sixes ?? 0);
  const isDismissed = Boolean(input.is_dismissed);

  const battingRunPoints = runsScored * rules.batting.run;
  const boundaryFourPoints = fours * rules.batting.boundary_four_bonus;
  const boundarySixPoints = sixes * rules.batting.boundary_six_bonus;
  const battingMilestonePoints = evaluateBattingMilestoneBonus(
    runsScored,
    rules
  );

  const isDuckExempt = rules.batting.duck_exempt_roles.includes(input.role);
  const duckPenaltyPoints =
    isDismissed && runsScored === 0 && !isDuckExempt
      ? rules.batting.duck_penalty
      : 0;

  const { strikeRate, points: strikeRatePoints } = evaluateStrikeRatePoints(
    runsScored,
    ballsFaced,
    input.role,
    rules
  );

  const battingSubtotal =
    battingRunPoints +
    boundaryFourPoints +
    boundarySixPoints +
    battingMilestonePoints +
    duckPenaltyPoints +
    strikeRatePoints;

  const legalBallsBowled =
    typeof input.balls_bowled === "number"
      ? Math.max(0, input.balls_bowled)
      : convertCricketOversToLegalBalls(input.overs_bowled ?? 0);

  const maidens = Math.max(0, input.maidens ?? 0);
  const runsConceded = Math.max(0, input.runs_conceded ?? 0);
  const wicketsTaken = Math.max(0, input.wickets_taken ?? 0);
  const lbwOrBowledWickets = Math.min(
    wicketsTaken,
    Math.max(0, input.lbw_or_bowled_wickets ?? 0)
  );
  const dotBallsBowled = Math.max(0, input.dot_balls_bowled ?? 0);

  const wicketPoints = wicketsTaken * rules.bowling.wicket_excluding_run_out;
  const lbwBowledBonusPoints =
    lbwOrBowledWickets * rules.bowling.lbw_or_bowled_bonus;
  const bowlingHaulPoints = evaluateBowlingHaulBonus(wicketsTaken, rules);
  const maidenOverPoints = maidens * rules.bowling.maiden_over;

  const { economyRate, points: economyRatePoints } =
    evaluateEconomyRatePoints(runsConceded, legalBallsBowled, rules);

  const bowlingSubtotal =
    wicketPoints +
    lbwBowledBonusPoints +
    bowlingHaulPoints +
    maidenOverPoints +
    economyRatePoints;

  const catches = Math.max(0, input.catches ?? 0);
  const stumpings = Math.max(0, input.stumpings ?? 0);
  const runOutsDirect = Math.max(0, input.run_outs_direct ?? 0);
  const runOutsIndirect = Math.max(0, input.run_outs_indirect ?? 0);

  const fieldingCatchPoints = catches * rules.fielding.catch;
  const fieldingCatchHaulBonus =
    catches >= 3 ? rules.fielding.three_catches_haul_bonus : 0;
  const fieldingStumpingPoints = stumpings * rules.fielding.stumping;
  const fieldingRunOutPoints =
    runOutsDirect * rules.fielding.run_out_direct_hit +
    runOutsIndirect * rules.fielding.run_out_indirect;

  const fieldingSubtotal =
    fieldingCatchPoints +
    fieldingCatchHaulBonus +
    fieldingStumpingPoints +
    fieldingRunOutPoints;

  const dream11RawBasePoints =
    appearancePoints + battingSubtotal + bowlingSubtotal + fieldingSubtotal;

  const crexDotBallBonusPoints =
    dotBallsBowled * rules.bowling.crex_dot_ball_bonus;
  const crexRawBasePoints = dream11RawBasePoints + crexDotBallBonusPoints;

  const appliedMultiplier =
    input.multiplier_role === "CAPTAIN"
      ? rules.multipliers.captain
      : input.multiplier_role === "VICE_CAPTAIN"
        ? rules.multipliers.vice_captain
        : rules.multipliers.normal;

  const dream11FinalPoints = Number(
    (dream11RawBasePoints * appliedMultiplier).toFixed(2)
  );
  const crexFinalPoints = Number(
    (crexRawBasePoints * appliedMultiplier).toFixed(2)
  );

  return {
    player_id: input.player_id,
    player_name: input.player_name,
    role: input.role,
    rule_version: rules.version,
    appearance_points: appearancePoints,
    batting_run_points: battingRunPoints,
    boundary_four_points: boundaryFourPoints,
    boundary_six_points: boundarySixPoints,
    batting_milestone_points: battingMilestonePoints,
    duck_penalty_points: duckPenaltyPoints,
    strike_rate_points: strikeRatePoints,
    computed_strike_rate: strikeRate,
    wicket_points: wicketPoints,
    lbw_bowled_bonus_points: lbwBowledBonusPoints,
    bowling_haul_points: bowlingHaulPoints,
    maiden_over_points: maidenOverPoints,
    economy_rate_points: economyRatePoints,
    computed_economy_rate: economyRate,
    legal_balls_bowled: legalBallsBowled,
    fielding_catch_points: fieldingCatchPoints,
    fielding_catch_haul_bonus: fieldingCatchHaulBonus,
    fielding_stumping_points: fieldingStumpingPoints,
    fielding_run_out_points: fieldingRunOutPoints,
    batting_subtotal: battingSubtotal,
    bowling_subtotal: bowlingSubtotal,
    fielding_subtotal: fieldingSubtotal,
    dream11_raw_base_points: dream11RawBasePoints,
    crex_dot_ball_bonus_points: crexDotBallBonusPoints,
    crex_raw_base_points: crexRawBasePoints,
    applied_multiplier: appliedMultiplier,
    dream11_final_points: dream11FinalPoints,
    crex_final_points: crexFinalPoints,
  };
}

export function reconcileDream11AndCrexScore(
  input: PlayerMatchPerformanceInput,
  rules: Dream11RulesConfig = DREAM11_T20_RULES
): DualScoringReconciliationResult {
  const breakdown = calculatePlayerFantasyPoints(input, rules);
  const expectedDotDelta =
    breakdown.crex_dot_ball_bonus_points * breakdown.applied_multiplier;
  const actualDelta = Number(
    (breakdown.crex_final_points - breakdown.dream11_final_points).toFixed(2)
  );

  return {
    player_id: input.player_id,
    player_name: input.player_name,
    dream11_base_points: breakdown.dream11_raw_base_points,
    dream11_multiplied_points: breakdown.dream11_final_points,
    crex_base_points: breakdown.crex_raw_base_points,
    crex_multiplied_points: breakdown.crex_final_points,
    dot_ball_delta: actualDelta,
    reconciled_100_pct: Math.abs(actualDelta - expectedDotDelta) < 1e-6,
    breakdown,
  };
}

export function calculateFullTeamFantasyScore(
  players: readonly PlayerMatchPerformanceInput[],
  captainId: string,
  viceCaptainId: string,
  rules: Dream11RulesConfig = DREAM11_T20_RULES
): TeamFantasyScoreSummary {
  const breakdowns: PlayerFantasyPointsBreakdown[] = players.map((p) => {
    const multiplierRole =
      p.player_id === captainId
        ? "CAPTAIN"
        : p.player_id === viceCaptainId
          ? "VICE_CAPTAIN"
          : "NONE";

    return calculatePlayerFantasyPoints(
      {
        ...p,
        multiplier_role: multiplierRole,
      },
      rules
    );
  });

  const dream11TeamTotal = Number(
    breakdowns
      .reduce((sum, b) => sum + b.dream11_final_points, 0)
      .toFixed(2)
  );

  const crexTeamTotal = Number(
    breakdowns.reduce((sum, b) => sum + b.crex_final_points, 0).toFixed(2)
  );

  return {
    rule_version: rules.version,
    captain_id: captainId,
    vice_captain_id: viceCaptainId,
    dream11_team_total: dream11TeamTotal,
    crex_team_total: crexTeamTotal,
    player_breakdowns: breakdowns,
  };
}
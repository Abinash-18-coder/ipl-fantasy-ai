import { NextResponse } from "next/server";
import {
  calculateFullTeamFantasyScore,
  DREAM11_T20_RULES,
  reconcileDream11AndCrexScore,
  type PlayerMatchPerformanceInput,
} from "@/lib/fantasy/rulesEngine";

const SAMPLE_MATCH_PERFORMANCES: readonly PlayerMatchPerformanceInput[] = [
  {
    player_id: "mi-suryakumar-yadav",
    player_name: "Suryakumar Yadav",
    role: "BAT",
    in_starting_xi: true,
    runs_scored: 74,
    balls_faced: 38,
    fours: 6,
    sixes: 5,
    is_dismissed: false,
    catches: 1,
  },
  {
    player_id: "csk-matheesha-pathirana",
    player_name: "Matheesha Pathirana",
    role: "BOWL",
    in_starting_xi: true,
    overs_bowled: 4.0,
    maidens: 0,
    runs_conceded: 32,
    wickets_taken: 3,
    lbw_or_bowled_wickets: 2,
    dot_balls_bowled: 11,
  },
  {
    player_id: "csk-ruturaj-gaikwad",
    player_name: "Ruturaj Gaikwad",
    role: "BAT",
    in_starting_xi: true,
    runs_scored: 68,
    balls_faced: 44,
    fours: 7,
    sixes: 3,
    is_dismissed: false,
    catches: 1,
  },
  {
    player_id: "mi-hardik-pandya",
    player_name: "Hardik Pandya",
    role: "ALL",
    in_starting_xi: true,
    runs_scored: 39,
    balls_faced: 19,
    fours: 2,
    sixes: 4,
    is_dismissed: false,
    overs_bowled: 3.0,
    runs_conceded: 35,
    wickets_taken: 1,
    lbw_or_bowled_wickets: 0,
    dot_balls_bowled: 5,
  },
  {
    player_id: "mi-jasprit-bumrah",
    player_name: "Jasprit Bumrah",
    role: "BOWL",
    in_starting_xi: true,
    overs_bowled: 4.0,
    maidens: 1,
    runs_conceded: 19,
    wickets_taken: 2,
    lbw_or_bowled_wickets: 1,
    dot_balls_bowled: 15,
  },
];

export async function GET() {
  const teamSummary = calculateFullTeamFantasyScore(
    SAMPLE_MATCH_PERFORMANCES,
    "mi-suryakumar-yadav",
    "csk-matheesha-pathirana"
  );

  const reconciliations = SAMPLE_MATCH_PERFORMANCES.map((perf) =>
    reconcileDream11AndCrexScore(perf)
  );

  return NextResponse.json(
    {
      ok: true,
      rule_version: DREAM11_T20_RULES.version,
      reverify_before: DREAM11_T20_RULES.reverify_before,
      rules_table: DREAM11_T20_RULES,
      team_summary: teamSummary,
      dual_reconciliations: reconciliations,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-CricIntel-Rules-Version": DREAM11_T20_RULES.version,
      },
    }
  );
}
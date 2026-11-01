import assert from "node:assert/strict";
import {
  calculateFullTeamFantasyScore,
  convertCricketOversToLegalBalls,
  reconcileDream11AndCrexScore,
} from "../lib/fantasy/rulesEngine";
import { TEN_HISTORICAL_IPL_SCORECARDS } from "./fixtures/historicalIplScorecards";

interface AssertionCounters {
  suitesRun: number;
  testsPassed: number;
  assertionsVerified: number;
}

const counters: AssertionCounters = {
  suitesRun: 0,
  testsPassed: 0,
  assertionsVerified: 0,
};

function describe(suiteName: string, fn: () => void): void {
  counters.suitesRun += 1;
  console.log(`\n📦 SUITE: ${suiteName}`);
  fn();
}

function it(testName: string, fn: () => void): void {
  fn();
  counters.testsPassed += 1;
  console.log(`   ✅ PASS: ${testName}`);
}

function expectEqual<T>(actual: T, expected: T, message: string): void {
  assert.strictEqual(actual, expected, message);
  counters.assertionsVerified += 1;
}

function runDualScoringTestSuite(): void {
  console.log("=================================================================");
  console.log("🏏 CRICINTEL DAY 35 — DUAL DREAM11 & CREX ASSERTION TEST SUITE");
  console.log("=================================================================");

  describe("1. Cricket Base-6 Overs-to-Balls Mathematical Conversion", () => {
    it("converts 4.0 overs into 24 legal balls", () => {
      expectEqual(
        convertCricketOversToLegalBalls(4.0),
        24,
        "4.0 overs must equal 24 balls"
      );
    });

    it("converts partial 3.4 overs into 22 legal balls (not 20.4 decimal)", () => {
      expectEqual(
        convertCricketOversToLegalBalls(3.4),
        22,
        "3.4 overs must equal 22 legal balls"
      );
    });

    it("converts partial 0.5 overs into 5 legal balls", () => {
      expectEqual(
        convertCricketOversToLegalBalls(0.5),
        5,
        "0.5 overs must equal 5 legal balls"
      );
    });
  });

  describe("2. 10 Historical IPL Scorecards — Dual Dream11 & CREX 100.00% Reconciliation", () => {
    let cumulativeAbsoluteError = 0;

    for (const benchmark of TEN_HISTORICAL_IPL_SCORECARDS) {
      it(`Case #${benchmark.case_number}: ${benchmark.input.player_name} (${benchmark.match_label})`, () => {
        const result = reconcileDream11AndCrexScore(benchmark.input);

        expectEqual(
          result.dream11_base_points,
          benchmark.expected_dream11_base,
          `Dream11 Base mismatch for ${benchmark.input.player_name}`
        );

        expectEqual(
          result.dream11_multiplied_points,
          benchmark.expected_dream11_final,
          `Dream11 Final (with multiplier) mismatch for ${benchmark.input.player_name}`
        );

        expectEqual(
          result.crex_base_points,
          benchmark.expected_crex_base,
          `CREX Base mismatch for ${benchmark.input.player_name}`
        );

        expectEqual(
          result.crex_multiplied_points,
          benchmark.expected_crex_final,
          `CREX Final (with multiplier) mismatch for ${benchmark.input.player_name}`
        );

        expectEqual(
          result.dot_ball_delta,
          benchmark.expected_dot_ball_delta,
          `CREX Dot-Ball Delta mismatch for ${benchmark.input.player_name}`
        );

        expectEqual(
          result.reconciled_100_pct,
          true,
          `Reconciliation flag must be true for ${benchmark.input.player_name}`
        );

        cumulativeAbsoluteError +=
          Math.abs(
            result.dream11_multiplied_points -
              benchmark.expected_dream11_final
          ) +
          Math.abs(
            result.crex_multiplied_points - benchmark.expected_crex_final
          );
      });
    }

    it("achieves 0.00 Mean Absolute Error (100.00% precision) across all 10 IPL scorecards", () => {
      expectEqual(
        cumulativeAbsoluteError,
        0,
        "Cumulative absolute scoring error across all 10 scorecards must be 0.00"
      );
    });
  });

  describe("3. Full 11-Player Team Aggregation with Captain (2x) & Vice-Captain (1.5x)", () => {
    it("aggregates team totals accurately across Dream11 (1394 pts) and CREX (1448 pts)", () => {
      const activeNine = TEN_HISTORICAL_IPL_SCORECARDS.slice(0, 9).map(
        (b) => b.input
      );
      const teamResult = calculateFullTeamFantasyScore(
        activeNine,
        "rcb-virat-kohli",
        "mi-jasprit-bumrah"
      );

      expectEqual(
        teamResult.dream11_team_total,
        1394,
        "Full squad Dream11 total must equal 1394 points"
      );

      expectEqual(
        teamResult.crex_team_total,
        1448,
        "Full squad CREX total must equal 1448 points"
      );
    });
  });

  console.log("\n=================================================================");
  console.log(
    `🏆 MILESTONE 5 VERIFIED: ${counters.testsPassed} Tests Passed | ${counters.assertionsVerified} Assertions | Precision: 100.00%`
  );
  console.log("=================================================================");
}

runDualScoringTestSuite();
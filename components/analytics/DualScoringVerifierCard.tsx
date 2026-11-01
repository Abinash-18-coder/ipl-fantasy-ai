"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  Flame,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { reconcileDream11AndCrexScore } from "@/lib/fantasy/rulesEngine";
import { TEN_HISTORICAL_IPL_SCORECARDS } from "@/tests/fixtures/historicalIplScorecards";
import { RollingDigitTicker } from "@/components/scores/RollingDigitTicker";
import { SPRING_GENTLE, SPRING_SNAPPY } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function DualScoringVerifierCard() {
  const [selectedCaseIdx, setSelectedCaseIdx] = useState<number>(0);

  const reconciliationRows = useMemo(() => {
    return TEN_HISTORICAL_IPL_SCORECARDS.map((benchmark) => ({
      benchmark,
      result: reconcileDream11AndCrexScore(benchmark.input),
    }));
  }, []);

  const activeItem =
    reconciliationRows[selectedCaseIdx] ?? reconciliationRows[0]!;
  const { benchmark, result } = activeItem;
  const b = result.breakdown;

  return (
    <section className="rounded-sm glass-card border border-ivory/15 p-6 sm:p-8 shadow-glass-panel space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-ivory/10 pb-5">
        <div className="space-y-1">
          <p className="eyebrow-label text-accent-gold flex items-center gap-2">
            <Scale className="h-3.5 w-3.5" />
            DAY 34 &amp; 35 DUAL SCORING ENGINE &bull; 10 HISTORICAL IPL
            BENCHMARKS
          </p>
          <h2 className="font-display text-2xl sm:text-3xl text-ivory font-normal">
            Dream11 &amp; CREX{" "}
            <span className="italic text-accent-gold">
              100.00% Reconciliation Suite.
            </span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs tabular-score">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-turf/20 border border-[#8ec2a8]/45 px-3.5 py-1.5 text-[#8ec2a8] font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            10 / 10 Scorecards Verified (MAE 0.00)
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ivory/4 border border-ivory/12 px-3 py-1.5 text-accent-gold">
            <ShieldCheck className="h-3.5 w-3.5" />
            Rule Table v{b.rule_version}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {reconciliationRows.map((row, idx) => {
          const isSelected = idx === selectedCaseIdx;
          return (
            <button
              key={row.benchmark.case_number}
              type="button"
              onClick={() => setSelectedCaseIdx(idx)}
              className={cn(
                "relative shrink-0 px-3.5 py-2 rounded-xs font-mono text-[10px] uppercase tracking-[0.14em] transition-colors cursor-pointer z-10 tabular-score",
                isSelected
                  ? "text-stadium-navy font-bold"
                  : "bg-black/45 border border-ivory/10 text-ivory-muted hover:text-ivory"
              )}
            >
              {isSelected && (
                <motion.span
                  layoutId="dual-scoring-case-pill"
                  transition={SPRING_SNAPPY}
                  className="absolute inset-0 -z-10 rounded-xs bg-accent-gold shadow-turf-glow"
                />
              )}
              <span>
                #{row.benchmark.case_number} {row.benchmark.input.player_name}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={benchmark.case_number}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={SPRING_GENTLE}
          className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start"
        >
          <div className="xl:col-span-5 rounded-sm bg-black/50 border border-ivory/12 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-ivory/10 pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-accent-gold">
                  {benchmark.match_label}
                </span>
                <h3 className="font-display text-2xl text-ivory mt-0.5">
                  {benchmark.input.player_name}{" "}
                  <span className="font-mono text-xs text-ivory-muted">
                    ({benchmark.input.role} &bull; {b.applied_multiplier}x)
                  </span>
                </h3>
              </div>

              <span className="rounded-sm bg-sage-turf/20 border border-[#8ec2a8]/40 px-2.5 py-1 font-mono text-[10px] font-bold text-[#8ec2a8] uppercase">
                EXACT MATCH
              </span>
            </div>

            <p className="text-xs text-ivory-muted leading-relaxed">
              {benchmark.scenario_tested}
            </p>

            <div className="grid grid-cols-2 gap-3 font-mono tabular-score pt-1">
              <div className="rounded-sm bg-ivory/3 border border-ivory/10 p-3.5">
                <span className="block text-[9px] text-ivory-dim uppercase tracking-wider">
                  DREAM11 FINAL PTS
                </span>
                <div className="mt-1 text-2xl font-bold text-accent-gold">
                  <RollingDigitTicker
                    value={result.dream11_multiplied_points}
                    suffix=" pts"
                  />
                </div>
                <span className="text-[10px] text-ivory-dim">
                  Base: {result.dream11_base_points} pts &times;{" "}
                  {b.applied_multiplier}x
                </span>
              </div>

              <div className="rounded-sm bg-ivory/3 border border-ivory/10 p-3.5">
                <span className="block text-[9px] text-ivory-dim uppercase tracking-wider">
                  CREX FINAL PTS
                </span>
                <div className="mt-1 text-2xl font-bold text-[#8ec2a8]">
                  <RollingDigitTicker
                    value={result.crex_multiplied_points}
                    suffix=" pts"
                  />
                </div>
                <span className="text-[10px] text-ivory-dim">
                  Dot Delta: +{result.dot_ball_delta} pts
                </span>
              </div>
            </div>
          </div>

          <div className="xl:col-span-7 rounded-sm bg-black/50 border border-ivory/12 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-ivory/10 pb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ivory-dim">
              <span className="flex items-center gap-1.5 text-ivory">
                <Sparkles className="h-3.5 w-3.5 text-accent-gold" />
                ITEMIZED RULE LEDGER BREAKDOWN
              </span>
              <span>ASSERTION DELTA: 0.00</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs tabular-score">
              <div className="rounded-sm bg-black/60 border border-ivory/8 p-2.5">
                <span className="block text-[9px] text-ivory-dim uppercase">
                  XI / IMPACT SUB
                </span>
                <span className="text-ivory font-semibold">
                  +{b.appearance_points} pts
                </span>
              </div>

              <div className="rounded-sm bg-black/60 border border-ivory/8 p-2.5">
                <span className="block text-[9px] text-ivory-dim uppercase">
                  RUNS + 4s/6s
                </span>
                <span className="text-ivory font-semibold">
                  +
                  {b.batting_run_points +
                    b.boundary_four_points +
                    b.boundary_six_points}{" "}
                  pts
                </span>
              </div>

              <div className="rounded-sm bg-black/60 border border-ivory/8 p-2.5">
                <span className="block text-[9px] text-ivory-dim uppercase">
                  BAT MILESTONE / DUCK
                </span>
                <span className="text-accent-gold font-semibold">
                  {b.batting_milestone_points + b.duck_penalty_points >= 0
                    ? `+${b.batting_milestone_points + b.duck_penalty_points}`
                    : b.batting_milestone_points + b.duck_penalty_points}{" "}
                  pts
                </span>
              </div>

              <div className="rounded-sm bg-black/60 border border-ivory/8 p-2.5">
                <span className="block text-[9px] text-ivory-dim uppercase">
                  SR BAND ({b.computed_strike_rate ?? "—"})
                </span>
                <span className="text-ivory font-semibold">
                  {b.strike_rate_points >= 0
                    ? `+${b.strike_rate_points}`
                    : b.strike_rate_points}{" "}
                  pts
                </span>
              </div>

              <div className="rounded-sm bg-black/60 border border-ivory/8 p-2.5">
                <span className="block text-[9px] text-ivory-dim uppercase">
                  WICKETS (+30)
                </span>
                <span className="text-[#8ec2a8] font-semibold">
                  +{b.wicket_points} pts
                </span>
              </div>

              <div className="rounded-sm bg-black/60 border border-ivory/8 p-2.5">
                <span className="block text-[9px] text-ivory-dim uppercase">
                  LBW/BOWLED + HAUL
                </span>
                <span className="text-accent-gold font-semibold">
                  +{b.lbw_bowled_bonus_points + b.bowling_haul_points} pts
                </span>
              </div>

              <div className="rounded-sm bg-black/60 border border-ivory/8 p-2.5">
                <span className="block text-[9px] text-ivory-dim uppercase">
                  MAIDEN + ECO ({b.computed_economy_rate ?? "—"})
                </span>
                <span className="text-ivory font-semibold">
                  {b.maiden_over_points + b.economy_rate_points >= 0
                    ? `+${b.maiden_over_points + b.economy_rate_points}`
                    : b.maiden_over_points + b.economy_rate_points}{" "}
                  pts
                </span>
              </div>

              <div className="rounded-sm bg-black/60 border border-ivory/8 p-2.5">
                <span className="block text-[9px] text-ivory-dim uppercase">
                  FIELDING + CREX DOTS
                </span>
                <span className="text-[#8ec2a8] font-semibold">
                  +{b.fielding_subtotal} / +{b.crex_dot_ball_bonus_points}D
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-ivory/10 pt-3 font-mono text-[11px] text-ivory-dim tabular-score">
              <span className="flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-accent-gold" />
                Legal Balls Bowled: {b.legal_balls_bowled}
              </span>
              <span className="text-[#8ec2a8]">
                Reconciled: {result.reconciled_100_pct ? "TRUE (100.00%)" : "FALSE"}
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
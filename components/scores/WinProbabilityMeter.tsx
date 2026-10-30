"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  Flame,
  MessageSquareText,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { getFranchiseTheme } from "@/lib/theme/franchiseTheme";
import { RollingDigitTicker } from "@/components/scores/RollingDigitTicker";
import { SPRING_GENTLE, SPRING_SNAPPY } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { BallDeliveryEvent, FranchiseCode } from "@/types";

export interface WinProbabilityMeterProps {
  homeCode: FranchiseCode;
  awayCode: FranchiseCode;
  liveDeliveries: BallDeliveryEvent[];
  runsNeeded: number;
  ballsRemaining: number;
  wicketsLost: number;
  dewIndex: number;
}

type CommentaryFilter = "ALL" | "BOUNDARIES" | "WICKETS" | "HIGH_SWING";

interface EnrichedCommentaryItem extends BallDeliveryEvent {
  winSwingPct: number;
  favoredCode: FranchiseCode;
  fantasyDeltaLabel: string;
  bowlerToBatter: string;
  tacticalNote: string;
}

const BASE_COMMENTARY_ARCHIVE: readonly BallDeliveryEvent[] = [
  {
    ball_id: "14.4",
    over_number: 15,
    ball_in_over: 4,
    label: "4",
    runs_scored: 4,
    is_boundary_four: true,
    is_boundary_six: false,
    is_wicket: false,
    is_extra: false,
    commentary_short:
      "Boult to Jadeja, FOUR! Short and wide outside off, Jadeja cuts fiercely backward of point for a boundary.",
  },
  {
    ball_id: "14.5",
    over_number: 15,
    ball_in_over: 5,
    label: "1",
    runs_scored: 1,
    is_boundary_four: false,
    is_boundary_six: false,
    is_wicket: false,
    is_extra: false,
    commentary_short:
      "Boult to Jadeja, 1 run, pinpoint yorker on middle stump, dug out cleanly down to long-on.",
  },
  {
    ball_id: "14.6",
    over_number: 15,
    ball_in_over: 6,
    label: "1",
    runs_scored: 1,
    is_boundary_four: false,
    is_boundary_six: false,
    is_wicket: false,
    is_extra: false,
    commentary_short:
      "Boult to Gaikwad, 1 run, angled into the pads, clipped calmly to deep square leg to keep strike.",
  },
];

function clampProbability(value: number): number {
  return Math.min(98.5, Math.max(1.5, Number(value.toFixed(1))));
}

function computeWinProbabilities(
  runsNeeded: number,
  ballsRemaining: number,
  wicketsLost: number,
  dewIndex: number
): { homeWinPct: number; awayWinPct: number } {
  if (runsNeeded <= 0) {
    return { homeWinPct: 0.0, awayWinPct: 100.0 };
  }
  if (wicketsLost >= 10 || (ballsRemaining <= 0 && runsNeeded > 0)) {
    return { homeWinPct: 100.0, awayWinPct: 0.0 };
  }

  const rrr = (runsNeeded / Math.max(1, ballsRemaining)) * 6;
  const wicketsInHand = 10 - wicketsLost;

  const rrrPressure = (rrr - 9.6) * 6.2;
  const wicketCushion = (wicketsInHand - 6) * 4.5;
  const dewAdvantage = (dewIndex - 65) * 0.18;

  const rawAwayPct = 50 - rrrPressure + wicketCushion + dewAdvantage;
  const awayWinPct = clampProbability(rawAwayPct);
  const homeWinPct = Number((100 - awayWinPct).toFixed(1));

  return { homeWinPct, awayWinPct };
}

export function WinProbabilityMeter({
  homeCode,
  awayCode,
  liveDeliveries,
  runsNeeded,
  ballsRemaining,
  wicketsLost,
  dewIndex,
}: WinProbabilityMeterProps) {
  const [filter, setFilter] = useState<CommentaryFilter>("ALL");

  const homeSpec = getFranchiseTheme(homeCode);
  const awaySpec = getFranchiseTheme(awayCode);

  const { homeWinPct, awayWinPct } = useMemo(
    () =>
      computeWinProbabilities(
        runsNeeded,
        ballsRemaining,
        wicketsLost,
        dewIndex
      ),
    [runsNeeded, ballsRemaining, wicketsLost, dewIndex]
  );

  const enrichedCommentary = useMemo<EnrichedCommentaryItem[]>(() => {
    const combined = [...BASE_COMMENTARY_ARCHIVE, ...liveDeliveries];

    return combined
      .map((ball, index) => {
        if (ball.is_wicket) {
          return {
            ...ball,
            winSwingPct: 8.4,
            favoredCode: homeCode,
            fantasyDeltaLabel: "+25 Pts (Wicket)",
            bowlerToBatter: `Delivery #${index + 1} • Breakthrough`,
            tacticalNote:
              "Seam movement off the pitch forces a false stroke; defending bowling side surges ahead.",
          };
        }
        if (ball.is_boundary_six) {
          return {
            ...ball,
            winSwingPct: 6.8,
            favoredCode: awayCode,
            fantasyDeltaLabel: "+8 Pts (6 + Bonus)",
            bowlerToBatter: `Delivery #${index + 1} • Maximum`,
            tacticalNote:
              "Evening dew skids the ball into the hitting arc; required run rate drops sharply.",
          };
        }
        if (ball.is_boundary_four) {
          return {
            ...ball,
            winSwingPct: 4.2,
            favoredCode: awayCode,
            fantasyDeltaLabel: "+5 Pts (4 + Bonus)",
            bowlerToBatter: `Delivery #${index + 1} • Boundary`,
            tacticalNote:
              "Crisp placement pierces the 30-yard ring and releases dot-ball pressure.",
          };
        }
        if (ball.runs_scored === 0) {
          return {
            ...ball,
            winSwingPct: 2.1,
            favoredCode: homeCode,
            fantasyDeltaLabel: "+1 Pt (Dot Ball)",
            bowlerToBatter: `Delivery #${index + 1} • Dot Ball`,
            tacticalNote:
              "Heavy yorker length denies leverage; climbs the required run rate.",
          };
        }
        return {
          ...ball,
          winSwingPct: 1.1,
          favoredCode: awayCode,
          fantasyDeltaLabel: `+${ball.runs_scored} Pt(s) (Run)`,
          bowlerToBatter: `Delivery #${index + 1} • Strike Rotation`,
          tacticalNote:
            " Controlled wrist-work rotates the strike to keep the scoreboard ticking.",
        };
      })
      .reverse();
  }, [liveDeliveries, homeCode, awayCode]);

  const filteredStream = useMemo(() => {
    if (filter === "BOUNDARIES") {
      return enrichedCommentary.filter(
        (item) => item.is_boundary_four || item.is_boundary_six
      );
    }
    if (filter === "WICKETS") {
      return enrichedCommentary.filter((item) => item.is_wicket);
    }
    if (filter === "HIGH_SWING") {
      return enrichedCommentary.filter((item) => item.winSwingPct >= 4.0);
    }
    return enrichedCommentary;
  }, [enrichedCommentary, filter]);

  const momentumPoints = useMemo(() => {
    const baseline = [52, 48, 55, 61, 53, 47, 56, awayWinPct];
    return baseline
      .map((val, idx) => {
        const x = (idx / (baseline.length - 1)) * 400;
        const y = 100 - ((val - 20) / 60) * 80;
        return `${x.toFixed(1)},${Math.min(92, Math.max(8, y)).toFixed(1)}`;
      })
      .join(" ");
  }, [awayWinPct]);

  return (
    <section className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      <div className="xl:col-span-5 rounded-sm glass-card border border-ivory/15 p-6 sm:p-8 shadow-glass-panel space-y-6">
        <div className="flex items-center justify-between border-b border-ivory/10 pb-4">
          <div className="space-y-1">
            <p className="eyebrow-label text-accent-gold flex items-center gap-2">
              <Activity className="h-3.5 w-3.5" />
              MONTE CARLO WIN PROBABILITY
            </p>
            <h2 className="font-display text-2xl sm:text-3xl text-ivory font-normal">
              Live Victory{" "}
              <span className="italic text-accent-gold">Pendulum.</span>
            </h2>
          </div>

          <span className="rounded-full bg-ivory/4 border border-ivory/12 px-3 py-1 font-mono text-[10px] text-accent-gold uppercase tracking-wider tabular-score">
            Dew-Adjusted
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div className="space-y-0.5">
              <span
                className="font-mono text-[10px] uppercase tracking-[0.2em] font-semibold"
                style={{ color: homeSpec.primaryHex }}
              >
                {homeSpec.code} (DEFENDING)
              </span>
              <div className="font-mono text-2xl sm:text-3xl font-bold text-ivory tabular-score">
                <RollingDigitTicker value={homeWinPct.toFixed(1)} suffix="%" />
              </div>
            </div>

            <div className="text-right space-y-0.5">
              <span
                className="font-mono text-[10px] uppercase tracking-[0.2em] font-semibold"
                style={{ color: awaySpec.primaryHex }}
              >
                {awaySpec.code} (CHASING)
              </span>
              <div className="font-mono text-2xl sm:text-3xl font-bold text-[#8ec2a8] tabular-score">
                <RollingDigitTicker value={awayWinPct.toFixed(1)} suffix="%" />
              </div>
            </div>
          </div>

          <div className="relative h-4 w-full overflow-hidden rounded-full bg-black/60 border border-ivory/15 flex">
            <motion.div
              animate={{ width: `${homeWinPct}%` }}
              transition={SPRING_GENTLE}
              style={{ backgroundColor: homeSpec.primaryHex }}
              className="h-full transition-colors duration-500"
            />
            <div className="w-0.5 h-full bg-ivory z-10 shrink-0 shadow-gold-glow" />
            <motion.div
              animate={{ width: `${awayWinPct}%` }}
              transition={SPRING_GENTLE}
              style={{ backgroundColor: awaySpec.primaryHex }}
              className="h-full transition-colors duration-500"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-ivory-dim tabular-score pt-1">
            <span>Wickets Lost: {wicketsLost}/10</span>
            <span>Dew Factor: {dewIndex}/100</span>
          </div>
        </div>

        <div className="rounded-sm bg-black/45 border border-ivory/10 p-4 space-y-3">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.18em] text-ivory-muted">
            <span>OVER-BY-OVER MOMENTUM WAVE</span>
            <span className="text-accent-gold flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {awayWinPct >= 50
                ? `${awaySpec.code} Momentum Surge`
                : `${homeSpec.code} Bowling Squeeze`}
            </span>
          </div>

          <svg
            viewBox="0 0 400 100"
            className="w-full h-24 overflow-visible"
            aria-label="Match Momentum Curve"
          >
            <line
              x1="0"
              y1="50"
              x2="400"
              y2="50"
              stroke="rgba(244,241,234,0.12)"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
            <polyline
              fill="none"
              stroke="#c8b273"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={momentumPoints}
            />
          </svg>

          <div className="flex items-center justify-between text-[10px] font-mono text-ivory-dim tabular-score border-t border-ivory/8 pt-2">
            <span>OV 10.0 (50/50 Split)</span>
            <span>LIVE • OV {Math.floor((120 - ballsRemaining) / 6)}.{(120 - ballsRemaining) % 6}</span>
          </div>
        </div>
      </div>

      <div className="xl:col-span-7 rounded-sm glass-card border border-ivory/15 p-6 sm:p-8 shadow-glass-panel space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ivory/10 pb-4">
          <div className="space-y-1">
            <p className="eyebrow-label text-accent-gold flex items-center gap-2">
              <MessageSquareText className="h-3.5 w-3.5" />
              CHRONOLOGICAL BROADCAST FEED &bull; WIN-SHIFT TELEMETRY
            </p>
            <h2 className="font-display text-2xl sm:text-3xl text-ivory font-normal">
              Ball-by-Ball{" "}
              <span className="italic text-accent-gold">Commentary.</span>
            </h2>
          </div>

          <div className="inline-flex items-center gap-1 rounded-sm bg-black/55 p-1 border border-ivory/12 self-start sm:self-auto">
            {(
              [
                { id: "ALL", label: "All" },
                { id: "BOUNDARIES", label: "4s & 6s" },
                { id: "WICKETS", label: "Wickets" },
                { id: "HIGH_SWING", label: "Swing >4%" },
              ] as const
            ).map((tab) => {
              const isSelected = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={cn(
                    "relative px-2.5 py-1.5 text-[10px] uppercase tracking-[0.14em] transition-colors cursor-pointer z-10 rounded-xs",
                    isSelected
                      ? "text-stadium-navy font-bold"
                      : "text-ivory-muted hover:text-ivory"
                  )}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="commentary-filter-pill"
                      transition={SPRING_SNAPPY}
                      className="absolute inset-0 -z-10 rounded-xs bg-accent-gold"
                    />
                  )}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 max-h-105 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {filteredStream.length === 0 ? (
              <p className="py-10 text-center text-xs text-ivory-dim font-mono">
                No deliveries match the active commentary filter.
              </p>
            ) : (
              filteredStream.map((item) => {
                const isPositiveForChase = item.favoredCode === awayCode;

                return (
                  <motion.article
                    key={item.ball_id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={SPRING_GENTLE}
                    className="rounded-sm bg-black/45 border border-ivory/10 hover:border-ivory/25 p-4 transition-colors space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="rounded-sm bg-ivory/6 border border-ivory/12 px-2 py-0.5 font-mono text-xs font-semibold text-ivory tabular-score">
                          {item.over_number - 1}.{item.ball_in_over}
                        </span>

                        <span
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs font-bold border tabular-score",
                            item.is_wicket
                              ? "bg-accent-crimson/30 border-accent-crimson text-[#ffb4b4]"
                              : item.is_boundary_six
                                ? "bg-accent-gold/25 border-accent-gold text-accent-gold"
                                : item.is_boundary_four
                                  ? "bg-sage-turf/25 border-[#8ec2a8] text-[#8ec2a8]"
                                  : "bg-black/60 border-ivory/15 text-ivory-muted"
                          )}
                        >
                          {item.label}
                        </span>

                        <span className="font-mono text-[11px] text-ivory-muted">
                          {item.bowlerToBatter}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-[10px] tabular-score">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 border font-semibold",
                            isPositiveForChase
                              ? "bg-sage-turf/15 border-[#8ec2a8]/40 text-[#8ec2a8]"
                              : "bg-accent-gold/15 border-accent-gold/40 text-accent-gold"
                          )}
                        >
                          {isPositiveForChase ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {item.favoredCode} +{item.winSwingPct.toFixed(1)}% Win
                          Prob
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-sm bg-ivory/4 border border-ivory/10 px-2 py-0.5 text-ivory-muted">
                          <Flame className="h-3 w-3 text-accent-gold" />
                          {item.fantasyDeltaLabel}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-ivory leading-relaxed">
                      {item.commentary_short}
                    </p>

                    <p className="text-[11px] text-ivory-dim italic">
                      {item.tacticalNote}
                    </p>
                  </motion.article>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
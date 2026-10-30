"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Crosshair,
  Flame,
  Gauge,
  Radio,
} from "lucide-react";
import { RollingDigitTicker } from "@/components/scores/RollingDigitTicker";
import { SPRING_GENTLE, SPRING_SNAPPY } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { BallDeliveryEvent, FranchiseCode } from "@/types";

export interface OverTrackerStripProps {
  liveDeliveries: BallDeliveryEvent[];
  currentOverNumber: number;
  currentBowlerName: string;
  battingCode: FranchiseCode;
  bowlingCode: FranchiseCode;
}

interface OverGroupCapsule {
  overNumber: number;
  bowlerName: string;
  phaseLabel: "POWERPLAY" | "MIDDLE OVERS" | "DEATH OVERS";
  isLiveOver: boolean;
  deliveries: BallDeliveryEvent[];
  totalRuns: number;
  totalWickets: number;
}

type OverFilterMode = "ALL" | "BOUNDARIES" | "WICKETS";

const HISTORICAL_OVERS_SEED: readonly Omit<
  OverGroupCapsule,
  "totalRuns" | "totalWickets"
>[] = [
  {
    overNumber: 13,
    bowlerName: "M. Santner",
    phaseLabel: "MIDDLE OVERS",
    isLiveOver: false,
    deliveries: [
      {
        ball_id: "12.1",
        over_number: 13,
        ball_in_over: 1,
        label: "1",
        runs_scored: 1,
        is_boundary_four: false,
        is_boundary_six: false,
        is_wicket: false,
        is_extra: false,
        commentary_short:
          "Santner to Gaikwad, 1 run, flighted on middle, worked to long-on",
      },
      {
        ball_id: "12.2",
        over_number: 13,
        ball_in_over: 2,
        label: "0",
        runs_scored: 0,
        is_boundary_four: false,
        is_boundary_six: false,
        is_wicket: false,
        is_extra: false,
        commentary_short:
          "Santner to Dube, no run, arm-ball skids past the outside edge",
      },
      {
        ball_id: "12.3",
        over_number: 13,
        ball_in_over: 3,
        label: "6",
        runs_scored: 6,
        is_boundary_four: false,
        is_boundary_six: true,
        is_wicket: false,
        is_extra: false,
        commentary_short:
          "Santner to Dube, SIX, monstrous slog-sweep into the second tier!",
      },
      {
        ball_id: "12.4",
        over_number: 13,
        ball_in_over: 4,
        label: "1",
        runs_scored: 1,
        is_boundary_four: false,
        is_boundary_six: false,
        is_wicket: false,
        is_extra: false,
        commentary_short:
          "Santner to Dube, 1 run, punched down the ground to long-off",
      },
      {
        ball_id: "12.5",
        over_number: 13,
        ball_in_over: 5,
        label: "2",
        runs_scored: 2,
        is_boundary_four: false,
        is_boundary_six: false,
        is_wicket: false,
        is_extra: false,
        commentary_short:
          "Santner to Gaikwad, 2 runs, pierced into the deep cover pocket",
      },
      {
        ball_id: "12.6",
        over_number: 13,
        ball_in_over: 6,
        label: "1",
        runs_scored: 1,
        is_boundary_four: false,
        is_boundary_six: false,
        is_wicket: false,
        is_extra: false,
        commentary_short:
          "Santner to Gaikwad, 1 run, retains strike with a nudge to square leg",
      },
    ],
  },
  {
    overNumber: 14,
    bowlerName: "H. Pandya",
    phaseLabel: "MIDDLE OVERS",
    isLiveOver: false,
    deliveries: [
      {
        ball_id: "13.1",
        over_number: 14,
        ball_in_over: 1,
        label: "4",
        runs_scored: 4,
        is_boundary_four: true,
        is_boundary_six: false,
        is_wicket: false,
        is_extra: false,
        commentary_short:
          "Hardik to Gaikwad, FOUR, crunched off the back foot past point",
      },
      {
        ball_id: "13.2",
        over_number: 14,
        ball_in_over: 2,
        label: "1",
        runs_scored: 1,
        is_boundary_four: false,
        is_boundary_six: false,
        is_wicket: false,
        is_extra: false,
        commentary_short:
          "Hardik to Gaikwad, 1 run,dabbed down to third man",
      },
      {
        ball_id: "13.3",
        over_number: 14,
        ball_in_over: 3,
        label: "6",
        runs_scored: 6,
        is_boundary_four: false,
        is_boundary_six: true,
        is_wicket: false,
        is_extra: false,
        commentary_short:
          "Hardik to Dube, SIX, length delivery dispatched high over cow corner",
      },
      {
        ball_id: "13.4",
        over_number: 14,
        ball_in_over: 4,
        label: "W",
        runs_scored: 0,
        is_boundary_four: false,
        is_boundary_six: false,
        is_wicket: true,
        is_extra: false,
        commentary_short:
          "Hardik to Dube, OUT! Off-cutter deceives him, caught at deep midwicket",
      },
      {
        ball_id: "13.5",
        over_number: 14,
        ball_in_over: 5,
        label: "0",
        runs_scored: 0,
        is_boundary_four: false,
        is_boundary_six: false,
        is_wicket: false,
        is_extra: false,
        commentary_short:
          "Hardik to Jadeja, no run, defended solidly back down the pitch",
      },
      {
        ball_id: "13.6",
        over_number: 14,
        ball_in_over: 6,
        label: "4",
        runs_scored: 4,
        is_boundary_four: true,
        is_boundary_six: false,
        is_wicket: false,
        is_extra: false,
        commentary_short:
          "Hardik to Jadeja, FOUR, glanced fine past the keeper's left!",
      },
    ],
  },
  {
    overNumber: 15,
    bowlerName: "T. Boult",
    phaseLabel: "MIDDLE OVERS",
    isLiveOver: false,
    deliveries: [
      {
        ball_id: "14.1",
        over_number: 15,
        ball_in_over: 1,
        label: "0",
        runs_scored: 0,
        is_boundary_four: false,
        is_boundary_six: false,
        is_wicket: false,
        is_extra: false,
        commentary_short:
          "Boult to Gaikwad, no run, knuckleball dips onto off stump",
      },
      {
        ball_id: "14.2",
        over_number: 15,
        ball_in_over: 2,
        label: "1",
        runs_scored: 1,
        is_boundary_four: false,
        is_boundary_six: false,
        is_wicket: false,
        is_extra: false,
        commentary_short:
          "Boult to Gaikwad, 1 run, driven crisply to deep cover",
      },
      {
        ball_id: "14.3",
        over_number: 15,
        ball_in_over: 3,
        label: "2",
        runs_scored: 2,
        is_boundary_four: false,
        is_boundary_six: false,
        is_wicket: false,
        is_extra: false,
        commentary_short:
          "Boult to Jadeja, 2 runs, hard-run brace into the midwicket pocket",
      },
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
          "Boult to Jadeja, FOUR, upper-cut over backward point",
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
          "Boult to Jadeja, 1 run, yorker jammed out to mid-on",
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
          "Boult to Gaikwad, 1 run, clipped off the pads to deep square",
      },
    ],
  },
];

function deriveBallSpeedAndZone(ball: BallDeliveryEvent): {
  speedKph: string;
  pitchZone: string;
  fantasyDelta: string;
} {
  if (ball.is_wicket) {
    return {
      speedKph: "146.8 kph",
      pitchZone: "Blockhole Yorker (5.8m)",
      fantasyDelta: "+25 Pts (Bowler Wicket)",
    };
  }
  if (ball.is_boundary_six) {
    return {
      speedKph: "138.4 kph",
      pitchZone: "Slot Length (4.4m)",
      fantasyDelta: "+8 Pts (6 Runs + +2 Six Bonus)",
    };
  }
  if (ball.is_boundary_four) {
    return {
      speedKph: "141.2 kph",
      pitchZone: "Good Length Outside Off (6.2m)",
      fantasyDelta: "+5 Pts (4 Runs + +1 Four Bonus)",
    };
  }
  if (ball.runs_scored === 0) {
    return {
      speedKph: "144.9 kph",
      pitchZone: "Hard Top-of-Off Channel (6.8m)",
      fantasyDelta: "+1 Pt (Bowler Dot Ball)",
    };
  }
  return {
    speedKph: "142.1 kph",
    pitchZone: "Back of a Length (7.4m)",
    fantasyDelta: `+${ball.runs_scored} Pt(s) (Strike Rotation)`,
  };
}

export function OverTrackerStrip({
  liveDeliveries,
  currentOverNumber,
  currentBowlerName,
  battingCode,
  bowlingCode,
}: OverTrackerStripProps) {
  const [filterMode, setFilterMode] = useState<OverFilterMode>("ALL");
  const [selectedBallId, setSelectedBallId] = useState<string | null>(null);

  const allOvers = useMemo<OverGroupCapsule[]>(() => {
    const baseCapsules: OverGroupCapsule[] = HISTORICAL_OVERS_SEED.map(
      (seed) => ({
        ...seed,
        totalRuns: seed.deliveries.reduce(
          (acc, b) => acc + b.runs_scored,
          0
        ),
        totalWickets: seed.deliveries.filter((b) => b.is_wicket).length,
      })
    );

    const liveCapsule: OverGroupCapsule = {
      overNumber: currentOverNumber,
      bowlerName: currentBowlerName,
      phaseLabel:
        currentOverNumber <= 6
          ? "POWERPLAY"
          : currentOverNumber <= 15
            ? "MIDDLE OVERS"
            : "DEATH OVERS",
      isLiveOver: true,
      deliveries: liveDeliveries,
      totalRuns: liveDeliveries.reduce((acc, b) => acc + b.runs_scored, 0),
      totalWickets: liveDeliveries.filter((b) => b.is_wicket).length,
    };

    return [...baseCapsules, liveCapsule];
  }, [liveDeliveries, currentOverNumber, currentBowlerName]);

  const filteredOvers = useMemo(() => {
    if (filterMode === "BOUNDARIES") {
      return allOvers.filter((ov) =>
        ov.deliveries.some((b) => b.is_boundary_four || b.is_boundary_six)
      );
    }
    if (filterMode === "WICKETS") {
      return allOvers.filter((ov) => ov.totalWickets > 0);
    }
    return allOvers;
  }, [allOvers, filterMode]);

  const activeInspectedBall: BallDeliveryEvent | undefined = useMemo(() => {
    const flatBalls = allOvers.flatMap((ov) => ov.deliveries);
    if (selectedBallId) {
      const found = flatBalls.find((b) => b.ball_id === selectedBallId);
      if (found) return found;
    }
    return flatBalls[flatBalls.length - 1];
  }, [allOvers, selectedBallId]);

  const ballTelemetry = activeInspectedBall
    ? deriveBallSpeedAndZone(activeInspectedBall)
    : null;

  return (
    <section className="rounded-sm glass-card border border-ivory/15 p-6 sm:p-8 shadow-glass-panel space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-ivory/10 pb-5">
        <div className="space-y-1">
          <p className="eyebrow-label text-accent-gold flex items-center gap-2">
            <Radio className="h-3.5 w-3.5 animate-pulse-live" />
            CHRONOLOGICAL OVER TELEMETRY &bull; {battingCode} vs{" "}
            {bowlingCode}
          </p>
          <h2 className="font-display text-2xl sm:text-3xl text-ivory font-normal">
            Over-by-Over{" "}
            <span className="italic text-accent-gold">Ball Tracker.</span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1 rounded-sm bg-black/55 p-1 border border-ivory/12">
            {(
              [
                { id: "ALL", label: "All Overs" },
                { id: "BOUNDARIES", label: "4s & 6s Only" },
                { id: "WICKETS", label: "Wicket Overs" },
              ] as const
            ).map((tab) => {
              const isActive = filterMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterMode(tab.id)}
                  className={cn(
                    "relative px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] transition-colors cursor-pointer z-10 rounded-xs",
                    isActive
                      ? "text-stadium-navy font-bold"
                      : "text-ivory-muted hover:text-ivory"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="over-tracker-filter-pill"
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {filteredOvers.map((over) => (
          <motion.div
            key={over.overNumber}
            layout
            transition={SPRING_GENTLE}
            className={cn(
              "rounded-sm p-4 border transition-all flex flex-col justify-between space-y-4",
              over.isLiveOver
                ? "bg-accent-gold/6 border-accent-gold/45 shadow-turf-glow"
                : "bg-black/45 border-ivory/10 hover:border-ivory/25"
            )}
          >
            <div className="flex items-center justify-between border-b border-ivory/10 pb-2.5">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider tabular-score",
                    over.isLiveOver
                      ? "bg-accent-gold text-stadium-navy"
                      : "bg-ivory/6 text-ivory border border-ivory/10"
                  )}
                >
                  OV {over.overNumber}
                </span>
                <span className="text-xs font-medium text-ivory truncate">
                  {over.bowlerName}
                </span>
              </div>

              <div className="font-mono text-xs tabular-score flex items-center gap-1.5">
                <RollingDigitTicker
                  value={over.totalRuns}
                  suffix="R"
                  className="text-accent-gold font-bold"
                />
                {over.totalWickets > 0 && (
                  <span className="rounded-sm bg-accent-crimson/25 border border-accent-crimson/50 px-1.5 py-0.5 text-[10px] text-[#ffb4b4] font-bold">
                    {over.totalWickets}W
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 py-1">
              {over.deliveries.map((ball) => {
                const isSelected =
                  activeInspectedBall?.ball_id === ball.ball_id;

                return (
                  <button
                    key={ball.ball_id}
                    type="button"
                    onClick={() => setSelectedBallId(ball.ball_id)}
                    aria-label={`Inspect ball ${ball.ball_id}`}
                    className={cn(
                      "relative flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs font-bold tabular-score border transition-all cursor-pointer",
                      ball.is_wicket
                        ? "bg-accent-crimson/30 border-accent-crimson text-[#ffb4b4]"
                        : ball.is_boundary_six
                          ? "bg-accent-gold/25 border-accent-gold text-accent-gold"
                          : ball.is_boundary_four
                            ? "bg-sage-turf/25 border-[#8ec2a8] text-[#8ec2a8]"
                            : "bg-black/65 border-ivory/15 text-ivory-muted hover:text-ivory",
                      isSelected &&
                        "ring-2 ring-accent-gold ring-offset-2 ring-offset-stadium-navy scale-110"
                    )}
                  >
                    {ball.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-ivory-dim pt-1 border-t border-ivory/8 tabular-score">
              <span>{over.phaseLabel}</span>
              <span>
                {over.isLiveOver ? "ACTIVE SPELL" : "6 DELIVERIES"}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeInspectedBall && ballTelemetry && (
          <motion.div
            key={activeInspectedBall.ball_id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={SPRING_GENTLE}
            className="rounded-sm bg-black/55 border border-ivory/12 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <div className="flex items-start sm:items-center gap-3.5">
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono text-sm font-bold border tabular-score",
                  activeInspectedBall.is_wicket
                    ? "bg-accent-crimson/30 border-accent-crimson text-[#ffb4b4]"
                    : activeInspectedBall.is_boundary_six
                      ? "bg-accent-gold/25 border-accent-gold text-accent-gold"
                      : activeInspectedBall.is_boundary_four
                        ? "bg-sage-turf/25 border-[#8ec2a8] text-[#8ec2a8]"
                        : "bg-ivory/6 border-ivory/20 text-ivory"
                )}
              >
                {activeInspectedBall.label}
              </span>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-accent-gold tabular-score">
                  <span>
                    OVER {activeInspectedBall.over_number}.
                    {activeInspectedBall.ball_in_over}
                  </span>
                  <span>&bull;</span>
                  <span>CLICK ANY BALL CIRCLE ABOVE TO INSPECT</span>
                </div>
                <p className="text-xs sm:text-sm text-ivory leading-relaxed">
                  {activeInspectedBall.commentary_short}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] tabular-score shrink-0">
              <span className="inline-flex items-center gap-1.5 rounded-sm bg-ivory/4 border border-ivory/10 px-3 py-1.5 text-ivory-muted">
                <Gauge className="h-3.5 w-3.5 text-accent-gold" />
                {ballTelemetry.speedKph}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-sm bg-ivory/4 border border-ivory/10 px-3 py-1.5 text-ivory-muted">
                <Crosshair className="h-3.5 w-3.5 text-[#8ec2a8]" />
                {ballTelemetry.pitchZone}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-sm bg-accent-gold/15 border border-accent-gold/35 px-3 py-1.5 text-accent-gold font-semibold">
                <Flame className="h-3.5 w-3.5" />
                {ballTelemetry.fantasyDelta}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
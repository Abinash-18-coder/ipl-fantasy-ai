"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Sparkles, Target, UserCheck } from "lucide-react";
import { getFranchiseTheme } from "@/lib/theme/franchiseTheme";
import { RollingDigitTicker } from "@/components/scores/RollingDigitTicker";
import { SPRING_GENTLE, SPRING_SNAPPY } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { FranchiseCode, InningsScorecard } from "@/types";

export interface ScorecardTablesProps {
  inningsList: InningsScorecard[];
  overrideHomeCode?: FranchiseCode;
  overrideAwayCode?: FranchiseCode;
  liveChaseRuns?: number;
  liveChaseWickets?: number;
  liveChaseOvers?: string;
}

function PlayerAvatar({
  playerExternalId,
  playerName,
  size,
}: {
  playerExternalId: string;
  playerName: string;
  size: 32 | 36;
}) {
  const [src, setSrc] = useState<string>(
    `/avatars/players/${playerExternalId}.svg`
  );

  return (
    <Image
      src={src}
      alt={playerName}
      width={size}
      height={size}
      unoptimized
      onError={() => setSrc("/avatars/player-silhouette.svg")}
      className={cn(
        "rounded-full border border-ivory/15 bg-black/50 object-cover shrink-0",
        size === 36 ? "h-9 w-9" : "h-8 w-8"
      )}
    />
  );
}

export function ScorecardTables({
  inningsList,
  overrideHomeCode,
  overrideAwayCode,
  liveChaseRuns,
  liveChaseWickets,
  liveChaseOvers,
}: ScorecardTablesProps) {
  const [selectedInningsIdx, setSelectedInningsIdx] = useState<number>(
    inningsList.length > 1 ? 1 : 0
  );

  const activeInnings =
    inningsList[selectedInningsIdx] ?? inningsList[0];

  if (!activeInnings) return null;

  const isSecondInnings = activeInnings.innings_number === 2;

  const battingCode: FranchiseCode = isSecondInnings
    ? (overrideAwayCode ?? activeInnings.batting_franchise)
    : (overrideHomeCode ?? activeInnings.batting_franchise);

  const bowlingCode: FranchiseCode = isSecondInnings
    ? (overrideHomeCode ?? activeInnings.bowling_franchise)
    : (overrideAwayCode ?? activeInnings.bowling_franchise);

  const battingSpec = getFranchiseTheme(battingCode);
  const bowlingSpec = getFranchiseTheme(bowlingCode);

  const displayTotalRuns =
    isSecondInnings && typeof liveChaseRuns === "number"
      ? liveChaseRuns
      : activeInnings.total_runs;

  const displayTotalWickets =
    isSecondInnings && typeof liveChaseWickets === "number"
      ? liveChaseWickets
      : activeInnings.total_wickets;

  const displayOvers =
    isSecondInnings && typeof liveChaseOvers === "string"
      ? liveChaseOvers
      : activeInnings.overs_completed.toFixed(1);

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="eyebrow-label text-accent-gold">
            BALL-BY-BALL TABULAR TELEMETRY &bull; PRECISION SHEETS
          </p>
          <h2 className="font-display text-3xl sm:text-4xl text-ivory font-normal">
            Innings{" "}
            <span className="italic text-accent-gold">Scorecards.</span>
          </h2>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-sm bg-black/55 p-1.5 border border-ivory/12 self-start sm:self-auto">
          {inningsList.map((inn, idx) => {
            const isSelected = idx === selectedInningsIdx;
            const tabTeamCode =
              inn.innings_number === 2
                ? (overrideAwayCode ?? inn.batting_franchise)
                : (overrideHomeCode ?? inn.batting_franchise);
            const tabRuns =
              inn.innings_number === 2 && typeof liveChaseRuns === "number"
                ? liveChaseRuns
                : inn.total_runs;
            const tabWickets =
              inn.innings_number === 2 &&
              typeof liveChaseWickets === "number"
                ? liveChaseWickets
                : inn.total_wickets;

            return (
              <button
                key={inn.innings_number}
                type="button"
                onClick={() => setSelectedInningsIdx(idx)}
                className={cn(
                  "relative px-4 py-2 text-xs uppercase tracking-[0.16em] transition-colors cursor-pointer z-10 tabular-score rounded-xs flex items-center gap-2.5",
                  isSelected
                    ? "text-stadium-navy font-bold"
                    : "text-ivory-muted hover:text-ivory"
                )}
              >
                {isSelected && (
                  <motion.span
                    layoutId="scorecard-innings-tab"
                    transition={SPRING_SNAPPY}
                    className="absolute inset-0 -z-10 rounded-xs bg-accent-gold shadow-turf-glow"
                  />
                )}
                <span>
                  Innings {inn.innings_number}: {tabTeamCode}
                </span>
                <span
                  className={cn(
                    "font-mono text-[11px]",
                    isSelected ? "text-stadium-navy" : "text-accent-gold"
                  )}
                >
                  {tabRuns}/{tabWickets}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeInnings.innings_number}-${battingCode}-${bowlingCode}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={SPRING_GENTLE}
          className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start"
        >
          <div className="xl:col-span-7 rounded-sm glass-card border border-ivory/15 shadow-glass-panel overflow-hidden">
            <div
              className="h-0.5 w-full"
              style={{
                background: `linear-gradient(90deg, ${battingSpec.primaryHex} 0%, #c8b273 50%, transparent 100%)`,
              }}
            />

            <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 border-b border-ivory/10 bg-black/35">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full border font-display text-sm tracking-widest text-ivory"
                  style={{
                    borderColor: battingSpec.primaryHex,
                    backgroundColor: `${battingSpec.primaryHex}25`,
                  }}
                >
                  {battingSpec.code}
                </span>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ivory-dim">
                    BATTING INNINGS {activeInnings.innings_number}
                  </p>
                  <h3 className="font-display text-2xl text-ivory">
                    {battingSpec.name}
                  </h3>
                </div>
              </div>

              <div className="text-right font-mono tabular-score">
                <RollingDigitTicker
                  value={`${displayTotalRuns}/${displayTotalWickets}`}
                  suffix={` (${displayOvers} Ov)`}
                  className="text-xl sm:text-2xl text-ivory font-semibold"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-ivory/10 bg-black/25 font-mono text-[10px] uppercase tracking-[0.2em] text-ivory-dim tabular-score">
                    <th className="py-3.5 pl-6 pr-3 font-medium">Batter</th>
                    <th className="py-3.5 px-3 font-medium hidden sm:table-cell">
                      Dismissal
                    </th>
                    <th className="py-3.5 px-3 text-right font-semibold text-ivory">
                      R
                    </th>
                    <th className="py-3.5 px-3 text-right font-medium">
                      B
                    </th>
                    <th className="py-3.5 px-3 text-right font-medium">
                      4s
                    </th>
                    <th className="py-3.5 px-3 text-right font-medium">
                      6s
                    </th>
                    <th className="py-3.5 pl-3 pr-6 text-right font-medium">
                      SR
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory/8 text-sm">
                  {activeInnings.batters.map((batter) => {
                    const isNotOut =
                      batter.is_striker ||
                      batter.is_non_striker ||
                      !batter.is_out;
                    const isHighSr = batter.strike_rate >= 175.0;

                    return (
                      <tr
                        key={batter.player_external_id}
                        className={cn(
                          "transition-colors hover:bg-ivory/3",
                          batter.is_striker && "bg-accent-gold/5"
                        )}
                      >
                        <td className="py-3.5 pl-6 pr-3">
                          <div className="flex items-center gap-3">
                            <PlayerAvatar
                              key={batter.player_external_id}
                              playerExternalId={batter.player_external_id}
                              playerName={batter.player_name}
                              size={36}
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={cn(
                                    "font-medium",
                                    isNotOut
                                      ? "text-ivory"
                                      : "text-ivory/85"
                                  )}
                                >
                                  {batter.player_name}
                                </span>
                                {batter.is_striker && (
                                  <span className="inline-flex items-center rounded-full bg-accent-gold/20 border border-accent-gold/50 px-1.5 py-0.5 font-mono text-[9px] text-accent-gold uppercase tracking-widest">
                                    Striker *
                                  </span>
                                )}
                                {batter.is_non_striker && (
                                  <span className="font-mono text-xs text-[#8ec2a8]">
                                    *
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-ivory-dim sm:hidden mt-0.5">
                                {batter.dismissal_text}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-xs text-ivory-muted hidden sm:table-cell">
                          {batter.is_striker || batter.is_non_striker ? (
                            <span className="inline-flex items-center gap-1 text-[#8ec2a8] font-mono text-[11px]">
                              <Sparkles className="h-3 w-3" />
                              not out
                            </span>
                          ) : (
                            batter.dismissal_text
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono font-bold text-ivory tabular-score">
                          <RollingDigitTicker value={batter.runs} />
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono text-xs text-ivory-muted tabular-score">
                          {batter.balls}
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono text-xs text-[#8ec2a8] tabular-score">
                          {batter.fours}
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono text-xs text-accent-gold tabular-score">
                          {batter.sixes}
                        </td>

                        <td className="py-3.5 pl-3 pr-6 text-right font-mono text-xs tabular-score">
                          <span
                            className={cn(
                              "rounded-sm px-1.5 py-0.5",
                              isHighSr
                                ? "bg-accent-gold/15 text-accent-gold font-semibold border border-accent-gold/30"
                                : "text-ivory-muted"
                            )}
                          >
                            {batter.strike_rate.toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-ivory/10 bg-black/30 px-6 py-4 space-y-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 text-ivory-muted font-mono tabular-score">
                <span>EXTRAS</span>
                <span className="text-ivory">
                  {activeInnings.extras_total}{" "}
                  <span className="text-ivory-dim">
                    {activeInnings.extras_detail}
                  </span>
                </span>
              </div>

              {activeInnings.did_not_bat.length > 0 && (
                <div className="border-t border-ivory/8 pt-3 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ivory-dim flex items-center gap-1 mr-1">
                    <UserCheck className="h-3 w-3 text-accent-gold" />
                    Yet to Bat:
                  </span>
                  {activeInnings.did_not_bat.map((playerName) => (
                    <span
                      key={playerName}
                      className="rounded-sm bg-ivory/4 border border-ivory/10 px-2.5 py-1 text-[11px] text-ivory-muted"
                    >
                      {playerName}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="xl:col-span-5 rounded-sm glass-card border border-ivory/15 shadow-glass-panel overflow-hidden">
            <div
              className="h-0.5 w-full"
              style={{
                background: `linear-gradient(90deg, ${bowlingSpec.primaryHex} 0%, #c8b273 50%, transparent 100%)`,
              }}
            />

            <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-ivory/10 bg-black/35">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full border font-display text-sm tracking-widest text-ivory"
                  style={{
                    borderColor: bowlingSpec.primaryHex,
                    backgroundColor: `${bowlingSpec.primaryHex}25`,
                  }}
                >
                  {bowlingSpec.code}
                </span>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ivory-dim">
                    BOWLING ATTACK
                  </p>
                  <h3 className="font-display text-2xl text-ivory">
                    {bowlingSpec.name}
                  </h3>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-ivory/4 border border-ivory/10 px-3 py-1 font-mono text-[10px] text-accent-gold uppercase tracking-wider">
                <Target className="h-3 w-3" />
                Spell Telemetry
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-ivory/10 bg-black/25 font-mono text-[10px] uppercase tracking-[0.2em] text-ivory-dim tabular-score">
                    <th className="py-3.5 pl-6 pr-2 font-medium">Bowler</th>
                    <th className="py-3.5 px-2 text-right font-medium">
                      O
                    </th>
                    <th className="py-3.5 px-2 text-right font-medium">
                      M
                    </th>
                    <th className="py-3.5 px-2 text-right font-medium">
                      R
                    </th>
                    <th className="py-3.5 px-2 text-right font-semibold text-ivory">
                      W
                    </th>
                    <th className="py-3.5 px-2 text-right font-medium">
                      ECO
                    </th>
                    <th className="py-3.5 pl-2 pr-6 text-right font-medium">
                      Dots
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory/8 text-sm">
                  {activeInnings.bowlers.map((bowler) => {
                    const isEconomical = bowler.economy <= 8.5;
                    const hasMultipleWickets = bowler.wickets >= 2;

                    return (
                      <tr
                        key={bowler.player_external_id}
                        className={cn(
                          "transition-colors hover:bg-ivory/3",
                          bowler.is_current_bowler &&
                            "bg-accent-gold/5"
                        )}
                      >
                        <td className="py-3.5 pl-6 pr-2">
                          <div className="flex items-center gap-2.5">
                            <PlayerAvatar
                              key={bowler.player_external_id}
                              playerExternalId={bowler.player_external_id}
                              playerName={bowler.player_name}
                              size={32}
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium text-ivory text-xs sm:text-sm">
                                  {bowler.short_name}
                                </span>
                                {bowler.is_current_bowler && (
                                  <span className="h-2 w-2 rounded-full bg-accent-gold animate-pulse-live" />
                                )}
                              </div>
                              <p className="font-mono text-[10px] text-ivory-dim tabular-score">
                                wd {bowler.wides} &bull; nb{" "}
                                {bowler.no_balls}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-2 text-right font-mono text-xs text-ivory-muted tabular-score">
                          {bowler.overs.toFixed(1)}
                        </td>

                        <td className="py-3.5 px-2 text-right font-mono text-xs text-ivory-dim tabular-score">
                          {bowler.maidens}
                        </td>

                        <td className="py-3.5 px-2 text-right font-mono text-xs text-ivory tabular-score">
                          {bowler.runs_conceded}
                        </td>

                        <td className="py-3.5 px-2 text-right font-mono font-bold tabular-score">
                          <span
                            className={cn(
                              "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                              hasMultipleWickets
                                ? "bg-accent-gold/20 text-accent-gold border border-accent-gold/40"
                                : bowler.wickets > 0
                                  ? "bg-sage-turf/20 text-[#8ec2a8] border border-[#8ec2a8]/35"
                                  : "text-ivory-muted"
                            )}
                          >
                            {bowler.wickets}
                          </span>
                        </td>

                        <td className="py-3.5 px-2 text-right font-mono text-xs tabular-score">
                          <span
                            className={cn(
                              isEconomical
                                ? "text-[#8ec2a8] font-semibold"
                                : "text-ivory-muted"
                            )}
                          >
                            {bowler.economy.toFixed(2)}
                          </span>
                        </td>

                        <td className="py-3.5 pl-2 pr-6 text-right font-mono text-xs text-accent-gold tabular-score">
                          {bowler.dot_balls}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-ivory/10 bg-black/30 px-6 py-4 flex items-center justify-between text-[11px] font-mono text-ivory-dim tabular-score">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-accent-gold" />
                Phase Fantasy Impact
              </span>
              <span className="text-ivory-muted">
                +25 Wicket &bull; +8 LBW/Bowled &bull; +1 Dot Ball
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
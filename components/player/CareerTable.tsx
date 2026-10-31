"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  Award,
  BarChart3,
  Flame,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { RollingDigitTicker } from "@/components/scores/RollingDigitTicker";
import { SPRING_GENTLE, SPRING_SNAPPY } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type {
  CareerSeasonSummary,
  PlayerAnalyticsAggregatedRow,
} from "@/types";

export interface CareerTableProps {
  player: PlayerAnalyticsAggregatedRow;
  featuredPlayers?: PlayerAnalyticsAggregatedRow[];
  onSelectPlayer?: (player: PlayerAnalyticsAggregatedRow) => void;
  compact?: boolean;
  className?: string;
}

type SeasonYearKey = "2024" | "2025" | "2026";
type MetricHighlightMode = "ALL_METRICS" | "BATTING" | "BOWLING" | "WIN_IMPACT";

interface EnrichedSeasonRow extends CareerSeasonSummary {
  seasonYear: SeasonYearKey;
  winContributionPct: number;
  matchWinningInnings: number;
  yoyFantasyDelta: number | null;
  isPeakSeason: boolean;
}

const SEASON_KEYS: readonly SeasonYearKey[] = ["2024", "2025", "2026"];

function CareerPlayerAvatar({
  avatarUrl,
  fullName,
  primaryHex,
}: {
  avatarUrl: string;
  fullName: string;
  primaryHex: string;
}) {
  const [src, setSrc] = useState<string>(avatarUrl);

  return (
    <div
      className="relative h-14 w-14 shrink-0 rounded-full p-[1.5px]"
      style={{
        background: `linear-gradient(135deg, ${primaryHex} 0%, #c8b273 100%)`,
      }}
    >
      <Image
        src={src}
        alt={fullName}
        width={56}
        height={56}
        unoptimized
        onError={() => setSrc("/avatars/player-silhouette.svg")}
        className="h-full w-full rounded-full bg-stadium-navy object-cover"
      />
    </div>
  );
}

function deriveWinContributionMetrics(
  season: CareerSeasonSummary,
  credits: number
): { winContributionPct: number; matchWinningInnings: number } {
  const matches = Math.max(1, season.matches);
  const runFactor = season.runs * 0.045;
  const wicketFactor = season.wickets * 1.35;
  const srFactor = Math.max(0, (season.strike_rate - 130) * 0.18);
  const ecoBonus =
    season.economy > 0 ? Math.max(0, (9.2 - season.economy) * 4.2) : 0;

  const rawImpactPct =
    16.5 +
    (runFactor + wicketFactor + srFactor + ecoBonus) /
      Math.max(6, matches * 0.48) +
    (credits - 7.5) * 1.4;

  const winContributionPct = Number(
    Math.min(44.8, Math.max(11.2, rawImpactPct)).toFixed(1)
  );

  const matchWinningInnings = Math.min(
    matches,
    Math.max(
      1,
      Math.round((season.fantasy_points_avg / 68) * (matches * 0.42))
    )
  );

  return { winContributionPct, matchWinningInnings };
}

export function CareerTable({
  player,
  featuredPlayers = [],
  onSelectPlayer,
  compact = false,
  className,
}: CareerTableProps) {
  const [highlightMode, setHighlightMode] =
    useState<MetricHighlightMode>("ALL_METRICS");

  const seasonRows = useMemo<EnrichedSeasonRow[]>(() => {
    const rawSeasons = SEASON_KEYS.map((year) => {
      const fallbackSeason: CareerSeasonSummary = {
        matches: year === "2026" ? 10 : 14,
        runs: player.role === "BOWL" ? 42 : Math.round(player.credits * 40),
        batting_avg: player.role === "BOWL" ? 13.5 : 35.8,
        strike_rate: player.role === "BOWL" ? 121.0 : 151.4,
        wickets:
          player.role === "BOWL" || player.role === "ALL"
            ? Math.round(player.credits * 1.8)
            : 0,
        economy:
          player.role === "BOWL" || player.role === "ALL" ? 7.95 : 0,
        fantasy_points_avg: Math.round(player.credits * 6.8),
      };

      const stats = player.career_stats_3yr?.[year] ?? fallbackSeason;
      return {
        year,
        stats: {
          matches: Number(stats.matches ?? fallbackSeason.matches),
          runs: Number(stats.runs ?? fallbackSeason.runs),
          batting_avg: Number(
            stats.batting_avg ?? fallbackSeason.batting_avg
          ),
          strike_rate: Number(
            stats.strike_rate ?? fallbackSeason.strike_rate
          ),
          wickets: Number(stats.wickets ?? fallbackSeason.wickets),
          economy: Number(stats.economy ?? fallbackSeason.economy),
          fantasy_points_avg: Number(
            stats.fantasy_points_avg ?? fallbackSeason.fantasy_points_avg
          ),
        },
      };
    });

    const maxFantasyAvg = Math.max(
      ...rawSeasons.map((s) => s.stats.fantasy_points_avg)
    );

    return rawSeasons.map((item, idx) => {
      const prevSeason = idx > 0 ? rawSeasons[idx - 1] : undefined;
      const yoyFantasyDelta = prevSeason
        ? Number(
            (
              item.stats.fantasy_points_avg -
              prevSeason.stats.fantasy_points_avg
            ).toFixed(1)
          )
        : null;

      const { winContributionPct, matchWinningInnings } =
        deriveWinContributionMetrics(item.stats, player.credits);

      return {
        seasonYear: item.year,
        ...item.stats,
        winContributionPct,
        matchWinningInnings,
        yoyFantasyDelta,
        isPeakSeason: item.stats.fantasy_points_avg === maxFantasyAvg,
      };
    });
  }, [player]);

  const careerSummary = useMemo(() => {
    const totalMatches = seasonRows.reduce((s, r) => s + r.matches, 0);
    const totalRuns = seasonRows.reduce((s, r) => s + r.runs, 0);
    const totalWickets = seasonRows.reduce((s, r) => s + r.wickets, 0);
    const totalImpactGames = seasonRows.reduce(
      (s, r) => s + r.matchWinningInnings,
      0
    );

    const meanBattingAvg = Number(
      (
        seasonRows.reduce((s, r) => s + r.batting_avg, 0) /
        seasonRows.length
      ).toFixed(2)
    );
    const meanStrikeRate = Number(
      (
        seasonRows.reduce((s, r) => s + r.strike_rate, 0) /
        seasonRows.length
      ).toFixed(2)
    );

    const bowlingSeasons = seasonRows.filter((r) => r.economy > 0);
    const meanEconomy =
      bowlingSeasons.length > 0
        ? Number(
            (
              bowlingSeasons.reduce((s, r) => s + r.economy, 0) /
              bowlingSeasons.length
            ).toFixed(2)
          )
        : 0;

    const meanFantasyAvg = Number(
      (
        seasonRows.reduce((s, r) => s + r.fantasy_points_avg, 0) /
        seasonRows.length
      ).toFixed(2)
    );

    const meanWinContribution = Number(
      (
        seasonRows.reduce((s, r) => s + r.winContributionPct, 0) /
        seasonRows.length
      ).toFixed(1)
    );

    return {
      totalMatches,
      totalRuns,
      totalWickets,
      totalImpactGames,
      meanBattingAvg,
      meanStrikeRate,
      meanEconomy,
      meanFantasyAvg,
      meanWinContribution,
    };
  }, [seasonRows]);

  return (
    <section
      className={cn(
        "rounded-sm glass-card border border-ivory/15 shadow-glass-panel overflow-hidden relative",
        compact ? "p-4 sm:p-5 space-y-5" : "p-6 sm:p-8 space-y-6",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[2.5px]"
        style={{
          background: `linear-gradient(90deg, ${player.franchise_primary_hex} 0%, #c8b273 50%, transparent 100%)`,
        }}
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-ivory/10 pb-5">
        <div className="flex items-center gap-4">
          <CareerPlayerAvatar
            key={player.external_api_id}
            avatarUrl={player.avatar_url}
            fullName={player.full_name}
            primaryHex={player.franchise_primary_hex}
          />

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="eyebrow-label text-accent-gold flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" />
                3-YEAR IPL CAREER HISTORY (2024–2026)
              </span>
              <span
                className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider border"
                style={{
                  borderColor: player.franchise_primary_hex,
                  backgroundColor: `${player.franchise_primary_hex}24`,
                  color: "#f4f1ea",
                }}
              >
                {player.franchise_code} &bull; {player.role}
              </span>
            </div>

            <h2 className="font-display text-2xl sm:text-4xl text-ivory font-normal">
              {player.full_name}{" "}
              <span className="italic text-accent-gold text-xl sm:text-2xl">
                ({player.credits.toFixed(1)} Cr)
              </span>
            </h2>
          </div>
        </div>

        {!compact && (
          <div className="inline-flex flex-wrap items-center gap-1 rounded-sm bg-black/55 p-1 border border-ivory/12 self-start lg:self-auto">
            {(
              [
                { id: "ALL_METRICS", label: "All Columns" },
                { id: "BATTING", label: "Batting Focus" },
                { id: "BOWLING", label: "Bowling Focus" },
                { id: "WIN_IMPACT", label: "Win Contributions" },
              ] as const
            ).map((tab) => {
              const isSelected = highlightMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setHighlightMode(tab.id)}
                  className={cn(
                    "relative px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.14em] transition-colors cursor-pointer z-10 rounded-xs",
                    isSelected
                      ? "text-stadium-navy font-bold"
                      : "text-ivory-muted hover:text-ivory"
                  )}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="career-table-mode-pill"
                      transition={SPRING_SNAPPY}
                      className="absolute inset-0 -z-10 rounded-xs bg-accent-gold"
                    />
                  )}
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {!compact && featuredPlayers.length > 0 && onSelectPlayer && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ivory-dim shrink-0 mr-1">
            Quick Inspect Star:
          </span>
          {featuredPlayers.slice(0, 10).map((candidate) => {
            const isActive =
              candidate.external_api_id === player.external_api_id;
            return (
              <button
                key={candidate.external_api_id}
                type="button"
                onClick={() => onSelectPlayer(candidate)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 font-mono text-[10px] transition-all border cursor-pointer flex items-center gap-1.5",
                  isActive
                    ? "bg-accent-gold text-stadium-navy border-accent-gold font-bold shadow-turf-glow"
                    : "bg-black/45 border-ivory/12 text-ivory-muted hover:text-ivory hover:border-ivory/30"
                )}
              >
                <span>{candidate.short_name}</span>
                <span
                  className={cn(
                    "text-[9px]",
                    isActive ? "text-stadium-navy/80" : "text-accent-gold"
                  )}
                >
                  ({candidate.franchise_code})
                </span>
              </button>
            );
          })}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={player.external_api_id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={SPRING_GENTLE}
          className="space-y-5"
        >
          <div className="overflow-x-auto rounded-sm border border-ivory/12 bg-black/40">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-ivory/12 bg-black/50 font-mono text-[10px] uppercase tracking-[0.18em] text-ivory-dim tabular-score">
                  <th className="py-3.5 pl-5 pr-3 font-medium sticky left-0 bg-[#090b0c] z-10">
                    IPL Season
                  </th>
                  <th className="py-3.5 px-3 text-right font-medium">
                    Mat
                  </th>
                  <th
                    className={cn(
                      "py-3.5 px-3 text-right font-medium transition-colors",
                      highlightMode === "BATTING" &&
                        "text-accent-gold font-bold bg-accent-gold/6"
                    )}
                  >
                    Runs
                  </th>
                  <th
                    className={cn(
                      "py-3.5 px-3 text-right font-medium transition-colors",
                      highlightMode === "BATTING" &&
                        "text-accent-gold font-bold bg-accent-gold/6"
                    )}
                  >
                    Bat Avg
                  </th>
                  <th
                    className={cn(
                      "py-3.5 px-3 text-right font-medium transition-colors",
                      highlightMode === "BATTING" &&
                        "text-accent-gold font-bold bg-accent-gold/6"
                    )}
                  >
                    Strike Rate
                  </th>
                  <th
                    className={cn(
                      "py-3.5 px-3 text-right font-medium transition-colors",
                      highlightMode === "BOWLING" &&
                        "text-[#8ec2a8] font-bold bg-sage-turf/8"
                    )}
                  >
                    Wickets
                  </th>
                  <th
                    className={cn(
                      "py-3.5 px-3 text-right font-medium transition-colors",
                      highlightMode === "BOWLING" &&
                        "text-[#8ec2a8] font-bold bg-sage-turf/8"
                    )}
                  >
                    Economy
                  </th>
                  <th
                    className={cn(
                      "py-3.5 px-3 text-right font-medium transition-colors",
                      highlightMode === "WIN_IMPACT" &&
                        "text-accent-gold font-bold bg-accent-gold/6"
                    )}
                  >
                    Win Contrib %
                  </th>
                  <th className="py-3.5 pl-3 pr-5 text-right font-semibold text-ivory">
                    Fantasy Avg
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-ivory/8 font-mono text-xs sm:text-sm tabular-score">
                {seasonRows.map((row) => {
                  const isEliteSr = row.strike_rate >= 150.0;
                  const isStingyEco =
                    row.economy > 0 && row.economy <= 8.0;

                  return (
                    <tr
                      key={row.seasonYear}
                      className={cn(
                        "transition-colors hover:bg-ivory/3",
                        row.isPeakSeason && "bg-accent-gold/4"
                      )}
                    >
                      <td className="py-4 pl-5 pr-3 sticky left-0 bg-[#090b0c]/95 backdrop-blur-md z-10">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-ivory">
                            IPL {row.seasonYear}
                          </span>
                          {row.isPeakSeason && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-accent-gold/20 border border-accent-gold/45 px-2 py-0.5 text-[9px] text-accent-gold uppercase tracking-wider">
                              <Trophy className="h-2.5 w-2.5" />
                              Peak
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-3 text-right text-ivory-muted">
                        {row.matches}
                      </td>

                      <td
                        className={cn(
                          "py-4 px-3 text-right font-semibold text-ivory",
                          highlightMode === "BATTING" &&
                            "bg-accent-gold/4"
                        )}
                      >
                        <RollingDigitTicker value={row.runs} />
                      </td>

                      <td
                        className={cn(
                          "py-4 px-3 text-right text-ivory-muted",
                          highlightMode === "BATTING" &&
                            "bg-accent-gold/4"
                        )}
                      >
                        {row.batting_avg.toFixed(1)}
                      </td>

                      <td
                        className={cn(
                          "py-4 px-3 text-right",
                          highlightMode === "BATTING" &&
                            "bg-accent-gold/4"
                        )}
                      >
                        <span
                          className={cn(
                            "rounded-sm px-1.5 py-0.5",
                            isEliteSr
                              ? "bg-accent-gold/15 text-accent-gold font-semibold border border-accent-gold/30"
                              : "text-ivory-muted"
                          )}
                        >
                          {row.strike_rate.toFixed(1)}
                        </span>
                      </td>

                      <td
                        className={cn(
                          "py-4 px-3 text-right font-semibold",
                          row.wickets > 0
                            ? "text-[#8ec2a8]"
                            : "text-ivory-dim",
                          highlightMode === "BOWLING" &&
                            "bg-sage-turf/6"
                        )}
                      >
                        {row.wickets}
                      </td>

                      <td
                        className={cn(
                          "py-4 px-3 text-right",
                          highlightMode === "BOWLING" &&
                            "bg-sage-turf/6"
                        )}
                      >
                        {row.economy > 0 ? (
                          <span
                            className={cn(
                              "rounded-sm px-1.5 py-0.5",
                              isStingyEco
                                ? "bg-sage-turf/20 text-[#8ec2a8] font-semibold border border-[#8ec2a8]/35"
                                : "text-ivory-muted"
                            )}
                          >
                            {row.economy.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-ivory-dim">&mdash;</span>
                        )}
                      </td>

                      <td
                        className={cn(
                          "py-4 px-3 text-right",
                          highlightMode === "WIN_IMPACT" &&
                            "bg-accent-gold/4"
                        )}
                      >
                        <div className="inline-flex flex-col items-end">
                          <span className="text-ivory font-semibold">
                            {row.winContributionPct.toFixed(1)}%
                          </span>
                          <span className="text-[10px] text-ivory-dim">
                            {row.matchWinningInnings} MVPs
                          </span>
                        </div>
                      </td>

                      <td className="py-4 pl-3 pr-5 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <span className="text-sm font-bold text-accent-gold">
                            {row.fantasy_points_avg.toFixed(0)} pts
                          </span>
                          {row.yoyFantasyDelta !== null && (
                            <span
                              className={cn(
                                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] border",
                                row.yoyFantasyDelta >= 0
                                  ? "bg-sage-turf/20 border-[#8ec2a8]/40 text-[#8ec2a8]"
                                  : "bg-accent-crimson/20 border-accent-crimson/40 text-[#ffb4b4]"
                              )}
                            >
                              {row.yoyFantasyDelta >= 0 ? (
                                <TrendingUp className="h-2.5 w-2.5" />
                              ) : (
                                <TrendingDown className="h-2.5 w-2.5" />
                              )}
                              {row.yoyFantasyDelta >= 0
                                ? `+${row.yoyFantasyDelta}`
                                : row.yoyFantasyDelta}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              <tfoot>
                <tr className="border-t-2 border-accent-gold/35 bg-black/65 font-mono text-xs sm:text-sm font-bold text-ivory tabular-score">
                  <td className="py-4 pl-5 pr-3 sticky left-0 bg-[#090b0c] z-10 text-accent-gold uppercase tracking-wider text-xs">
                    3-YR CAREER TOTAL / MEAN
                  </td>
                  <td className="py-4 px-3 text-right">
                    {careerSummary.totalMatches}
                  </td>
                  <td className="py-4 px-3 text-right text-accent-gold">
                    <RollingDigitTicker value={careerSummary.totalRuns} />
                  </td>
                  <td className="py-4 px-3 text-right">
                    {careerSummary.meanBattingAvg.toFixed(1)}
                  </td>
                  <td className="py-4 px-3 text-right">
                    {careerSummary.meanStrikeRate.toFixed(1)}
                  </td>
                  <td className="py-4 px-3 text-right text-[#8ec2a8]">
                    <RollingDigitTicker
                      value={careerSummary.totalWickets}
                    />
                  </td>
                  <td className="py-4 px-3 text-right">
                    {careerSummary.meanEconomy > 0
                      ? careerSummary.meanEconomy.toFixed(2)
                      : "—"}
                  </td>
                  <td className="py-4 px-3 text-right text-ivory">
                    {careerSummary.meanWinContribution.toFixed(1)}%{" "}
                    <span className="text-[10px] text-accent-gold font-normal">
                      ({careerSummary.totalImpactGames}G)
                    </span>
                  </td>
                  <td className="py-4 pl-3 pr-5 text-right text-accent-gold">
                    {careerSummary.meanFantasyAvg.toFixed(1)} pts/g
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono tabular-score">
            <div className="rounded-sm bg-black/45 border border-ivory/10 p-3.5 flex items-center justify-between">
              <span className="text-ivory-dim flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-accent-gold" />
                3-YR CONSISTENCY FLOOR
              </span>
              <span className="text-ivory font-semibold">
                {careerSummary.meanFantasyAvg.toFixed(1)} Pts/Match
              </span>
            </div>

            <div className="rounded-sm bg-black/45 border border-ivory/10 p-3.5 flex items-center justify-between">
              <span className="text-ivory-dim flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-[#8ec2a8]" />
                CURRENT 4M vs 3Y BASELINE
              </span>
              <span
                className={cn(
                  "font-semibold",
                  player.form_4m_avg >= careerSummary.meanFantasyAvg
                    ? "text-[#8ec2a8]"
                    : "text-accent-gold"
                )}
              >
                {player.form_4m_avg >= careerSummary.meanFantasyAvg
                  ? `+${(
                      player.form_4m_avg - careerSummary.meanFantasyAvg
                    ).toFixed(1)} Surge`
                  : `${(
                      player.form_4m_avg - careerSummary.meanFantasyAvg
                    ).toFixed(1)} Delta`}
              </span>
            </div>

            <div className="rounded-sm bg-black/45 border border-ivory/10 p-3.5 flex items-center justify-between">
              <span className="text-ivory-dim flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-accent-gold" />
                SOLVER BUCKET TAG
              </span>
              <span className="text-accent-gold font-semibold uppercase">
                {player.recommended_risk_bucket} Tier
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
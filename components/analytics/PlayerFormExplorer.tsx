"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  BarChart3,
  Search,
  Sparkles,
} from "lucide-react";
import { FormSparkline } from "@/components/analytics/FormSparkline";
import { CareerTable } from "@/components/player/CareerTable";
import { RollingDigitTicker } from "@/components/scores/RollingDigitTicker";
import { SPRING_GENTLE, SPRING_SNAPPY } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type {
  AnalyticsSortField,
  FranchiseAnalyticsRollup,
  FranchiseCode,
  PlayerAnalyticsAggregatedRow,
  PlayerRole,
  RiskBucket,
} from "@/types";

export interface PlayerFormExplorerProps {
  initialPlayers: PlayerAnalyticsAggregatedRow[];
  franchiseRollups: FranchiseAnalyticsRollup[];
  dataSource: "POSTGRES_VIEW" | "FALLBACK_ENGINE";
}

const ROLE_TABS: ReadonlyArray<{ id: PlayerRole | "ALL"; label: string }> = [
  { id: "ALL", label: "All Roles" },
  { id: "WK", label: "WK" },
  { id: "BAT", label: "BAT" },
  { id: "ALL", label: "ALL" },
  { id: "BOWL", label: "BOWL" },
];

const BUCKET_TABS: ReadonlyArray<{
  id: RiskBucket | "ALL";
  label: string;
}> = [
  { id: "ALL", label: "All Buckets" },
  { id: "Core", label: "Core (Safe)" },
  { id: "Form", label: "Form Surge" },
  { id: "Historic", label: "Historic Class" },
  { id: "Punt", label: "Punt / Uncapped" },
];

const SORT_OPTIONS: ReadonlyArray<{
  id: AnalyticsSortField;
  label: string;
}> = [
  { id: "form_4m_avg", label: "4-Match Form Avg" },
  { id: "points_per_credit", label: "Value ROI (Pts/Cr)" },
  { id: "boundary_pct", label: "Boundary %" },
  { id: "death_overs_economy", label: "Death Overs Economy" },
  { id: "selection_pct", label: "Selection %" },
  { id: "career_3yr_runs", label: "3-Yr Career Runs" },
  { id: "career_3yr_wickets", label: "3-Yr Career Wickets" },
];

function PlayerPortrait({
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

function getBucketBadgeStyle(bucket: RiskBucket): string {
  switch (bucket) {
    case "Core":
      return "bg-[#5b8c75]/20 border-[#8ec2a8]/45 text-[#8ec2a8]";
    case "Form":
      return "bg-accent-gold/20 border-accent-gold/45 text-accent-gold";
    case "Punt":
      return "bg-accent-crimson/20 border-accent-crimson/45 text-[#ffb4b4]";
    case "Historic":
    default:
      return "bg-ivory/10 border-ivory/25 text-ivory";
  }
}

export function PlayerFormExplorer({
  initialPlayers,
  franchiseRollups,
  dataSource,
}: PlayerFormExplorerProps) {
  const [selectedFranchise, setSelectedFranchise] = useState<
    FranchiseCode | "ALL"
  >("ALL");
  const [selectedRole, setSelectedRole] = useState<PlayerRole | "ALL">(
    "ALL"
  );
  const [selectedBucket, setSelectedBucket] = useState<
    RiskBucket | "ALL"
  >("ALL");
  const [sortBy, setSortBy] = useState<AnalyticsSortField>("form_4m_avg");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState<number>(18);
  const [selectedCareerPlayerId, setSelectedCareerPlayerId] =
    useState<string>(
      initialPlayers[0]?.external_api_id ?? "rcb-virat-kohli"
    );

  const filteredAndSortedPlayers = useMemo(() => {
    let list = [...initialPlayers];

    if (selectedFranchise !== "ALL") {
      list = list.filter((p) => p.franchise_code === selectedFranchise);
    }

    if (selectedRole !== "ALL") {
      list = list.filter((p) => p.role === selectedRole);
    }

    if (selectedBucket !== "ALL") {
      list = list.filter(
        (p) => p.recommended_risk_bucket === selectedBucket
      );
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.full_name.toLowerCase().includes(q) ||
          p.short_name.toLowerCase().includes(q) ||
          p.franchise_code.toLowerCase().includes(q)
      );
    }

    if (sortBy === "death_overs_economy") {
      list.sort((a, b) => {
        const aEco =
          a.death_overs_economy > 0 ? a.death_overs_economy : 99.9;
        const bEco =
          b.death_overs_economy > 0 ? b.death_overs_economy : 99.9;
        return aEco - bEco;
      });
    } else {
      list.sort((a, b) => Number(b[sortBy]) - Number(a[sortBy]));
    }

    return list;
  }, [
    initialPlayers,
    selectedFranchise,
    selectedRole,
    selectedBucket,
    sortBy,
    searchQuery,
  ]);

  const activeCareerPlayer = useMemo(() => {
    return (
      initialPlayers.find(
        (p) => p.external_api_id === selectedCareerPlayerId
      ) ??
      filteredAndSortedPlayers[0] ??
      initialPlayers[0]
    );
  }, [
    initialPlayers,
    filteredAndSortedPlayers,
    selectedCareerPlayerId,
  ]);

  const handleInspectPlayerCareer = (
    player: PlayerAnalyticsAggregatedRow
  ) => {
    setSelectedCareerPlayerId(player.external_api_id);
    if (typeof document !== "undefined") {
      const section = document.getElementById("career-history-anchor");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const displayedPlayers = filteredAndSortedPlayers.slice(0, visibleCount);

  return (
    <div className="space-y-10">
      <section className="rounded-sm glass-card border border-ivory/15 p-6 sm:p-8 shadow-glass-panel space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ivory/10 pb-4">
          <div className="space-y-1">
            <p className="eyebrow-label text-accent-gold flex items-center gap-2">
              <Activity className="h-3.5 w-3.5" />
              POSTGRESQL VIEW ROLLUP &bull; 10 FRANCHISE SQUADS
            </p>
            <h2 className="font-display text-2xl sm:text-3xl text-ivory font-normal">
              Franchise Form{" "}
              <span className="italic text-accent-gold">Index.</span>
            </h2>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-ivory-muted tabular-score">
            <span className="rounded-full bg-ivory/4 border border-ivory/12 px-3 py-1 text-[11px] text-[#8ec2a8]">
              Engine: {dataSource}
            </span>
            <span className="rounded-full bg-ivory/4 border border-ivory/12 px-3 py-1 text-[11px] text-accent-gold">
              <RollingDigitTicker value={filteredAndSortedPlayers.length} />{" "}
              / {initialPlayers.length} Players
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-11 gap-2.5">
          <button
            type="button"
            onClick={() => setSelectedFranchise("ALL")}
            className={cn(
              "rounded-sm p-3 border text-left transition-all cursor-pointer flex flex-col justify-between",
              selectedFranchise === "ALL"
                ? "bg-accent-gold/20 border-accent-gold text-ivory shadow-turf-glow"
                : "bg-black/45 border-ivory/10 text-ivory-muted hover:border-ivory/25"
            )}
          >
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent-gold">
              ALL IPL
            </span>
            <span className="font-display text-xl text-ivory mt-1">
              10 Teams
            </span>
            <span className="font-mono text-[10px] text-ivory-dim tabular-score mt-1">
              250 Squad
            </span>
          </button>

          {franchiseRollups.map((rollup) => {
            const isSelected = selectedFranchise === rollup.franchise_code;
            return (
              <button
                key={rollup.franchise_code}
                type="button"
                onClick={() =>
                  setSelectedFranchise(
                    isSelected ? "ALL" : rollup.franchise_code
                  )
                }
                style={{
                  borderColor: isSelected
                    ? rollup.franchise_primary_hex
                    : "rgba(244,241,234,0.1)",
                  backgroundColor: isSelected
                    ? `${rollup.franchise_primary_hex}24`
                    : "rgba(0,0,0,0.45)",
                }}
                className="rounded-sm p-3 border text-left transition-all cursor-pointer flex flex-col justify-between hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className="font-mono text-xs font-bold tracking-wider"
                    style={{ color: rollup.franchise_primary_hex }}
                  >
                    {rollup.franchise_code}
                  </span>
                  <span className="font-mono text-[9px] text-ivory-dim tabular-score">
                    {rollup.squad_size}P
                  </span>
                </div>

                <div className="mt-2 font-mono text-xs text-ivory tabular-score font-semibold">
                  {rollup.avg_squad_form_pts.toFixed(1)}{" "}
                  <span className="text-[9px] text-ivory-dim font-normal">
                    avg
                  </span>
                </div>

                <div className="mt-0.5 font-mono text-[9px] text-[#8ec2a8] tabular-score">
                  ROI {rollup.top_value_roi.toFixed(1)}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {activeCareerPlayer && (
        <div id="career-history-anchor" className="scroll-mt-28">
          <CareerTable
            player={activeCareerPlayer}
            featuredPlayers={filteredAndSortedPlayers}
            onSelectPlayer={(p) =>
              setSelectedCareerPlayerId(p.external_api_id)
            }
          />
        </div>
      )}

      <section className="rounded-sm glass-card border border-ivory/15 p-5 sm:p-6 shadow-glass-panel space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-4 relative">
            <Search className="h-4 w-4 text-ivory-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 250 players by name or team (e.g., Kohli, Bumrah, CSK)..."
              className="w-full rounded-sm bg-black/55 border border-ivory/15 pl-10 pr-4 py-2.5 text-xs text-ivory placeholder:text-ivory-dim focus:outline-none focus:border-accent-gold transition-colors"
            />
          </div>

          <div className="lg:col-span-4 flex flex-wrap items-center gap-1 rounded-sm bg-black/50 p-1 border border-ivory/12">
            {ROLE_TABS.map((tab) => {
              const isSelected = selectedRole === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedRole(tab.id)}
                  className={cn(
                    "relative flex-1 py-1.5 px-2 text-[10px] font-mono uppercase tracking-[0.14em] transition-colors cursor-pointer z-10 rounded-xs",
                    isSelected
                      ? "text-stadium-navy font-bold"
                      : "text-ivory-muted hover:text-ivory"
                  )}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="analytics-role-tab"
                      transition={SPRING_SNAPPY}
                      className="absolute inset-0 -z-10 rounded-xs bg-accent-gold"
                    />
                  )}
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-4 flex items-center justify-end gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ivory-dim shrink-0">
              Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as AnalyticsSortField)
              }
              aria-label="Sort players by metric"
              className="rounded-sm bg-black/65 border border-ivory/15 px-3 py-2 text-xs font-mono text-accent-gold focus:outline-none focus:border-accent-gold cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option
                  key={opt.id}
                  value={opt.id}
                  className="bg-[#090b0c] text-ivory"
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-ivory/10 pt-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ivory-dim mr-1">
            AI Risk Bucket:
          </span>
          {BUCKET_TABS.map((tab) => {
            const isSelected = selectedBucket === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedBucket(tab.id)}
                className={cn(
                  "rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider border transition-all cursor-pointer",
                  isSelected
                    ? "bg-accent-gold text-stadium-navy border-accent-gold font-bold"
                    : "bg-black/45 border-ivory/12 text-ivory-muted hover:text-ivory"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {displayedPlayers.map((player) => {
            const isInspectingCareer =
              activeCareerPlayer?.external_api_id ===
              player.external_api_id;

            return (
              <motion.article
                key={player.external_api_id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={SPRING_GENTLE}
                className={cn(
                  "rounded-sm glass-card border p-6 shadow-glass-panel flex flex-col justify-between space-y-5 relative overflow-hidden transition-colors",
                  isInspectingCareer
                    ? "border-accent-gold bg-accent-gold/3"
                    : "border-ivory/15 hover:border-ivory/30"
                )}
              >
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-0.5"
                  style={{
                    background: `linear-gradient(90deg, ${player.franchise_primary_hex} 0%, #c8b273 60%, transparent 100%)`,
                  }}
                />

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <PlayerPortrait
                      key={player.external_api_id}
                      avatarUrl={player.avatar_url}
                      fullName={player.full_name}
                      primaryHex={player.franchise_primary_hex}
                    />

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-mono text-[10px] font-bold uppercase tracking-widest"
                          style={{ color: player.franchise_primary_hex }}
                        >
                          {player.franchise_code}
                        </span>
                        <span className="text-ivory-dim">&bull;</span>
                        <span className="font-mono text-[10px] text-accent-gold uppercase tracking-wider">
                          {player.role}
                        </span>
                        <span className="text-ivory-dim">&bull;</span>
                        <span className="font-mono text-[10px] text-ivory-muted tabular-score">
                          {player.credits.toFixed(1)} Cr
                        </span>
                      </div>

                      <h3 className="font-display text-2xl text-ivory leading-tight">
                        {player.full_name}
                      </h3>

                      <div className="flex items-center gap-2 font-mono text-[10px] text-ivory-dim tabular-score">
                        <span>Sel {player.selection_pct.toFixed(1)}%</span>
                        {player.is_overseas && (
                          <span className="rounded-sm bg-ivory/6 px-1.5 py-0.2 text-ivory-muted">
                            OS
                          </span>
                        )}
                        {player.is_uncapped_debutant && (
                          <span className="rounded-sm bg-accent-gold/15 px-1.5 py-0.2 text-accent-gold">
                            UNCAPPED
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-widest border shrink-0",
                      getBucketBadgeStyle(player.recommended_risk_bucket)
                    )}
                  >
                    {player.recommended_risk_bucket}
                  </span>
                </div>

                <div className="rounded-sm bg-black/50 border border-ivory/10 p-3.5">
                  <FormSparkline
                    points={player.recent_form_points}
                    accentHex={player.franchise_primary_hex}
                  />
                </div>

                <div className="grid grid-cols-4 gap-2 pt-1 font-mono tabular-score text-center">
                  <div className="rounded-sm bg-ivory/3 border border-ivory/8 p-2">
                    <span className="block text-[9px] text-ivory-dim uppercase">
                      4M AVG
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-ivory">
                      {player.form_4m_avg.toFixed(1)}
                    </span>
                  </div>

                  <div className="rounded-sm bg-ivory/3 border border-ivory/8 p-2">
                    <span className="block text-[9px] text-ivory-dim uppercase">
                      ROI/CR
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#8ec2a8]">
                      {player.points_per_credit.toFixed(1)}
                    </span>
                  </div>

                  <div className="rounded-sm bg-ivory/3 border border-ivory/8 p-2">
                    <span className="block text-[9px] text-ivory-dim uppercase">
                      BND %
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-accent-gold">
                      {player.boundary_pct.toFixed(1)}%
                    </span>
                  </div>

                  <div className="rounded-sm bg-ivory/3 border border-ivory/8 p-2">
                    <span className="block text-[9px] text-ivory-dim uppercase">
                      {player.death_overs_economy > 0
                        ? "DEATH ECO"
                        : "3Y RUNS"}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-ivory">
                      {player.death_overs_economy > 0
                        ? player.death_overs_economy.toFixed(2)
                        : player.career_3yr_runs}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleInspectPlayerCareer(player)}
                  className={cn(
                    "w-full rounded-sm py-2 px-3 border font-mono text-[10px] uppercase tracking-[0.16em] transition-all cursor-pointer flex items-center justify-center gap-2",
                    isInspectingCareer
                      ? "bg-accent-gold text-stadium-navy border-accent-gold font-bold"
                      : "bg-black/45 hover:bg-ivory/6 border-ivory/12 text-ivory-muted hover:text-ivory"
                  )}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>
                    {isInspectingCareer
                      ? "Viewing in 3-Yr Career Table Above"
                      : "Inspect 3-Yr IPL Career Table"}
                  </span>
                </button>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>

      {visibleCount < filteredAndSortedPlayers.length && (
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 18)}
            className="inline-flex items-center gap-2 rounded-sm bg-accent-gold/15 hover:bg-accent-gold/25 border border-accent-gold/45 px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-accent-gold transition-all cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>
              Load More Players ({filteredAndSortedPlayers.length - visibleCount}{" "}
              Remaining)
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
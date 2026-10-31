"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  ArrowUpRight,
  Award,
  BarChart3,
  Crosshair,
  Droplets,
  Flame,
  Gauge,
  Shield,
  Sparkles,
  Sun,
  Swords,
  X,
  Zap,
} from "lucide-react";
import { FormSparkline } from "@/components/analytics/FormSparkline";
import { CareerTable } from "@/components/player/CareerTable";
import { RollingDigitTicker } from "@/components/scores/RollingDigitTicker";
import { Button } from "@/components/ui/button";
import { SPRING_GENTLE, SPRING_SNAPPY } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { PlayerAnalyticsAggregatedRow, RiskBucket } from "@/types";

export interface PlayerDetailDrawerProps {
  player: PlayerAnalyticsAggregatedRow | null;
  onClose: () => void;
}

type DrawerTabId = "OVERVIEW" | "CAREER_3YR" | "MATCHUP_EDGES";

interface PhaseMatchupProfile {
  powerplayRating: number;
  middleOversRating: number;
  deathOversRating: number;
  vsPaceRating: number;
  vsSpinRating: number;
  batFirstProjection: number;
  chaseDewProjection: number;
  ceilingProjection: number;
  floorProjection: number;
  primaryEdgeNote: string;
  tacticalRoleLabel: string;
}

function DrawerPlayerPortrait({
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
      className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-full p-0.5 shadow-glass-panel"
      style={{
        background: `linear-gradient(135deg, ${primaryHex} 0%, #c8b273 100%)`,
      }}
    >
      <Image
        src={src}
        alt={fullName}
        width={96}
        height={96}
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

function derivePhaseAndMatchupProfile(
  player: PlayerAnalyticsAggregatedRow
): PhaseMatchupProfile {
  const baseForm = player.form_4m_avg;
  const srBoost = Math.max(0, (player.career_3yr_sr - 130) * 0.45);
  const isBowler = player.role === "BOWL";
  const isAllRounder = player.role === "ALL";

  const powerplayRating = Math.min(
    98,
    Math.max(
      54,
      Math.round(
        isBowler
          ? 78 + (9.0 - Math.min(9.0, player.career_3yr_economy)) * 8
          : 74 + srBoost * 0.8
      )
    )
  );

  const middleOversRating = Math.min(
    97,
    Math.max(
      56,
      Math.round(
        isAllRounder
          ? 86 + (player.credits - 8.0) * 4
          : 72 + (baseForm - 55) * 0.55
      )
    )
  );

  const deathOversRating = Math.min(
    99,
    Math.max(
      58,
      Math.round(
        isBowler && player.death_overs_economy > 0
          ? 88 + (9.5 - Math.min(9.5, player.death_overs_economy)) * 6
          : 76 + player.boundary_pct * 0.28
      )
    )
  );

  const vsPaceRating = Math.min(
    97,
    Math.max(60, Math.round(75 + player.boundary_pct * 0.26))
  );

  const vsSpinRating = Math.min(
    96,
    Math.max(
      58,
      Math.round(
        72 + (player.career_3yr_sr - 125) * 0.38 + (isAllRounder ? 5 : 0)
      )
    )
  );

  const batFirstProjection = Math.round(baseForm * 0.96 + 4);
  const chaseDewProjection = Math.round(
    isBowler ? baseForm * 0.92 + 2 : baseForm * 1.08 + 6
  );
  const ceilingProjection = Math.round(
    Math.max(batFirstProjection, chaseDewProjection) * 1.38
  );
  const floorProjection = Math.max(18, Math.round(baseForm * 0.58));

  const tacticalRoleLabel = isBowler
    ? "Powerplay & Death-Overs Strike Spearhead"
    : isAllRounder
      ? "Dual-Innings Batting & Bowling Floor Anchor"
      : player.role === "WK"
        ? "Glovework Catch Bonus + Top-Order Enforcer"
        : "High-Boundary Top/Middle Order Accelerator";

  const primaryEdgeNote = isBowler
    ? `Maintains a ${player.death_overs_economy.toFixed(2)} death-overs economy with high dot-ball pressure and +30 pt wicket + +8 pt bowled/LBW upside.`
    : isAllRounder
      ? `Dual-phase contributor generating ${player.boundary_pct.toFixed(1)}% boundary runs alongside ${player.career_3yr_wickets} career wickets across 3 IPL seasons.`
      : `Converts ${player.boundary_pct.toFixed(1)}% of scoring strokes into boundaries (${player.career_3yr_sr.toFixed(1)} 3-Yr SR), surging in 2nd-innings evening dew chases.`;

  return {
    powerplayRating,
    middleOversRating,
    deathOversRating,
    vsPaceRating,
    vsSpinRating,
    batFirstProjection,
    chaseDewProjection,
    ceilingProjection,
    floorProjection,
    primaryEdgeNote,
    tacticalRoleLabel,
  };
}

function PlayerDrawerContent({
  player,
  onClose,
}: {
  player: PlayerAnalyticsAggregatedRow;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<DrawerTabId>("OVERVIEW");

  const matchupProfile = useMemo(
    () => derivePhaseAndMatchupProfile(player),
    [player]
  );

  return (
    <div className="flex h-full flex-col justify-between overflow-hidden">
      <div className="relative border-b border-ivory/12 bg-black/65 px-6 pt-4 pb-6 sm:px-8">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-0.75"
          style={{
            background: `linear-gradient(90deg, ${player.franchise_primary_hex} 0%, #c8b273 50%, transparent 100%)`,
          }}
        />

        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-ivory/20 md:hidden" />

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <DrawerPlayerPortrait
              key={player.external_api_id}
              avatarUrl={player.avatar_url}
              fullName={player.full_name}
              primaryHex={player.franchise_primary_hex}
            />

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest border"
                  style={{
                    borderColor: player.franchise_primary_hex,
                    backgroundColor: `${player.franchise_primary_hex}28`,
                    color: "#f4f1ea",
                  }}
                >
                  {player.franchise_code}
                </span>

                <span className="rounded-sm bg-accent-gold/15 border border-accent-gold/40 px-2 py-0.5 font-mono text-[10px] font-semibold text-accent-gold uppercase tracking-wider">
                  {player.role} &bull; {player.credits.toFixed(1)} Cr
                </span>

                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-widest border",
                    getBucketBadgeStyle(player.recommended_risk_bucket)
                  )}
                >
                  {player.recommended_risk_bucket} Bucket
                </span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl text-ivory leading-tight">
                {player.full_name}
              </h2>

              <p className="font-mono text-[11px] text-ivory-muted flex items-center gap-2 tabular-score">
                <span>{matchupProfile.tacticalRoleLabel}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close player drawer"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ivory/5 hover:bg-ivory/12 border border-ivory/15 text-ivory-muted hover:text-ivory transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center gap-1.5 rounded-sm bg-black/60 p-1 border border-ivory/12">
          {(
            [
              {
                id: "OVERVIEW",
                label: "01. Form & Projections",
                icon: Activity,
              },
              {
                id: "CAREER_3YR",
                label: "02. 3-Yr IPL Career",
                icon: BarChart3,
              },
              {
                id: "MATCHUP_EDGES",
                label: "03. Phase & Matchups",
                icon: Swords,
              },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex-1 py-2 px-2.5 text-[10px] font-mono uppercase tracking-[0.14em] transition-colors cursor-pointer z-10 rounded-xs flex items-center justify-center gap-1.5",
                  isSelected
                    ? "text-stadium-navy font-bold"
                    : "text-ivory-muted hover:text-ivory"
                )}
              >
                {isSelected && (
                  <motion.span
                    layoutId="player-drawer-active-tab"
                    transition={SPRING_SNAPPY}
                    className="absolute inset-0 -z-10 rounded-xs bg-accent-gold shadow-turf-glow"
                  />
                )}
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === "OVERVIEW" && (
            <motion.div
              key="tab-overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={SPRING_GENTLE}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono tabular-score">
                <div className="rounded-sm bg-black/50 border border-ivory/12 p-3.5">
                  <span className="block text-[9px] text-ivory-dim uppercase tracking-wider">
                    4-MATCH FORM AVG
                  </span>
                  <div className="mt-1 text-xl font-bold text-ivory">
                    <RollingDigitTicker
                      value={player.form_4m_avg.toFixed(1)}
                      suffix=" pts"
                    />
                  </div>
                </div>

                <div className="rounded-sm bg-black/50 border border-ivory/12 p-3.5">
                  <span className="block text-[9px] text-ivory-dim uppercase tracking-wider">
                    VALUE EFFICIENCY
                  </span>
                  <div className="mt-1 text-xl font-bold text-[#8ec2a8]">
                    <RollingDigitTicker
                      value={player.points_per_credit.toFixed(2)}
                      suffix=" /Cr"
                    />
                  </div>
                </div>

                <div className="rounded-sm bg-black/50 border border-ivory/12 p-3.5">
                  <span className="block text-[9px] text-ivory-dim uppercase tracking-wider">
                    BOUNDARY %
                  </span>
                  <div className="mt-1 text-xl font-bold text-accent-gold">
                    <RollingDigitTicker
                      value={player.boundary_pct.toFixed(1)}
                      suffix="%"
                    />
                  </div>
                </div>

                <div className="rounded-sm bg-black/50 border border-ivory/12 p-3.5">
                  <span className="block text-[9px] text-ivory-dim uppercase tracking-wider">
                    OWNERSHIP %
                  </span>
                  <div className="mt-1 text-xl font-bold text-ivory">
                    <RollingDigitTicker
                      value={player.selection_pct.toFixed(1)}
                      suffix="%"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-sm glass-card border border-ivory/15 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="eyebrow-label text-accent-gold flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5" />
                    RECENT 4-MATCH FORM TRAJECTORY
                  </span>
                  <span className="font-mono text-[10px] text-ivory-dim tabular-score">
                    Green &gt;50 &bull; Gold 25–50 &bull; Red &lt;25
                  </span>
                </div>

                <FormSparkline
                  points={player.recent_form_points}
                  accentHex={player.franchise_primary_hex}
                  width={460}
                  height={76}
                />
              </div>

              <div className="rounded-sm glass-card border border-ivory/15 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-ivory/10 pb-3">
                  <span className="eyebrow-label text-accent-gold flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5" />
                    INNINGS-SPLIT &amp; CEILING PROJECTION MODEL
                  </span>
                  <span className="font-mono text-[10px] text-[#8ec2a8] uppercase tracking-wider">
                    Gemini 3.8 High Thinking
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs tabular-score">
                  <div className="rounded-sm bg-black/45 border border-ivory/10 p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-ivory-muted">
                      <span className="flex items-center gap-1.5">
                        <Sun className="h-3.5 w-3.5 text-accent-gold" />
                        1st Innings (Bat/Bowl First)
                      </span>
                      <span className="text-ivory font-bold">
                        {matchupProfile.batFirstProjection} Pts
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-ivory/10">
                      <div
                        className="h-full rounded-full bg-accent-gold"
                        style={{
                          width: `${Math.min(100, matchupProfile.batFirstProjection)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="rounded-sm bg-black/45 border border-ivory/10 p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-ivory-muted">
                      <span className="flex items-center gap-1.5">
                        <Droplets className="h-3.5 w-3.5 text-[#8ec2a8]" />
                        2nd Innings (Evening Dew)
                      </span>
                      <span className="text-[#8ec2a8] font-bold">
                        {matchupProfile.chaseDewProjection} Pts
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-ivory/10">
                      <div
                        className="h-full rounded-full bg-[#8ec2a8]"
                        style={{
                          width: `${Math.min(100, matchupProfile.chaseDewProjection)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1 font-mono text-xs tabular-score">
                  <div className="flex items-center justify-between rounded-sm bg-ivory/3 border border-ivory/8 px-3.5 py-2.5">
                    <span className="text-ivory-dim">90th Pct Ceiling</span>
                    <span className="text-accent-gold font-bold">
                      {matchupProfile.ceilingProjection} Pts
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-sm bg-ivory/3 border border-ivory/8 px-3.5 py-2.5">
                    <span className="text-ivory-dim">10th Pct Floor</span>
                    <span className="text-ivory font-bold">
                      {matchupProfile.floorProjection} Pts
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "CAREER_3YR" && (
            <motion.div
              key="tab-career-3yr"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={SPRING_GENTLE}
            >
              <CareerTable player={player} compact />
            </motion.div>
          )}

          {activeTab === "MATCHUP_EDGES" && (
            <motion.div
              key="tab-matchup-edges"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={SPRING_GENTLE}
              className="space-y-6"
            >
              <div className="rounded-sm glass-card border border-ivory/15 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-ivory/10 pb-3">
                  <span className="eyebrow-label text-accent-gold flex items-center gap-1.5">
                    <Gauge className="h-3.5 w-3.5" />
                    PHASE-WISE IMPACT RATINGS (OVERS 1–20)
                  </span>
                  <span className="font-mono text-[10px] text-ivory-dim">
                    0–100 Index
                  </span>
                </div>

                <div className="space-y-3.5 font-mono text-xs tabular-score">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-ivory-muted">
                        Powerplay (Overs 1–6 • Field Up)
                      </span>
                      <span className="text-ivory font-bold">
                        {matchupProfile.powerplayRating} / 100
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-black/60 border border-ivory/10">
                      <div
                        className="h-full rounded-full bg-accent-gold"
                        style={{
                          width: `${matchupProfile.powerplayRating}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-ivory-muted">
                        Middle Overs (Overs 7–15 • Spin Squeeze)
                      </span>
                      <span className="text-ivory font-bold">
                        {matchupProfile.middleOversRating} / 100
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-black/60 border border-ivory/10">
                      <div
                        className="h-full rounded-full bg-[#8ec2a8]"
                        style={{
                          width: `${matchupProfile.middleOversRating}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-ivory-muted">
                        Death Overs (Overs 16–20 • High Leverage)
                      </span>
                      <span className="text-accent-gold font-bold">
                        {matchupProfile.deathOversRating} / 100
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-black/60 border border-ivory/10">
                      <div
                        className="h-full rounded-full bg-gold-gradient"
                        style={{
                          width: `${matchupProfile.deathOversRating}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-sm glass-card border border-ivory/15 p-4 space-y-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ivory-dim flex items-center gap-1.5">
                    <Crosshair className="h-3.5 w-3.5 text-accent-gold" />
                    VS EXPRESS PACE (140+ KPH)
                  </span>
                  <p className="font-mono text-2xl font-bold text-ivory tabular-score">
                    {matchupProfile.vsPaceRating}{" "}
                    <span className="text-xs font-normal text-accent-gold">
                      / 100 Edge
                    </span>
                  </p>
                  <p className="text-[11px] text-ivory-muted">
                    True-bounce red soil carry favors back-foot pull and
                    cut trajectories.
                  </p>
                </div>

                <div className="rounded-sm glass-card border border-ivory/15 p-4 space-y-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ivory-dim flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-[#8ec2a8]" />
                    VS WRIST &amp; FINGER SPIN
                  </span>
                  <p className="font-mono text-2xl font-bold text-[#8ec2a8] tabular-score">
                    {matchupProfile.vsSpinRating}{" "}
                    <span className="text-xs font-normal text-ivory-muted">
                      / 100 Edge
                    </span>
                  </p>
                  <p className="text-[11px] text-ivory-muted">
                    High strike rotation minimizes dot-ball clusters during
                    overs 7 to 15.
                  </p>
                </div>
              </div>

              <div className="rounded-sm bg-accent-gold/6 border border-accent-gold/35 p-4 space-y-1.5">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-accent-gold flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5" />
                  SCOUTING &amp; SOLVER SYNTHESIS NOTE
                </span>
                <p className="text-xs sm:text-sm text-ivory leading-relaxed">
                  {matchupProfile.primaryEdgeNote}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-t border-ivory/12 bg-black/75 px-6 py-4 sm:px-8 flex flex-wrap items-center justify-between gap-3">
        <div className="font-mono text-[11px] text-ivory-muted tabular-score">
          <span>Solver Status: </span>
          <strong className="text-[#8ec2a8]">
            Eligible for 30-Team Pool
          </strong>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Sheet
          </Button>
          <Button asChild variant="default" size="sm">
            <Link href="/fantasy">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Lock in 20-Team Arena</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PlayerDetailDrawer({
  player,
  onClose,
}: PlayerDetailDrawerProps) {
  useEffect(() => {
    if (!player) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [player, onClose]);

  return (
    <AnimatePresence>
      {player && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end"
          role="dialog"
          aria-modal="true"
          aria-label={`${player.full_name} career and matchup drawer`}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={SPRING_GENTLE}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          <motion.aside
            key={player.external_api_id}
            initial={{ y: "100%", opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.8 }}
            transition={SPRING_SNAPPY}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.45 }}
            onDragEnd={(_event, info) => {
              if (info.offset.y > 90 || info.velocity.y > 400) {
                onClose();
              }
            }}
            className="relative z-10 w-full max-h-[90vh] md:max-h-none md:h-full md:max-w-2xl rounded-t-md md:rounded-none bg-[#080b0d]/98 border-t md:border-t-0 md:border-l border-ivory/15 shadow-2xl overflow-hidden flex flex-col"
          >
            <PlayerDrawerContent player={player} onClose={onClose} />
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
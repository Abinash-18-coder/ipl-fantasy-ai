"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  ArrowUpRight,
  Droplets,
  Flame,
  Gauge,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  applyMatchAmbientLighting,
  buildDualFranchiseGradient,
  FRANCHISE_THEME_REGISTRY,
} from "@/lib/theme/franchiseTheme";
import { RollingDigitTicker } from "@/components/scores/RollingDigitTicker";
import { Button } from "@/components/ui/button";
import { SPRING_GENTLE, SPRING_SNAPPY } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type {
  BallDeliveryEvent,
  CacheShieldStatus,
  FranchiseCode,
  NormalizedMatchScorecard,
  RollingFixtureCardItem,
} from "@/types";

export interface MatchAmbientHeaderProps {
  initialFixtures: RollingFixtureCardItem[];
  initialScorecard: NormalizedMatchScorecard;
  initialCacheStatus: CacheShieldStatus;
}

const ALL_FRANCHISE_CODES: readonly FranchiseCode[] = [
  "MI",
  "CSK",
  "RCB",
  "KKR",
  "RR",
  "GT",
  "LSG",
  "DC",
  "PBKS",
  "SRH",
];

export function MatchAmbientHeader({
  initialFixtures,
  initialScorecard,
  initialCacheStatus,
}: MatchAmbientHeaderProps) {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [scorecard, setScorecard] =
    useState<NormalizedMatchScorecard>(initialScorecard);
  const [cacheStatus, setCacheStatus] =
    useState<CacheShieldStatus>(initialCacheStatus);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [customHome, setCustomHome] = useState<FranchiseCode | null>(null);
  const [customAway, setCustomAway] = useState<FranchiseCode | null>(null);

  const [chaseRuns, setChaseRuns] = useState<number>(157);
  const [chaseWickets, setChaseWickets] = useState<number>(3);
  const [chaseBallsBowled, setChaseBallsBowled] = useState<number>(96);
  const [targetRuns, setTargetRuns] = useState<number>(199);

  const selectedFixture =
    initialFixtures[activeIdx] ?? initialFixtures[0];

  const effectiveHomeCode: FranchiseCode =
    customHome ??
    selectedFixture?.home_code ??
    scorecard.fixture.home_franchise;

  const effectiveAwayCode: FranchiseCode =
    customAway ??
    selectedFixture?.away_code ??
    scorecard.fixture.away_franchise;

  const { stageBackground, topHairline, homeSpec, awaySpec } =
    buildDualFranchiseGradient(effectiveHomeCode, effectiveAwayCode);

  useEffect(() => {
    applyMatchAmbientLighting(effectiveHomeCode, effectiveAwayCode);
  }, [effectiveHomeCode, effectiveAwayCode]);

  const oversFormatted = `${Math.floor(chaseBallsBowled / 6)}.${
    chaseBallsBowled % 6
  }`;
  const awayLiveScoreFormatted = `${chaseRuns}/${chaseWickets} (${oversFormatted})`;
  const ballsRemaining = Math.max(1, 120 - chaseBallsBowled);
  const runsNeeded = Math.max(0, targetRuns - chaseRuns);

  const computedCrr =
    chaseBallsBowled > 0
      ? ((chaseRuns / chaseBallsBowled) * 6).toFixed(2)
      : "0.00";
  const computedRrr =
    runsNeeded > 0
      ? ((runsNeeded / ballsRemaining) * 6).toFixed(2)
      : "0.00";

  const rrrMinusCrr = Number(computedRrr) - Number(computedCrr);
  const pressureState =
    rrrMinusCrr > 1.5
      ? "HIGH CHASE PRESSURE"
      : rrrMinusCrr > 0
        ? "BALANCED EQUATION"
        : "CHASING ADVANTAGE";

  const handleSimulateDelivery = (
    label: "1" | "4" | "6" | "W",
    runsAdded: number,
    isWicket: boolean
  ) => {
    if (chaseBallsBowled >= 120 || chaseWickets >= 10 || runsNeeded === 0) {
      setChaseRuns(157);
      setChaseWickets(3);
      setChaseBallsBowled(96);
      setTargetRuns(199);
      return;
    }

    const nextBalls = chaseBallsBowled + 1;
    const nextRuns = chaseRuns + runsAdded;
    const nextWickets = isWicketsClamp(chaseWickets + (isWicket ? 1 : 0));

    setChaseBallsBowled(nextBalls);
    setChaseRuns(nextRuns);
    setChaseWickets(nextWickets);

    const newDelivery: BallDeliveryEvent = {
      ball_id: `sim-${Date.now()}`,
      over_number: Math.floor(nextBalls / 6) + 1,
      ball_in_over: (nextBalls % 6) || 6,
      label,
      runs_scored: runsAdded,
      is_boundary_four: label === "4",
      is_boundary_six: label === "6",
      is_wicket: isWicket,
      is_extra: false,
      commentary_short: isWicket
        ? "WICKET! Clean bowled on the yorker length!"
        : `${runsAdded} run(s) added to the chase total`,
    };

    setScorecard((prev) => {
      const firstInn = prev.innings[0];
      if (!firstInn) return prev;
      const updatedDeliveries = [
        ...firstInn.recent_deliveries.slice(-5),
        newDelivery,
      ];
      return {
        ...prev,
        innings: [
          {
            ...firstInn,
            recent_deliveries: updatedDeliveries,
          },
          ...prev.innings.slice(1),
        ],
      };
    });
  };

  const handleSelectFixtureTab = async (
    fixture: RollingFixtureCardItem,
    idx: number
  ) => {
    setActiveIdx(idx);
    setCustomHome(null);
    setCustomAway(null);
    setRefreshing(true);

    if (idx === 0) {
      setChaseRuns(157);
      setChaseWickets(3);
      setChaseBallsBowled(96);
      setTargetRuns(199);
    } else if (idx === 1) {
      setChaseRuns(184);
      setChaseWickets(4);
      setChaseBallsBowled(102);
      setTargetRuns(219);
    } else {
      setChaseRuns(132);
      setChaseWickets(5);
      setChaseBallsBowled(90);
      setTargetRuns(175);
    }

    try {
      const res = await fetch(
        `/api/scores/live?matchId=${encodeURIComponent(
          fixture.external_match_id
        )}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const json = (await res.json()) as {
          scorecard?: NormalizedMatchScorecard;
          cache_status?: CacheShieldStatus;
        };
        if (json.scorecard) {
          setScorecard(json.scorecard);
        }
        if (json.cache_status) {
          setCacheStatus(json.cache_status);
        }
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleManualRefresh = async () => {
    const targetId =
      selectedFixture?.external_match_id ?? scorecard.external_match_id;
    setRefreshing(true);
    try {
      const res = await fetch(
        `/api/scores/live?matchId=${encodeURIComponent(targetId)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const json = (await res.json()) as {
          scorecard?: NormalizedMatchScorecard;
          cache_status?: CacheShieldStatus;
        };
        if (json.scorecard) {
          setScorecard(json.scorecard);
        }
        if (json.cache_status) {
          setCacheStatus(json.cache_status);
        }
      }
    } finally {
      setRefreshing(false);
    }
  };

  const firstInnings = scorecard.innings[0];
  const recentBalls = firstInnings?.recent_deliveries ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-ivory/10 pb-6">
        <div className="inline-flex items-center gap-1.5 rounded-sm bg-black/50 p-1.5 border border-ivory/12">
          {initialFixtures.map((item, idx) => {
            const isSelected = idx === activeIdx && !customHome;
            return (
              <button
                key={item.external_match_id}
                type="button"
                onClick={() => handleSelectFixtureTab(item, idx)}
                className={cn(
                  "relative px-4 py-2 text-[11px] uppercase tracking-[0.16em] transition-colors cursor-pointer z-10 tabular-score rounded-xs",
                  isSelected
                    ? "text-stadium-navy font-bold"
                    : "text-ivory-muted hover:text-ivory"
                )}
              >
                {isSelected && (
                  <motion.span
                    layoutId="scores-match-selector"
                    transition={SPRING_SNAPPY}
                    className="absolute inset-0 -z-10 rounded-xs bg-accent-gold shadow-turf-glow"
                  />
                )}
                <span>
                  {item.home_code} vs {item.away_code} &bull;{" "}
                  {item.day_label.split("•")[0]?.trim()}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-ivory/4 border border-ivory/12 px-3.5 py-1.5 font-mono text-[11px] text-ivory-muted tabular-score">
            <ShieldCheck className="h-3.5 w-3.5 text-[#8ec2a8]" />
            <span>15s Shield: {cacheStatus}</span>
          </span>

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-full bg-ivory/4 hover:bg-ivory/8 border border-ivory/15 px-3.5 py-1.5 font-mono text-[11px] text-accent-gold transition-colors cursor-pointer tabular-score"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", refreshing && "animate-spin")}
            />
            <span>{refreshing ? "Syncing..." : "Sync Telemetry"}</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={`${effectiveHomeCode}-${effectiveAwayCode}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={SPRING_GENTLE}
          style={{
            background: stageBackground,
            boxShadow: `0 28px 80px -16px ${homeSpec.primaryHex}24`,
          }}
          className="relative overflow-hidden rounded-sm border border-ivory/15 p-7 sm:p-10 lg:p-12"
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[2.5px]"
            style={{ background: topHairline }}
          />

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ivory/10 pb-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-black/55 border border-accent-gold/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-accent-gold tabular-score">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-gold animate-pulse-live" />
                {selectedFixture?.status ?? scorecard.fixture.status}
              </span>
              <span className="font-mono text-xs text-ivory-muted tabular-score">
                Match {selectedFixture?.match_number ?? scorecard.fixture.match_number}{" "}
                &bull; {homeSpec.homeVenue}
              </span>
            </div>

            <div className="flex items-center gap-4 font-mono text-xs text-ivory-muted tabular-score">
              <span className="flex items-center gap-1.5">
                <Droplets className="h-3.5 w-3.5 text-accent-gold" />
                Dew Index:{" "}
                <RollingDigitTicker
                  value={selectedFixture?.dew_index ?? scorecard.fixture.dew_index}
                  suffix="/100"
                />
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5 text-ivory">
                <Flame className="h-3.5 w-3.5 text-accent-gold" />
                Par {selectedFixture?.par_score_label ?? "198 – 206"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-11 gap-8 items-center py-8">
            <div className="lg:col-span-4 flex items-center gap-5">
              <div
                className="flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-full border-2 font-display text-2xl sm:text-3xl tracking-[0.14em] text-ivory shadow-glass-panel"
                style={{
                  borderColor: homeSpec.primaryHex,
                  background: `radial-gradient(circle at 30% 30%, ${homeSpec.primaryHex}55 0%, ${homeSpec.secondaryHex}25 65%, #060809 100%)`,
                }}
              >
                {homeSpec.code}
              </div>

              <div className="space-y-1">
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.22em] font-semibold"
                  style={{ color: homeSpec.primaryHex }}
                >
                  HOME FLOODLIGHT &bull; {homeSpec.shortCity}
                </p>
                <h2 className="font-display text-3xl sm:text-4xl text-ivory">
                  {homeSpec.name}
                </h2>
                <div className="pt-1">
                  <RollingDigitTicker
                    value={`${targetRuns - 1}/5 (20.0)`}
                    className="text-2xl sm:text-3xl text-ivory font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 flex flex-col items-center justify-center text-center space-y-3 border-y lg:border-y-0 lg:border-x border-ivory/10 py-5 lg:py-0 px-2">
              <div className="inline-flex items-center gap-2 rounded-sm bg-black/60 border border-ivory/15 px-3.5 py-1.5 shadow-inner">
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <TrendingUp className="h-3.5 w-3.5 text-[#8ec2a8]" />
                  <span className="text-ivory-dim">CRR</span>
                  <RollingDigitTicker
                    value={computedCrr}
                    className="text-ivory font-semibold"
                  />
                </div>

                <span className="h-3.5 w-px bg-ivory/15 mx-1" />

                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <Gauge className="h-3.5 w-3.5 text-accent-gold" />
                  <span className="text-ivory-dim">RRR</span>
                  <RollingDigitTicker
                    value={computedRrr}
                    className="text-accent-gold font-semibold"
                  />
                </div>
              </div>

              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] border tabular-score",
                  rrrMinusCrr > 1.5
                    ? "bg-accent-crimson/20 border-accent-crimson/50 text-[#ffb4b4]"
                    : rrrMinusCrr > 0
                      ? "bg-accent-gold/15 border-accent-gold/40 text-accent-gold"
                      : "bg-sage-turf/20 border-[#8ec2a8]/40 text-[#8ec2a8]"
                )}
              >
                {pressureState}
              </span>

              <p className="text-xs text-ivory-muted max-w-62.5 leading-relaxed">
                {runsNeeded > 0 ? (
                  <>
                    {awaySpec.shortCity} need{" "}
                    <RollingDigitTicker
                      value={runsNeeded}
                      className="text-ivory font-semibold"
                    />{" "}
                    runs in{" "}
                    <RollingDigitTicker
                      value={ballsRemaining}
                      className="text-accent-gold font-semibold"
                    />{" "}
                    balls
                  </>
                ) : (
                  <span className="text-[#8ec2a8] font-medium">
                    Target achieved by {awaySpec.name}!
                  </span>
                )}
              </p>
            </div>

            <div className="lg:col-span-4 flex items-center justify-start lg:justify-end gap-5 lg:text-right">
              <div className="space-y-1 order-2 lg:order-1">
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.22em] font-semibold"
                  style={{ color: awaySpec.primaryHex }}
                >
                  AWAY FLOODLIGHT &bull; {awaySpec.shortCity}
                </p>
                <h2 className="font-display text-3xl sm:text-4xl text-ivory">
                  {awaySpec.name}
                </h2>
                <div className="pt-1 flex lg:justify-end">
                  <RollingDigitTicker
                    value={awayLiveScoreFormatted}
                    className="text-2xl sm:text-3xl text-[#8ec2a8] font-semibold"
                  />
                </div>
              </div>

              <div
                className="order-1 lg:order-2 flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-full border-2 font-display text-2xl sm:text-3xl tracking-[0.14em] text-ivory shadow-glass-panel"
                style={{
                  borderColor: awaySpec.primaryHex,
                  background: `radial-gradient(circle at 30% 30%, ${awaySpec.primaryHex}55 0%, ${awaySpec.secondaryHex}25 65%, #060809 100%)`,
                }}
              >
                {awaySpec.code}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ivory/10 pt-5">
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ivory-dim mr-2 shrink-0">
                RECENT OVER STREAM:
              </span>
              {recentBalls.map((ball) => (
                <span
                  key={ball.ball_id}
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold tabular-score border",
                    ball.is_wicket
                      ? "bg-accent-crimson/25 border-accent-crimson text-[#ffb4b4]"
                      : ball.is_boundary_six
                        ? "bg-accent-gold/25 border-accent-gold text-accent-gold"
                        : ball.is_boundary_four
                          ? "bg-sage-turf/25 border-[#8ec2a8] text-[#8ec2a8]"
                          : "bg-black/50 border-ivory/15 text-ivory-muted"
                  )}
                >
                  {ball.label}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ivory-dim flex items-center gap-1 mr-1">
                <Zap className="h-3 w-3 text-accent-gold" />
                Test Rolling Digits:
              </span>
              <button
                type="button"
                onClick={() => handleSimulateDelivery("1", 1, false)}
                className="rounded-sm bg-black/55 hover:bg-ivory/10 border border-ivory/15 px-2.5 py-1 font-mono text-xs text-ivory cursor-pointer transition-colors"
              >
                +1 Run
              </button>
              <button
                type="button"
                onClick={() => handleSimulateDelivery("4", 4, false)}
                className="rounded-sm bg-sage-turf/20 hover:bg-sage-turf/35 border border-[#8ec2a8]/40 px-2.5 py-1 font-mono text-xs text-[#8ec2a8] cursor-pointer transition-colors"
              >
                +4 Boundary
              </button>
              <button
                type="button"
                onClick={() => handleSimulateDelivery("6", 6, false)}
                className="rounded-sm bg-accent-gold/20 hover:bg-accent-gold/35 border border-accent-gold/50 px-2.5 py-1 font-mono text-xs text-accent-gold cursor-pointer transition-colors"
              >
                +6 Maximum
              </button>
              <button
                type="button"
                onClick={() => handleSimulateDelivery("W", 0, true)}
                className="rounded-sm bg-accent-crimson/20 hover:bg-accent-crimson/35 border border-accent-crimson/50 px-2.5 py-1 font-mono text-xs text-[#ffb4b4] cursor-pointer transition-colors"
              >
                +Wicket
              </button>
            </div>

            <Button asChild variant="default" size="sm">
              <Link href="/fantasy">
                <Sparkles className="h-3.5 w-3.5" />
                <span>OPEN 20-TEAM ARENA</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </motion.section>
      </AnimatePresence>

      <div className="rounded-sm glass-card p-6 border border-ivory/12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="eyebrow-label text-accent-gold flex items-center gap-2">
            <Activity className="h-3.5 w-3.5" />
            DYNAMIC FRANCHISE AMBIENT LAB &bull; TEST ANY RIVALRY
          </p>
          <p className="text-xs text-ivory-muted">
            Click any Home or Away franchise badge below to preview how the
            dual-hemisphere floodlight engine adapts across all 10 IPL teams:
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {ALL_FRANCHISE_CODES.map((code) => {
            const spec = FRANCHISE_THEME_REGISTRY[code];
            const isHome = code === effectiveHomeCode;
            const isAway = code === effectiveAwayCode;

            return (
              <button
                key={code}
                type="button"
                onClick={() => {
                  if (!customHome || (customHome && customAway)) {
                    setCustomHome(code);
                    setCustomAway(
                      code === effectiveAwayCode ? "CSK" : effectiveAwayCode
                    );
                  } else {
                    setCustomAway(code === customHome ? "MI" : code);
                  }
                }}
                style={{
                  borderColor:
                    isHome || isAway
                      ? spec.primaryHex
                      : "rgba(244,241,234,0.12)",
                  backgroundColor:
                    isHome || isAway
                      ? `${spec.primaryHex}25`
                      : "rgba(0,0,0,0.45)",
                }}
                className="rounded-sm px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wider text-ivory border transition-all cursor-pointer hover:scale-105"
              >
                {code}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function isWicketsClamp(val: number): number {
  return Math.min(10, Math.max(0, val));
}
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Droplets,
  Flame,
  Moon,
  Sparkles,
  Sun,
} from "lucide-react";
import {
  buildDualFranchiseGradient,
  getFranchiseTheme,
} from "@/lib/theme/franchiseTheme";
import { RollingDigitTicker } from "@/components/scores/RollingDigitTicker";
import { SPRING_GENTLE, SPRING_SNAPPY } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { FranchiseCode, RollingFixtureCardItem } from "@/types";

export interface UpcomingScheduleCarouselProps {
  rollingFixtures: RollingFixtureCardItem[];
  activeMatchId: string;
  onSelectFixture: (fixture: RollingFixtureCardItem, index: number) => void;
}

type WindowFilter = "ALL_3_DAYS" | "NIGHT_DEW" | "DAY_SPIN";

const EXTENDED_HORIZON_CARDS: readonly RollingFixtureCardItem[] = [
  {
    id: "ipl-sim-match-45",
    external_match_id: "ipl-sim-match-45",
    day_offset: 2,
    day_label: "Day +2 • Night",
    match_number: 45,
    match_date: "2026-11-01",
    start_time_utc: "2026-11-01T14:00:00.000Z",
    time_ist_label: "19:30 IST • Ahmedabad",
    is_day_match: false,
    status: "UPCOMING",
    status_note: "Hybrid Soil • T-48h Radar Active",
    venue_slug: "narendra-modi",
    venue_name: "Narendra Modi Stadium",
    soil_profile: "Hybrid Red & Black Soil",
    home_code: "GT",
    home_city: "Ahmedabad",
    home_primary_hex: "#4a6b82",
    away_code: "SRH",
    away_city: "Hyderabad",
    dew_index: 71,
    par_score_label: "194 – 202",
    core_captain: "S. Gill (2x)",
    differential_pick: "T. Head (1.5x)",
    lineup_pool_count: 30,
  },
  {
    id: "ipl-sim-match-46",
    external_match_id: "ipl-sim-match-46",
    day_offset: 3,
    day_label: "Day +3 • Afternoon",
    match_number: 46,
    match_date: "2026-11-02",
    start_time_utc: "2026-11-02T10:00:00.000Z",
    time_ist_label: "15:30 IST • Lucknow",
    is_day_match: true,
    status: "UPCOMING",
    status_note: "Slow Black Clay • Spin Grip",
    venue_slug: "ekana",
    venue_name: "BRSABV Ekana Stadium",
    soil_profile: "Slow Black Clay • Low Bounce",
    home_code: "LSG",
    home_city: "Lucknow",
    home_primary_hex: "#3b6fb6",
    away_code: "DC",
    away_city: "Delhi",
    dew_index: 29,
    par_score_label: "166 – 174",
    core_captain: "N. Pooran (2x)",
    differential_pick: "K. Yadav (Spin)",
    lineup_pool_count: 30,
  },
];

function formatCountdownString(
  item: RollingFixtureCardItem,
  nowMs: number | null
): string {
  if (item.status === "LIVE") {
    return "LIVE IN PLAY • BALL-BY-BALL";
  }
  if (item.status === "COMPLETED") {
    return "MATCH COMPLETED";
  }
  if (nowMs === null) {
    return `T-MINUS ${item.day_offset * 24 + 6}H 00M`;
  }

  const parsedTargetMs = Date.parse(item.start_time_utc);
  const fallbackTargetMs =
    nowMs + (Math.max(1, item.day_offset) * 20 + 4) * 3600 * 1000;
  const targetMs =
    !Number.isNaN(parsedTargetMs) && parsedTargetMs > nowMs
      ? parsedTargetMs
      : fallbackTargetMs;

  const diffSec = Math.max(0, Math.floor((targetMs - nowMs) / 1000));
  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const seconds = diffSec % 60;

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  return `STARTS IN ${hh}h ${mm}m ${ss}s`;
}

export function UpcomingScheduleCarousel({
  rollingFixtures,
  activeMatchId,
  onSelectFixture,
}: UpcomingScheduleCarouselProps) {
  const [windowFilter, setWindowFilter] =
    useState<WindowFilter>("ALL_3_DAYS");
  const [startIndex, setStartIndex] = useState<number>(0);
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setNowMs(Date.now());
    }, 0);

    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, []);

  const combinedSchedule = useMemo<RollingFixtureCardItem[]>(() => {
    const existingIds = new Set(
      rollingFixtures.map((f) => f.external_match_id)
    );
    const extras = EXTENDED_HORIZON_CARDS.filter(
      (card) => !existingIds.has(card.external_match_id)
    );
    return [...rollingFixtures, ...extras];
  }, [rollingFixtures]);

  const filteredSchedule = useMemo<RollingFixtureCardItem[]>(() => {
    if (windowFilter === "NIGHT_DEW") {
      return combinedSchedule.filter((item) => !item.is_day_match);
    }
    if (windowFilter === "DAY_SPIN") {
      return combinedSchedule.filter((item) => item.is_day_match);
    }
    return combinedSchedule;
  }, [combinedSchedule, windowFilter]);

  const maxStartIndex = Math.max(0, filteredSchedule.length - 3);
  const clampedStart = Math.min(startIndex, maxStartIndex);

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => Math.min(maxStartIndex, prev + 1));
  };

  const visibleCards = filteredSchedule.slice(
    clampedStart,
    clampedStart + 3
  );

  return (
    <section className="rounded-sm glass-card border border-ivory/15 p-6 sm:p-8 shadow-glass-panel space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-ivory/10 pb-5">
        <div className="space-y-1">
          <p className="eyebrow-label text-accent-gold flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            DYNAMIC T-3 DAY TOURNAMENT HORIZON &bull; IST COUNTDOWN
          </p>
          <h2 className="font-display text-2xl sm:text-3xl text-ivory font-normal">
            Upcoming 3-Day{" "}
            <span className="italic text-accent-gold">
              Schedule Carousel.
            </span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1 rounded-sm bg-black/55 p-1 border border-ivory/12">
            {(
              [
                { id: "ALL_3_DAYS", label: "All Fixtures" },
                { id: "NIGHT_DEW", label: "19:30 Dew Games" },
                { id: "DAY_SPIN", label: "15:30 Spin Games" },
              ] as const
            ).map((tab) => {
              const isSelected = windowFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setWindowFilter(tab.id);
                    setStartIndex(0);
                  }}
                  className={cn(
                    "relative px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] transition-colors cursor-pointer z-10 rounded-xs",
                    isSelected
                      ? "text-stadium-navy font-bold"
                      : "text-ivory-muted hover:text-ivory"
                  )}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="schedule-carousel-filter-pill"
                      transition={SPRING_SNAPPY}
                      className="absolute inset-0 -z-10 rounded-xs bg-accent-gold"
                    />
                  )}
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrev}
              disabled={clampedStart === 0}
              aria-label="Previous fixtures"
              className="flex h-8 w-8 items-center justify-center rounded-sm bg-black/55 border border-ivory/15 text-ivory hover:border-accent-gold disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={clampedStart >= maxStartIndex}
              aria-label="Next fixtures"
              className="flex h-8 w-8 items-center justify-center rounded-sm bg-black/55 border border-ivory/15 text-ivory hover:border-accent-gold disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {visibleCards.map((item, idx) => {
          const isSelected = item.external_match_id === activeMatchId;
          const homeSpec = getFranchiseTheme(
            item.home_code as FranchiseCode
          );
          const awaySpec = getFranchiseTheme(
            item.away_code as FranchiseCode
          );
          const { topHairline } = buildDualFranchiseGradient(
            item.home_code as FranchiseCode,
            item.away_code as FranchiseCode
          );

          const originalIdx = rollingFixtures.findIndex(
            (f) => f.external_match_id === item.external_match_id
          );
          const targetTabIndex = originalIdx >= 0 ? originalIdx : idx % 3;
          const countdownText = formatCountdownString(item, nowMs);

          return (
            <motion.div
              key={item.external_match_id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={SPRING_GENTLE}
              onClick={() => onSelectFixture(item, targetTabIndex)}
              className={cn(
                "group relative rounded-sm bg-black/50 border p-6 flex flex-col justify-between space-y-5 transition-all duration-300 cursor-pointer overflow-hidden",
                isSelected
                  ? "border-accent-gold shadow-turf-glow bg-accent-gold/4"
                  : "border-ivory/12 hover:border-ivory/30 hover:bg-ivory/2"
              )}
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-0.5"
                style={{ background: topHairline }}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-ivory/10 pb-3">
                  <span
                    className={cn(
                      "rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider tabular-score",
                      item.status === "LIVE"
                        ? "bg-accent-gold text-stadium-navy"
                        : "bg-ivory/6 text-accent-gold border border-ivory/10"
                    )}
                  >
                    {item.day_label}
                  </span>

                  <span className="inline-flex items-center gap-1 font-mono text-[10px] text-ivory-muted tabular-score">
                    {item.is_day_match ? (
                      <Sun className="h-3 w-3 text-accent-gold" />
                    ) : (
                      <Moon className="h-3 w-3 text-[#8ec2a8]" />
                    )}
                    {item.time_ist_label}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-sm bg-black/60 border border-ivory/10 px-3 py-1.5 font-mono text-[10px] tabular-score">
                  <span className="inline-flex items-center gap-1.5 text-accent-gold font-semibold">
                    <Clock className="h-3 w-3 animate-pulse-live" />
                    {countdownText}
                  </span>
                  <span className="text-ivory-dim">T-30m Swap Armed</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-full border font-display text-sm tracking-widest text-ivory shrink-0"
                      style={{
                        borderColor: homeSpec.primaryHex,
                        backgroundColor: `${homeSpec.primaryHex}28`,
                      }}
                    >
                      {homeSpec.code}
                    </span>
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ivory-dim">
                        HOME
                      </p>
                      <p className="font-display text-xl text-ivory">
                        {homeSpec.shortCity}
                      </p>
                    </div>
                  </div>

                  <span className="font-display italic text-lg text-ivory-dim">
                    vs
                  </span>

                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ivory-dim">
                        AWAY
                      </p>
                      <p className="font-display text-xl text-ivory">
                        {awaySpec.shortCity}
                      </p>
                    </div>
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-full border font-display text-sm tracking-widest text-ivory shrink-0"
                      style={{
                        borderColor: awaySpec.primaryHex,
                        backgroundColor: `${awaySpec.primaryHex}28`,
                      }}
                    >
                      {awaySpec.code}
                    </span>
                  </div>
                </div>

                <div className="rounded-sm bg-ivory/3 border border-ivory/8 p-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono tabular-score">
                    <span className="text-ivory-muted flex items-center gap-1">
                      <Droplets className="h-3 w-3 text-accent-gold" />
                      Dew Index:{" "}
                      <RollingDigitTicker
                        value={item.dew_index}
                        suffix="/100"
                        className="text-ivory font-semibold"
                      />
                    </span>
                    <span className="text-accent-gold flex items-center gap-1">
                      <Flame className="h-3 w-3" />
                      Par {item.par_score_label}
                    </span>
                  </div>

                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-ivory/10">
                    <div
                      className="h-full rounded-full bg-gold-gradient transition-all duration-500"
                      style={{ width: `${item.dew_index}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-ivory-dim truncate">
                    {item.venue_name} &bull; {item.soil_profile}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono tabular-score">
                  <div className="rounded-sm bg-black/45 border border-ivory/8 p-2">
                    <span className="block text-[9px] text-ivory-dim uppercase">
                      CORE CAPTAIN
                    </span>
                    <span className="text-ivory font-medium">
                      {item.core_captain}
                    </span>
                  </div>
                  <div className="rounded-sm bg-black/45 border border-ivory/8 p-2">
                    <span className="block text-[9px] text-ivory-dim uppercase">
                      PUNT PICK
                    </span>
                    <span className="text-accent-gold font-medium">
                      {item.differential_pick}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-ivory/10 pt-3.5 text-[11px] font-mono uppercase tracking-[0.16em]">
                <span
                  className={cn(
                    isSelected
                      ? "text-accent-gold font-semibold"
                      : "text-ivory-muted group-hover:text-ivory"
                  )}
                >
                  {isSelected ? "Active on Stage" : "Load into Pavilion"}
                </span>

                <Link
                  href="/fantasy"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-[#8ec2a8] hover:underline"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Preview 20 Tickets</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
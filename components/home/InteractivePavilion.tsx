"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SPRING_GENTLE, SPRING_SNAPPY } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type {
  RollingFixtureCardItem,
  RollingFixturesApiResponse,
} from "@/types";

interface StadiumProfile {
  id: string;
  name: string;
  city: string;
  soilType: string;
  straightBoundary: string;
  squareBoundary: string;
  paceWicketPct: number;
  spinWicketPct: number;
  chaseWinPct: number;
  eveningDewNote: string;
}

const INITIAL_ROLLING_FIXTURES: readonly RollingFixtureCardItem[] = [
  {
    id: "ipl-sim-match-42",
    external_match_id: "ipl-sim-match-42",
    day_offset: 0,
    day_label: "Today • LIVE",
    match_number: 42,
    match_date: "2026-10-29",
    start_time_utc: "2026-10-29T14:00:00.000Z",
    time_ist_label: "19:30 IST • Wankhede",
    is_day_match: false,
    status: "LIVE",
    status_note: "Chennai Super Kings need 42 runs in 24 balls",
    venue_slug: "wankhede",
    venue_name: "Wankhede Stadium",
    soil_profile: "Red Soil • True Bounce",
    home_code: "MI",
    home_city: "Mumbai",
    home_primary_hex: "#3b6ea5",
    away_code: "CSK",
    away_city: "Chennai",
    dew_index: 78,
    par_score_label: "198 – 206",
    core_captain: "H. Pandya (2x)",
    differential_pick: "M. Pathirana (Death)",
    lineup_pool_count: 30,
  },
  {
    id: "ipl-sim-match-43",
    external_match_id: "ipl-sim-match-43",
    day_offset: 1,
    day_label: "Tomorrow • T-24h",
    match_number: 43,
    match_date: "2026-10-30",
    start_time_utc: "2026-10-30T14:00:00.000Z",
    time_ist_label: "19:30 IST • Chinnaswamy",
    is_day_match: false,
    status: "UPCOMING",
    status_note: "T-24h Provisional 30-Team Pool Synthesized",
    venue_slug: "chinnaswamy",
    venue_name: "M. Chinnaswamy Stadium",
    soil_profile: "Flat Deck • Short Square",
    home_code: "RCB",
    home_city: "Bengaluru",
    home_primary_hex: "#b84242",
    away_code: "KKR",
    away_city: "Kolkata",
    dew_index: 84,
    par_score_label: "214 – 222",
    core_captain: "V. Kohli (2x)",
    differential_pick: "A. Russell (1.5x)",
    lineup_pool_count: 30,
  },
  {
    id: "ipl-sim-match-44",
    external_match_id: "ipl-sim-match-44",
    day_offset: 2,
    day_label: "Day +2 • Preview",
    match_number: 44,
    match_date: "2026-10-31",
    start_time_utc: "2026-10-31T10:00:00.000Z",
    time_ist_label: "15:30 IST • Chepauk",
    is_day_match: true,
    status: "UPCOMING",
    status_note: "Afternoon Spin Deck • T-48h Radar Active",
    venue_slug: "chepauk",
    venue_name: "M. A. Chidambaram Stadium",
    soil_profile: "Dry Clay • Grip & Turn",
    home_code: "CSK",
    home_city: "Chennai",
    home_primary_hex: "#d9a74a",
    away_code: "RR",
    away_city: "Jaipur",
    dew_index: 34,
    par_score_label: "170 – 178",
    core_captain: "R. Jadeja (2x)",
    differential_pick: "Y. Chahal (Spin)",
    lineup_pool_count: 30,
  },
];

const STADIUM_ATLAS: readonly [
  StadiumProfile,
  StadiumProfile,
  StadiumProfile,
  StadiumProfile,
] = [
  {
    id: "wankhede",
    name: "WANKHEDE",
    city: "Mumbai • Arabian Sea Corridor",
    soilType: "Red Soil • High Carry & Swing",
    straightBoundary: "72m",
    squareBoundary: "64m",
    paceWicketPct: 68,
    spinWicketPct: 32,
    chaseWinPct: 67,
    eveningDewNote:
      "Heavy sea-breeze condensation after 20:15 IST skids the ball onto the bat.",
  },
  {
    id: "chepauk",
    name: "CHEPAUK",
    city: "Chennai • Marina Coast",
    soilType: "Black & Red Clay • Slow Turn",
    straightBoundary: "76m",
    squareBoundary: "70m",
    paceWicketPct: 44,
    spinWicketPct: 56,
    chaseWinPct: 46,
    eveningDewNote:
      "Dry afternoon heat bakes the surface; spinners dominate middle overs 7 to 15.",
  },
  {
    id: "eden",
    name: "EDEN GARDENS",
    city: "Kolkata • Hooghly Basin",
    soilType: "Black Cotton Soil • Firm",
    straightBoundary: "71m",
    squareBoundary: "66m",
    paceWicketPct: 61,
    spinWicketPct: 39,
    chaseWinPct: 62,
    eveningDewNote:
      "Fast outfield rewards high backlift power-hitters and seam-up death yorkers.",
  },
  {
    id: "chinnaswamy",
    name: "CHINNASWAMY",
    city: "Bengaluru • 920m Altitude",
    soilType: "Two-Paced Subsurface",
    straightBoundary: "68m",
    squareBoundary: "59m",
    paceWicketPct: 64,
    spinWicketPct: 36,
    chaseWinPct: 71,
    eveningDewNote:
      "High altitude thin air + compact square boundaries favor chasing totals above 210.",
  },
];

export function HeroFixtureConsole() {
  const [fixtures, setFixtures] = useState<readonly RollingFixtureCardItem[]>(
    INITIAL_ROLLING_FIXTURES
  );
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [syncedDb, setSyncedDb] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function loadRollingWindow() {
      try {
        const res = await fetch("/api/fixtures/rolling", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = (await res.json()) as RollingFixturesApiResponse;
        if (isMounted && Array.isArray(json.fixtures) && json.fixtures.length > 0) {
          setFixtures(json.fixtures);
          setSyncedDb(json.synced_with_supabase);
        }
      } catch {
        return;
      }
    }

    loadRollingWindow();

    return () => {
      isMounted = false;
    };
  }, []);

  const fixture = fixtures[selectedIdx] ?? fixtures[0] ?? INITIAL_ROLLING_FIXTURES[0]!;

  return (
    <div className="relative w-full max-w-md">
      <div
        className="pointer-events-none absolute -inset-8 -z-10 rounded-full blur-3xl transition-colors duration-700"
        style={{ backgroundColor: `${fixture.home_primary_hex}35` }}
      />

      <div className="rounded-sm glass-card p-6 sm:p-7 shadow-glass-panel border border-ivory/15 space-y-6">
        <div className="flex items-center justify-between gap-1 rounded-sm bg-black/40 p-1 border border-ivory/10">
          {fixtures.map((item, idx) => {
            const isSelected = idx === selectedIdx;
            return (
              <button
                key={item.external_match_id}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={cn(
                  "relative flex-1 py-1.5 px-2 text-[10px] uppercase tracking-[0.14em] transition-colors cursor-pointer z-10 tabular-score",
                  isSelected
                    ? "text-[#090b0c] font-bold"
                    : "text-ivory-muted hover:text-ivory"
                )}
              >
                {isSelected && (
                  <motion.span
                    layoutId="hero-fixture-day-tab"
                    transition={SPRING_SNAPPY}
                    className="absolute inset-0 -z-10 rounded-xs bg-accent-gold"
                  />
                )}
                {item.day_label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={fixture.external_match_id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={SPRING_GENTLE}
            className="space-y-5"
          >
            <div className="flex items-center justify-between border-b border-ivory/10 pb-3.5">
              <span className="eyebrow-label text-accent-gold">
                MATCH {fixture.match_number} &bull; {fixture.match_date}
              </span>
              <span className="font-mono text-[11px] text-ivory-muted tabular-score">
                {fixture.time_ist_label}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.2em] text-ivory-dim">
                  HOME ({fixture.home_code})
                </p>
                <p className="font-display text-3xl sm:text-4xl text-ivory">
                  {fixture.home_city}
                </p>
                <p className="font-mono text-xs text-accent-gold tabular-score">
                  Dew Index: {fixture.dew_index} / 100
                </p>
              </div>

              <div className="flex flex-col items-center px-2">
                <span className="font-display italic text-2xl text-ivory-dim">
                  vs
                </span>
                <span className="mt-1 font-mono text-[10px] text-ivory-dim tabular-score">
                  Par {fixture.par_score_label}
                </span>
              </div>

              <div className="space-y-1 text-right">
                <p className="text-[10px] uppercase tracking-[0.2em] text-ivory-dim">
                  AWAY ({fixture.away_code})
                </p>
                <p className="font-display text-3xl sm:text-4xl text-ivory">
                  {fixture.away_city}
                </p>
                <p className="font-mono text-xs text-[#8ec2a8] tabular-score">
                  {fixture.lineup_pool_count} Lineups Ready
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-ivory-muted">Evening Dew &amp; Surface</span>
                <span className="font-mono text-ivory tabular-score">
                  {fixture.soil_profile}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-ivory/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${fixture.dew_index}%` }}
                  transition={SPRING_GENTLE}
                  className="h-full rounded-full bg-gold-gradient"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-ivory/10 pt-4 text-xs">
              <div className="rounded-sm bg-ivory/3 p-2.5 border border-ivory/8">
                <p className="text-[9px] uppercase tracking-[0.18em] text-ivory-dim">
                  GEMINI CORE CAPTAIN
                </p>
                <p className="mt-1 font-mono text-xs text-ivory font-medium tabular-score">
                  {fixture.core_captain}
                </p>
              </div>
              <div className="rounded-sm bg-ivory/3 p-2.5 border border-ivory/8">
                <p className="text-[9px] uppercase tracking-[0.18em] text-ivory-dim">
                  PUNT DIFFERENTIAL
                </p>
                <p className="mt-1 font-mono text-xs text-accent-gold font-medium tabular-score">
                  {fixture.differential_pick}
                </p>
              </div>
            </div>

            <div className="space-y-1.5 border-t border-ivory/10 pt-3.5 text-xs text-ivory-muted">
              <div className="flex items-center justify-between">
                <span>Rolling 3-Day Window</span>
                <span className="font-mono text-[11px] text-ivory tabular-score">
                  {syncedDb ? "Supabase DB Synced" : "Redis Edge Cached"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>T-30m Toss Auto-Swap Guard</span>
                <span className="font-mono text-[11px] text-[#8ec2a8] tabular-score">
                  Armed &bull; &lt;1.2s Atomic
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function InteractiveArenaAtlas() {
  const [activeStadiumIdx, setActiveStadiumIdx] = useState<number>(0);
  const stadium = STADIUM_ATLAS[activeStadiumIdx] ?? STADIUM_ATLAS[0];

  return (
    <div className="mx-auto max-w-6xl relative flex flex-col items-center w-full">
      <p className="eyebrow-label mb-8 text-center">
        ARCHITECTURE OF VICTORY &bull; TEN STADIUMS
      </p>

      <div className="relative w-full max-w-3xl aspect-16/10 overflow-hidden rounded-sm shadow-glass-panel border border-ivory/15">
        <div
          className="h-full w-full bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1600&q=85')",
          }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#090b0c]/85 via-[#090b0c]/20 to-transparent" />

        <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-ivory/90 tabular-score">
          <span className="rounded-full bg-black/65 backdrop-blur-md px-3 py-1 border border-ivory/15">
            {stadium.city}
          </span>
          <span className="rounded-full bg-black/65 backdrop-blur-md px-3 py-1 border border-accent-gold/40 text-accent-gold">
            {stadium.soilType}
          </span>
        </div>
      </div>

      <div className="pointer-events-none inset-x-0 top-[38%] -translate-y-1/2 sm:absolute flex items-center justify-between w-full px-2 sm:px-6 mt-6 sm:mt-0">
        <span className="font-display text-4xl sm:text-6xl lg:text-7xl tracking-[0.28em] uppercase text-ivory drop-shadow-2xl">
          THE
        </span>
        <span className="font-display text-4xl sm:text-6xl lg:text-7xl tracking-[0.28em] uppercase text-ivory drop-shadow-2xl">
          ARENA
        </span>
      </div>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3 sm:gap-6">
        {STADIUM_ATLAS.map((item, idx) => {
          const isActive = idx === activeStadiumIdx;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveStadiumIdx(idx)}
              className={cn(
                "relative px-3 py-1.5 text-xs uppercase tracking-[0.26em] transition-colors cursor-pointer",
                isActive
                  ? "text-accent-gold font-semibold"
                  : "text-ivory/65 hover:text-ivory"
              )}
            >
              <span>{item.name}</span>
              {isActive && (
                <motion.span
                  layoutId="arena-stadium-underline"
                  transition={SPRING_SNAPPY}
                  className="absolute bottom-0 left-3 right-3 h-[1.5px] bg-accent-gold"
                />
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={stadium.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={SPRING_GENTLE}
          className="mt-8 w-full max-w-3xl rounded-sm glass-card p-6 border border-ivory/12 shadow-glass-panel"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pb-5 border-b border-ivory/10">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-ivory-dim">
                STRAIGHT BOUNDARY
              </p>
              <p className="mt-1 font-display text-2xl sm:text-3xl text-ivory tabular-score">
                {stadium.straightBoundary}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-ivory-dim">
                SQUARE BOUNDARY
              </p>
              <p className="mt-1 font-display text-2xl sm:text-3xl text-ivory tabular-score">
                {stadium.squareBoundary}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-ivory-dim">
                PACE / SPIN SPLIT
              </p>
              <p className="mt-1 font-display text-2xl sm:text-3xl text-accent-gold tabular-score">
                {stadium.paceWicketPct}% / {stadium.spinWicketPct}%
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-ivory-dim">
                CHASE WIN BIAS
              </p>
              <p className="mt-1 font-display text-2xl sm:text-3xl text-[#8ec2a8] tabular-score">
                {stadium.chaseWinPct}%
              </p>
            </div>
          </div>

          <p className="pt-4 text-xs sm:text-sm text-ivory-muted leading-relaxed">
            <strong className="text-accent-gold font-medium uppercase tracking-[0.14em] text-[11px] mr-2">
              Aerodynamic Note:
            </strong>
            {stadium.eveningDewNote}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SPRING_GENTLE, SPRING_SNAPPY } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface CuratedFixture {
  id: string;
  dayLabel: string;
  matchNumber: string;
  timeIst: string;
  venue: string;
  homeCity: string;
  homeCode: string;
  awayCity: string;
  awayCode: string;
  dewIndex: number;
  parScore: string;
  soilProfile: string;
  ambientHex: string;
  coreCaptain: string;
  differentialPick: string;
}

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

const ROLLING_FIXTURES: readonly [
  CuratedFixture,
  CuratedFixture,
  CuratedFixture,
] = [
  {
    id: "mi-csk",
    dayLabel: "Today • T-6h",
    matchNumber: "Match 42",
    timeIst: "19:30 IST • Wankhede",
    venue: "Wankhede Stadium",
    homeCity: "Mumbai",
    homeCode: "MI",
    awayCity: "Chennai",
    awayCode: "CSK",
    dewIndex: 78,
    parScore: "198 – 206",
    soilProfile: "Red Soil • True Bounce",
    ambientHex: "rgba(59, 110, 165, 0.22)",
    coreCaptain: "H. Pandya (2x)",
    differentialPick: "M. Pathirana (Death)",
  },
  {
    id: "rcb-kkr",
    dayLabel: "Tomorrow • T-24h",
    matchNumber: "Match 43",
    timeIst: "19:30 IST • Chinnaswamy",
    venue: "M. Chinnaswamy",
    homeCity: "Bengaluru",
    homeCode: "RCB",
    awayCity: "Kolkata",
    awayCode: "KKR",
    dewIndex: 84,
    parScore: "212 – 224",
    soilProfile: "Flat Deck • Short Square",
    ambientHex: "rgba(184, 66, 66, 0.20)",
    coreCaptain: "V. Kohli (2x)",
    differentialPick: "A. Russell (1.5x)",
  },
  {
    id: "csk-rr",
    dayLabel: "Day +2 • Preview",
    matchNumber: "Match 44",
    timeIst: "15:30 IST • Chepauk",
    venue: "M. A. Chidambaram",
    homeCity: "Chennai",
    homeCode: "CSK",
    awayCity: "Rajasthan",
    awayCode: "RR",
    dewIndex: 34,
    parScore: "168 – 176",
    soilProfile: "Dry Clay • Grip & Turn",
    ambientHex: "rgba(217, 167, 74, 0.18)",
    coreCaptain: "R. Jadeja (2x)",
    differentialPick: "Y. Chahal (Spin)",
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
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const fixture = ROLLING_FIXTURES[selectedIdx] ?? ROLLING_FIXTURES[0];

  return (
    <div className="relative w-full max-w-md">
      <div
        className="pointer-events-none absolute -inset-8 -z-10 rounded-full blur-3xl transition-colors duration-700"
        style={{ backgroundColor: fixture.ambientHex }}
      />

      <div className="rounded-sm glass-card p-6 sm:p-7 shadow-glass-panel border border-ivory/15 space-y-6">
        <div className="flex items-center justify-between gap-1 rounded-sm bg-black/40 p-1 border border-ivory/10">
          {ROLLING_FIXTURES.map((item, idx) => {
            const isSelected = idx === selectedIdx;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={cn(
                  "relative flex-1 py-1.5 px-2 text-[10px] uppercase tracking-[0.14em] transition-colors cursor-pointer z-10 tabular-score",
                  isSelected
                    ? "text-stadium-navy font-bold"
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
                {item.dayLabel}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={fixture.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={SPRING_GENTLE}
            className="space-y-5"
          >
            <div className="flex items-center justify-between border-b border-ivory/10 pb-3.5">
              <span className="eyebrow-label text-accent-gold">
                {fixture.matchNumber} &bull; CURATED FIXTURE
              </span>
              <span className="font-mono text-[11px] text-ivory-muted tabular-score">
                {fixture.timeIst}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.2em] text-ivory-dim">
                  HOME ({fixture.homeCode})
                </p>
                <p className="font-display text-3xl sm:text-4xl text-ivory">
                  {fixture.homeCity}
                </p>
                <p className="font-mono text-xs text-accent-gold tabular-score">
                  Dew Index: {fixture.dewIndex} / 100
                </p>
              </div>

              <div className="flex flex-col items-center px-2">
                <span className="font-display italic text-2xl text-ivory-dim">
                  vs
                </span>
                <span className="mt-1 font-mono text-[10px] text-ivory-dim tabular-score">
                  Par {fixture.parScore}
                </span>
              </div>

              <div className="space-y-1 text-right">
                <p className="text-[10px] uppercase tracking-[0.2em] text-ivory-dim">
                  AWAY ({fixture.awayCode})
                </p>
                <p className="font-display text-3xl sm:text-4xl text-ivory">
                  {fixture.awayCity}
                </p>
                <p className="font-mono text-xs text-[#8ec2a8] tabular-score">
                  30 Lineups Ready
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-ivory-muted">Evening Dew &amp; Surface</span>
                <span className="font-mono text-ivory tabular-score">
                  {fixture.soilProfile}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-ivory/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${fixture.dewIndex}%` }}
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
                  {fixture.coreCaptain}
                </p>
              </div>
              <div className="rounded-sm bg-ivory/3 p-2.5 border border-ivory/8">
                <p className="text-[9px] uppercase tracking-[0.18em] text-ivory-dim">
                  PUNT DIFFERENTIAL
                </p>
                <p className="mt-1 font-mono text-xs text-accent-gold font-medium tabular-score">
                  {fixture.differentialPick}
                </p>
              </div>
            </div>

            <div className="space-y-1.5 border-t border-ivory/10 pt-3.5 text-xs text-ivory-muted">
              <div className="flex items-center justify-between">
                <span>Solver Bucket Split</span>
                <span className="font-mono text-[11px] text-ivory tabular-score">
                  5 Core &bull; 15 Form &bull; 5 Hist &bull; 5 Punt
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
        <div className="absolute inset-0 bg-linear-to-t from-stadium-navy/85 via-stadium-navy/20 to-transparent" />

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
import React from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MorphTransition } from "@/components/ui/view-transition";
import {
  HeroFixtureConsole,
  InteractiveArenaAtlas,
} from "@/components/home/InteractivePavilion";

const EDITORIAL_CHAPTERS = [
  {
    number: "01 / 04",
    morphName: "hero-scores",
    href: "/scores",
    eyebrow: "PUBLIC MATCH TELEMETRY",
    title: "Live Match Center",
    italicAccent: "& Scorecards.",
    description:
      "Calm, high-precision batting and bowling sheets with rolling tabular digits, real-time win probability, and over-by-over seam tracking.",
    metric: "Sub-200ms Broadcast",
    telemetryStrip: ["0", "1", "4", "W", "2", "6"],
    telemetryLabel: "LIVE OVER STREAM",
  },
  {
    number: "02 / 04",
    morphName: "hero-fantasy",
    href: "/fantasy",
    eyebrow: "GEMINI 3.8 FLASH HIGH + HIGHS SOLVER",
    title: "The 20-Team",
    italicAccent: "Fantasy Arena.",
    description:
      "Thirty mathematically optimal squads synthesized 24 hours before toss, with zero-hallucination Playing XI substitutions 30 minutes prior to first ball.",
    metric: "4 Core + 16 Differential",
    telemetryStrip: ["5 Core", "15 Form", "5 Hist", "5 Punt"],
    telemetryLabel: "30-LINEUP QUOTAS",
  },
  {
    number: "03 / 04",
    morphName: "hero-analytics",
    href: "/analytics",
    eyebrow: "AERODYNAMICS & MICRO-BATTLES",
    title: "Pitch Soil &",
    italicAccent: "Dew Physics.",
    description:
      "Afternoon baking spin surfaces versus evening dew slides across all ten IPL venues, paired with batter-versus-bowler phase matchups.",
    metric: "10 Stadium Profiles",
    telemetryStrip: ["15:30 Spin", "19:30 Dew", "H2H Matrix"],
    telemetryLabel: "ENVIRONMENTAL ENGINE",
  },
  {
    number: "04 / 04",
    morphName: "hero-settings",
    href: "/settings",
    eyebrow: "MUMBAI EDGE • MEMBER ACCESS",
    title: "The Member",
    italicAccent: "Pavilion.",
    description:
      "Seamless Google and passwordless entry, personal portfolio allocation locks, and bespoke franchise ambient stadium lighting.",
    metric: "Private Portfolio",
    telemetryStrip: ["bom1 Edge", "ap-south-1", "RLS Locked"],
    telemetryLabel: "INFRASTRUCTURE",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="relative min-h-[calc(100vh-5rem)] w-full overflow-hidden flex flex-col justify-between px-6 sm:px-10 lg:px-16 pt-10 pb-8">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-35 scale-105"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=2000&q=85')",
            }}
          />
          <div className="absolute inset-0 bg-linear-to-r from-stadium-navy via-stadium-navy/88 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-t from-stadium-navy via-transparent to-stadium-navy/60" />
        </div>

        <div className="mx-auto w-full max-w-7xl my-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-6">
          <div className="lg:col-span-7 space-y-7">
            <div className="inline-flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-gold animate-pulse-live" />
              <p className="eyebrow-label">A LITTLE DATA. A LITTLE MAGIC.</p>
            </div>

            <h1 className="font-display text-5xl sm:text-7xl lg:text-[5.35rem] font-normal tracking-[-0.01em] text-ivory leading-[1.02]">
              Great wins <br />
              start with{" "}
              <span className="italic font-normal text-accent-gold">
                foresight.
              </span>
            </h1>

            <p className="max-w-lg text-base sm:text-[17px] text-ivory-muted font-normal leading-[1.72]">
              Hand-crafted by Gemini 3.8 Flash Deep Research. Mathematically
              balanced for the 100-credit cap — and the last-minute toss swap
              you secretly needed.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button asChild variant="default" size="lg">
                <Link href="/fantasy">
                  <span>EXPLORE 20-TEAM ARENA</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg">
                <Link href="/scores">
                  <span>OUR LIVE SCORECARDS</span>
                </Link>
              </Button>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-6 text-[11px] font-mono text-ivory-dim tabular-score">
              <span>GEMINI 3.8 FLASH (HIGH)</span>
              <span>&bull;</span>
              <span>HIGHS WASM SOLVER</span>
              <span>&bull;</span>
              <span>MUMBAI (BOM1) 4MS</span>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <HeroFixtureConsole />
          </div>
        </div>

        <div className="mx-auto w-full max-w-7xl border-t border-ivory/10 pt-5 flex flex-wrap items-center justify-between gap-4 text-[11px] uppercase tracking-[0.22em] text-ivory-muted">
          <a
            href="#pavilion-chapters"
            className="flex items-center gap-2 hover:text-ivory transition-colors"
          >
            <span>SCROLL TO SHAPE YOUR LINEUPS</span>
            <ArrowDown className="h-3.5 w-3.5 text-accent-gold" />
          </a>

          <span className="tabular-score text-ivory/80">
            01 / 04 &mdash; CRAFTED BY DEEP RESEARCH
          </span>

          <Link
            href="/fantasy"
            className="flex items-center gap-1.5 text-ivory underline underline-offset-8 decoration-accent-gold/60 hover:text-accent-gold transition-colors normal-case tracking-[0.06em] text-xs"
          >
            <span>Skip to Arena</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      <section className="relative w-full cliffs-mist-bg py-24 sm:py-32 px-6 sm:px-10 lg:px-16 overflow-hidden border-t border-ivory/5">
        <InteractiveArenaAtlas />
      </section>

      <section
        id="pavilion-chapters"
        className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-12 py-24 space-y-12"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-ivory/10 pb-8">
          <div className="space-y-2">
            <p className="eyebrow-label text-accent-gold">
              FOUR PILLARS OF MATCH INTELLIGENCE
            </p>
            <h2 className="font-display text-4xl sm:text-5xl text-ivory font-normal">
              Select a chapter to{" "}
              <span className="italic text-accent-gold">begin.</span>
            </h2>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-ivory-dim tabular-score">
            React 19.2 Shared View Transitions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {EDITORIAL_CHAPTERS.map((chapter) => (
            <MorphTransition key={chapter.href} name={chapter.morphName}>
              <Link
                href={chapter.href}
                className="group relative flex flex-col justify-between rounded-sm glass-card p-8 sm:p-10 hover:border-accent-gold/45 transition-all duration-500 shadow-glass-panel"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs tracking-[0.2em] text-accent-gold tabular-score">
                      {chapter.number}
                    </span>
                    <span className="eyebrow-label text-[10px]">
                      {chapter.eyebrow}
                    </span>
                  </div>

                  <h3 className="font-display text-3xl sm:text-4xl text-ivory font-normal leading-tight">
                    {chapter.title}{" "}
                    <span className="italic text-accent-gold">
                      {chapter.italicAccent}
                    </span>
                  </h3>

                  <p className="text-sm sm:text-[15px] text-ivory-muted leading-relaxed">
                    {chapter.description}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 rounded-sm bg-black/35 px-3.5 py-2.5 border border-ivory/8">
                    <span className="text-[9px] uppercase tracking-[0.2em] text-ivory-dim">
                      {chapter.telemetryLabel}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {chapter.telemetryStrip.map((pill, idx) => (
                        <span
                          key={idx}
                          className="rounded-sm bg-ivory/5 px-2 py-0.5 font-mono text-[10px] text-ivory/90 border border-ivory/10 tabular-score"
                        >
                          {pill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-ivory/10 pt-5 text-xs uppercase tracking-[0.18em]">
                  <span className="text-ivory-dim tabular-score">
                    {chapter.metric}
                  </span>
                  <span className="flex items-center gap-2 text-ivory group-hover:text-accent-gold transition-colors">
                    <span>Enter Chapter</span>
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </Link>
            </MorphTransition>
          ))}
        </div>
      </section>

      <footer className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-12 pt-8 pb-16">
        <div className="gold-hairline mb-10" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs text-ivory-dim">
          <div className="space-y-1">
            <p className="font-display text-lg tracking-[0.28em] uppercase text-ivory">
              CRICINTEL
            </p>
            <p className="text-[11px] text-ivory-dim">
              Bespoke IPL Fantasy Intelligence &bull; Free-to-Play Analytical
              Platform
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-[11px] uppercase tracking-[0.18em] tabular-score">
            <span>T-24H PROVISIONAL</span>
            <span>&bull;</span>
            <span>T-30M TOSS AUTO-SWAP</span>
            <span>&bull;</span>
            <span>MUMBAI (AP-SOUTH-1)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
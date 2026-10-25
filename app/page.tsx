import React from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MorphTransition } from "@/components/ui/view-transition";

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
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="relative min-h-[calc(100vh-5rem)] w-full overflow-hidden flex flex-col justify-between px-6 sm:px-10 lg:px-16 pt-12 pb-8">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-35 scale-105 transition-transform duration-1000"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=2000&q=85')",
            }}
          />
          <div className="absolute inset-0 bg-linear-to-r from-stadium-navy via-stadium-navy/88 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-t from-stadium-navy via-transparent to-stadium-navy/60" />
          <div className="absolute right-[8%] top-[12%] h-105 w-105 rounded-full bg-[#c8b273]/10 blur-[130px]" />
        </div>

        <div className="mx-auto w-full max-w-7xl my-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-8">
          <div className="lg:col-span-7 space-y-7">
            <p className="eyebrow-label">
              A LITTLE DATA. A LITTLE MAGIC.
            </p>

            <h1 className="font-display text-5xl sm:text-7xl lg:text-[5.25rem] font-normal tracking-[-0.01em] text-ivory leading-[1.03]">
              Great wins <br />
              start with{" "}
              <span className="italic font-normal text-accent-gold">
                foresight.
              </span>
            </h1>

            <p className="max-w-lg text-base sm:text-[17px] text-ivory-muted font-normal leading-[1.7]">
              Hand-crafted by Gemini 3.8 Flash Deep Research. Mathematically
              balanced for the 100-credit cap — and the last-minute toss swap
              you secretly needed.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-3">
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
          </div>

          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md rounded-sm glass-card p-7 shadow-glass-panel border border-ivory/12 space-y-6">
              <div className="flex items-center justify-between border-b border-ivory/10 pb-4">
                <span className="eyebrow-label text-accent-gold">
                  TONIGHT&apos;S CURATED FIXTURE
                </span>
                <span className="font-mono text-[11px] text-ivory-muted tabular-score">
                  19:30 IST &bull; WANKHEDE
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-ivory-dim">
                    HOME FRANCHISE
                  </p>
                  <p className="font-display text-3xl text-ivory">Mumbai</p>
                  <p className="font-mono text-xs text-accent-gold tabular-score">
                    Dew Index: 78 / 100
                  </p>
                </div>

                <div className="font-display italic text-2xl text-ivory-dim">
                  vs
                </div>

                <div className="space-y-1 text-right">
                  <p className="text-xs uppercase tracking-[0.2em] text-ivory-dim">
                    VISITING FRANCHISE
                  </p>
                  <p className="font-display text-3xl text-ivory">Chennai</p>
                  <p className="font-mono text-xs text-[#8ec2a8] tabular-score">
                    30 Lineups Ready
                  </p>
                </div>
              </div>

              <div className="space-y-2 border-t border-ivory/10 pt-4 text-xs text-ivory-muted">
                <div className="flex items-center justify-between">
                  <span>T-24h Provisional Pool</span>
                  <span className="font-mono text-ivory tabular-score">
                    30 / 30 Verified
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>T-30m Toss Auto-Swap Guard</span>
                  <span className="font-mono text-accent-gold tabular-score">
                    Armed &bull; &lt;1.2s
                  </span>
                </div>
              </div>
            </div>
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
        <div className="mx-auto max-w-6xl relative flex flex-col items-center">
          <p className="eyebrow-label mb-8 text-center">
            ARCHITECTURE OF VICTORY &bull; TEN STADIUMS
          </p>

          <div className="relative w-full max-w-3xl aspect-16/10 overflow-hidden rounded-sm shadow-glass-panel border border-ivory/15">
            <div
              className="h-full w-full bg-cover bg-center transition-transform duration-700 hover:scale-105"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1600&q=85')",
              }}
            />
            <div className="absolute inset-0 bg-linear-to-t from-stadium-navy/80 via-stadium-navy/20 to-transparent" />
          </div>

          <div className="pointer-events-none inset-x-0 top-1/2 -translate-y-1/2 sm:absolute flex items-center justify-between w-full px-2 sm:px-6 mt-6 sm:mt-0">
            <span className="font-display text-4xl sm:text-6xl lg:text-7xl tracking-[0.28em] uppercase text-ivory drop-shadow-2xl">
              THE
            </span>
            <span className="font-display text-4xl sm:text-6xl lg:text-7xl tracking-[0.28em] uppercase text-ivory drop-shadow-2xl">
              ARENA
            </span>
          </div>

          <p className="eyebrow-label mt-8 text-center tracking-[0.28em] text-ivory/80">
            WANKHEDE &bull; CHEPAUK &bull; EDEN GARDENS &bull; CHINNASWAMY
          </p>
        </div>
      </section>

      <section
        id="pavilion-chapters"
        className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-12 py-20 space-y-12"
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
                </div>

                <div className="mt-10 flex items-center justify-between border-t border-ivory/10 pt-5 text-xs uppercase tracking-[0.18em]">
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
    </div>
  );
}
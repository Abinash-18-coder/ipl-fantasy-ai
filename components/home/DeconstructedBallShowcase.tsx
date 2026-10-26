"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, Layers, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SPRING_GENTLE, SPRING_SNAPPY } from "@/lib/motion";
import { cn } from "@/lib/utils";

type ShowcaseMode = "assembled" | "deconstructed" | "synthesis";

interface CalloutItem {
  id: string;
  side: "left" | "right";
  offsetY: number;
  tag: string;
  title: string;
  detail: string;
}

const ANATOMY_CALLOUTS: readonly CalloutItem[] = [
  {
    id: "crown-leather",
    side: "left",
    offsetY: -135,
    tag: "LAYER 01 • CROWN HEMISPHERE",
    title: "Alum-Tanned Obsidian Hide",
    detail: "Models powerplay swing decay from overs 1 to 6 under floodlights.",
  },
  {
    id: "seam-equator",
    side: "right",
    offsetY: -68,
    tag: "LAYER 02 • 80-STITCH EQUATOR",
    title: "Hand-Stitched Champagne Seam",
    detail: "Tracks seam-up wobble, cutter grip, and evening dew skid index.",
  },
  {
    id: "neural-core",
    side: "left",
    offsetY: 0,
    tag: "LAYER 03 • GEMINI 3.8 CORTEX",
    title: "1M-Context Deep Research Core",
    detail: "Synthesizes 4-match rolling form with 3-year IPL venue memory.",
  },
  {
    id: "cork-mantle",
    side: "right",
    offsetY: 68,
    tag: "LAYER 04 • QUILTED MANTLE",
    title: "True-Bounce Pitch Elasticity",
    detail: "Separates red-soil Wankhede carry from black-clay Chepauk turn.",
  },
  {
    id: "highs-base",
    side: "left",
    offsetY: 135,
    tag: "LAYER 05 • HIGHS WASM BASE",
    title: "100.0-Credit Linear Optimizer",
    detail: "Locks 30 non-overlapping squads with <1.2s toss auto-swap.",
  },
];

export function DeconstructedBallShowcase() {
  const [mode, setMode] = useState<ShowcaseMode>("deconstructed");

  const isExploded = mode === "deconstructed";
  const isSynthesis = mode === "synthesis";

  return (
    <section className="relative w-full overflow-hidden border-t border-ivory/8 bg-[#050708] py-24 sm:py-32 px-6 sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-135 w-135 rounded-full bg-[#c8b273]/[0.07] blur-[140px] animate-mist-drift" />
        <div className="absolute left-1/3 top-1/3 h-90 w-160 rounded-full bg-white/3 blur-[110px]" />
      </div>

      <div className="mx-auto max-w-7xl relative z-10 flex flex-col items-center">
        <div className="text-center space-y-3 max-w-2xl">
          <p className="eyebrow-label text-accent-gold">
            EST. 2026 &bull; THE OBSIDIAN SEAM &bull; TAILORED FROM TELEMETRY
          </p>
          <h2 className="font-display text-4xl sm:text-6xl text-ivory font-normal tracking-tight">
            {mode === "assembled" && (
              <>
                Born of darkness.{" "}
                <span className="italic text-accent-gold">Built to win.</span>
              </>
            )}
            {mode === "deconstructed" && (
              <>
                Deconstructed{" "}
                <span className="italic text-accent-gold">by design.</span>
              </>
            )}
            {mode === "synthesis" && (
              <>
                Reserve your{" "}
                <span className="italic text-accent-gold">20-Ticket Edge.</span>
              </>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-ivory-muted leading-relaxed">
            Inspect the five-layer anatomical architecture powering every
            provisional T-24h lineup and T-30m toss substitution.
          </p>
        </div>

        <div className="mt-8 inline-flex items-center gap-1 rounded-full glass-dock p-1.5 border border-ivory/15">
          {(
            [
              { id: "assembled", label: "01 • Assembled Sphere" },
              { id: "deconstructed", label: "02 • Exploded Anatomy" },
              { id: "synthesis", label: "03 • Portfolio Synthesis" },
            ] as const
          ).map((tab) => {
            const active = mode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMode(tab.id)}
                className={cn(
                  "relative rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.16em] transition-colors cursor-pointer z-10 tabular-score",
                  active
                    ? "text-stadium-navy font-bold"
                    : "text-ivory-muted hover:text-ivory"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="anatomy-mode-pill"
                    transition={SPRING_SNAPPY}
                    className="absolute inset-0 -z-10 rounded-full bg-accent-gold shadow-turf-glow"
                  />
                )}
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative mt-12 w-full min-h-135 flex flex-col lg:flex-row items-center justify-center">
          <AnimatePresence>
            {isSynthesis && (
              <motion.div
                key="synthesis-card"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={SPRING_GENTLE}
                className="w-full lg:w-1/2 max-w-lg rounded-sm glass-card p-8 sm:p-10 border border-ivory/15 shadow-glass-panel space-y-6 mb-10 lg:mb-0 lg:mr-12"
              >
                <div className="flex items-center justify-between border-b border-ivory/10 pb-4">
                  <span className="eyebrow-label text-accent-gold">
                    EDITION NO. 30 &bull; MATCH-DAY ALLOCATION
                  </span>
                  <span className="font-mono text-xs text-[#8ec2a8] tabular-score">
                    ★ 99.4% CONSTRAINT LEGALITY
                  </span>
                </div>

                <h3 className="font-display text-3xl sm:text-4xl text-ivory font-normal">
                  Try the 20-Team{" "}
                  <span className="italic text-accent-gold">
                    Obsidian Portfolio
                  </span>{" "}
                  today.
                </h3>

                <p className="text-sm text-ivory-muted leading-relaxed">
                  Each matchday allocation locks the top 4 highest-probability
                  core lineups across all members and samples 16 unique
                  differential tickets tailored to your session.
                </p>

                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div className="rounded-sm bg-black/45 p-3 border border-ivory/10">
                    <p className="font-mono text-[10px] text-ivory-dim uppercase">
                      CREDIT CAP
                    </p>
                    <p className="mt-1 font-display text-2xl text-ivory tabular-score">
                      100.0 Cr
                    </p>
                  </div>
                  <div className="rounded-sm bg-black/45 p-3 border border-ivory/10">
                    <p className="font-mono text-[10px] text-ivory-dim uppercase">
                      TOSS SWAP
                    </p>
                    <p className="mt-1 font-display text-2xl text-accent-gold tabular-score">
                      &lt;1.2s
                    </p>
                  </div>
                  <div className="rounded-sm bg-black/45 p-3 border border-ivory/10">
                    <p className="font-mono text-[10px] text-ivory-dim uppercase">
                      ALLOCATION
                    </p>
                    <p className="mt-1 font-display text-2xl text-[#8ec2a8] tabular-score">
                      20 Teams
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button asChild variant="default" size="lg">
                    <Link href="/fantasy">
                      <span>RESERVE 20 LINEUPS</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setMode("deconstructed")}
                  >
                    <Layers className="h-4 w-4 text-accent-gold" />
                    <span>INSPECT ANATOMY</span>
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            layout
            transition={SPRING_GENTLE}
            className={cn(
              "relative flex items-center justify-center",
              isSynthesis ? "w-full lg:w-5/12" : "w-full max-w-5xl"
            )}
          >
            <div className="relative flex h-120 w-full items-center justify-center">
              <div className="relative flex h-105 w-[320px] items-center justify-center">
                <motion.div
                  animate={{
                    y: isExploded ? -135 : 0,
                    scale: isExploded ? 1.03 : 1,
                  }}
                  transition={SPRING_GENTLE}
                  className="absolute z-30 flex flex-col items-center"
                >
                  <div
                    className="h-28 w-56 rounded-t-full border border-accent-gold/45 shadow-glass-panel relative overflow-hidden"
                    style={{
                      background:
                        "radial-gradient(circle at 35% 30%, #2a1818 0%, #140b0c 55%, #070809 100%)",
                    }}
                  >
                    <div className="absolute inset-x-6 bottom-2 h-0.5 border-b border-dashed border-accent-gold/75" />
                    <div className="absolute left-8 top-6 h-10 w-20 rounded-full bg-white/10 blur-md -rotate-12" />
                  </div>
                </motion.div>

                <motion.div
                  animate={{
                    y: isExploded ? -68 : 0,
                    scaleX: isExploded ? 1.08 : 1,
                    opacity: isExploded ? 1 : 0.9,
                  }}
                  transition={SPRING_GENTLE}
                  className="absolute z-40 flex items-center justify-center"
                >
                  <div className="h-10 w-60 rounded-full border-2 border-dashed border-accent-gold bg-[#c8b273]/10 backdrop-blur-md shadow-turf-glow flex items-center justify-center">
                    <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-accent-gold tabular-score">
                      80-STITCH SEAM EQUATOR
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  animate={{
                    y: 0,
                    scale: isExploded ? 1.05 : 0.72,
                    opacity: isExploded ? 1 : 0,
                  }}
                  transition={SPRING_GENTLE}
                  className="absolute z-50 flex items-center justify-center"
                >
                  <div className="h-24 w-44 rounded-xl glass-dock border border-accent-gold/60 shadow-gold-glow flex flex-col items-center justify-center p-3 text-center">
                    <Sparkles className="h-4 w-4 text-accent-gold mb-1" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ivory font-semibold">
                      GEMINI 3.8 CORTEX
                    </span>
                    <span className="font-mono text-[9px] text-accent-gold tabular-score mt-0.5">
                      1M Context &bull; Flash High
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  animate={{
                    y: isExploded ? 68 : 0,
                    scaleX: isExploded ? 1.04 : 0.9,
                    opacity: isExploded ? 1 : 0,
                  }}
                  transition={SPRING_GENTLE}
                  className="absolute z-30 flex items-center justify-center"
                >
                  <div
                    className="h-12 w-52 rounded-full border border-ivory/25 flex items-center justify-center shadow-glass-panel"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(21,28,31,0.92) 0%, rgba(44,58,62,0.85) 50%, rgba(21,28,31,0.92) 100%)",
                    }}
                  >
                    <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-ivory-muted">
                      QUILTED PITCH ELASTICITY CORE
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  animate={{
                    y: isExploded ? 135 : 0,
                    scale: isExploded ? 1.03 : 1,
                  }}
                  transition={SPRING_GENTLE}
                  className="absolute z-20 flex flex-col items-center"
                >
                  <div
                    className="h-28 w-56 rounded-b-full border border-accent-gold/40 shadow-glass-panel relative overflow-hidden flex items-end justify-center pb-5"
                    style={{
                      background:
                        "radial-gradient(circle at 65% 70%, #1c1314 0%, #0d090a 60%, #050607 100%)",
                    }}
                  >
                    <div className="absolute inset-x-6 top-2 h-0.5 border-t border-dashed border-accent-gold/75" />
                    <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-ivory-dim flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-accent-gold" />
                      HIGHS WASM BASE
                    </span>
                  </div>
                </motion.div>
              </div>

              <AnimatePresence>
                {isExploded && (
                  <motion.div
                    key="callouts-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="hidden lg:block absolute inset-0 pointer-events-none"
                  >
                    {ANATOMY_CALLOUTS.map((callout) => {
                      const isLeft = callout.side === "left";
                      return (
                        <motion.div
                          key={callout.id}
                          initial={{
                            opacity: 0,
                            x: isLeft ? -24 : 24,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          exit={{
                            opacity: 0,
                            x: isLeft ? -16 : 16,
                          }}
                          transition={SPRING_GENTLE}
                          style={{
                            top: `calc(50% + ${callout.offsetY}px)`,
                          }}
                          className={cn(
                            "absolute -translate-y-1/2 flex items-center gap-4 w-85",
                            isLeft
                              ? "left-2 xl:left-8 flex-row text-left"
                              : "right-2 xl:right-8 flex-row-reverse text-right"
                          )}
                        >
                          <div className="flex-1 space-y-1">
                            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-accent-gold tabular-score">
                              {callout.tag}
                            </p>
                            <p className="font-display text-xl text-ivory">
                              {callout.title}
                            </p>
                            <p className="text-xs text-ivory-muted leading-relaxed">
                              {callout.detail}
                            </p>
                          </div>

                          <div className="flex items-center">
                            <span className="h-2 w-2 rounded-full bg-accent-gold shadow-turf-glow" />
                            <span className="h-px w-12 bg-linear-to-r from-accent-gold/70 to-accent-gold/15" />
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {isExploded && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4 mt-6 w-full">
            {ANATOMY_CALLOUTS.map((callout) => (
              <div
                key={callout.id}
                className="rounded-sm glass-card p-4 border border-ivory/10 space-y-1"
              >
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-accent-gold">
                  {callout.tag}
                </p>
                <p className="font-display text-lg text-ivory">
                  {callout.title}
                </p>
                <p className="text-xs text-ivory-muted">{callout.detail}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
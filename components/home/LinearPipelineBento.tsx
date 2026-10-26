"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Cpu, Terminal, Zap } from "lucide-react";
import { SPRING_SNAPPY } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface ShortcutKey {
  key: string;
  label: string;
  actionTitle: string;
  actionDetail: string;
  latency: string;
}

const KEYBOARD_SHORTCUTS: readonly ShortcutKey[] = [
  {
    key: "K",
    label: "Ctrl + K",
    actionTitle: "Open Global Command Palette",
    actionDetail: "Jump instantaneously across Live Scores, 30 AI Lineups & Pitch Dew Atlas.",
    latency: "4ms",
  },
  {
    key: "1",
    label: "Key 1",
    actionTitle: "Filter Bucket 01: Core Safe (5 Teams)",
    actionDetail: "Isolates the 4 locked high-floor lineups shared across Small League grinders.",
    latency: "8ms",
  },
  {
    key: "2",
    label: "Key 2",
    actionTitle: "Filter Bucket 02: Form Heavy (15 Teams)",
    actionDetail: "Weights rolling 4-match strike rate and death-over wicket form.",
    latency: "8ms",
  },
  {
    key: "3",
    label: "Key 3",
    actionTitle: "Filter Bucket 03: IPL Historic (5 Teams)",
    actionDetail: "Prioritizes 3-year venue veterans & high-pressure chase anchors.",
    latency: "8ms",
  },
  {
    key: "4",
    label: "Key 4",
    actionTitle: "Filter Bucket 04: Punt Differentials (5 Teams)",
    actionDetail: "Targets <15% ownership debutants & impact-sub Grand League flyers.",
    latency: "8ms",
  },
  {
    key: "S",
    label: "Key S",
    actionTitle: "Trigger T-30m Toss Auto-Swap Simulation",
    actionDetail: "Replaces any unannounced starter with highest-rated same-role active player.",
    latency: "1.1s",
  },
  {
    key: "D",
    label: "Key D",
    actionTitle: "Open Emerald Roster Diff Modal",
    actionDetail: "Compares any two allocated tickets side-by-side to highlight differential picks.",
    latency: "12ms",
  },
  {
    key: "E",
    label: "Key E",
    actionTitle: "1-Click Team Sheet Clipboard & CSV Export",
    actionDetail: "Formats all 20 allocated tickets for rapid contest entry.",
    latency: "15ms",
  },
];

const INPUT_NODES = [
  {
    id: "pitch",
    title: "Pitch Aerodynamics",
    sub: "Soil & Boundary Geometry",
    y: 45,
  },
  {
    id: "dew",
    title: "Open-Meteo Dew",
    sub: "19:30 IST Humidity Curve",
    y: 115,
  },
  {
    id: "form",
    title: "4-Match Form Spark",
    sub: "Rolling Fantasy Points",
    y: 185,
  },
  {
    id: "history",
    title: "3-Year IPL Memory",
    sub: "H2H & Phase Matchups",
    y: 255,
  },
];

const OUTPUT_BUCKETS = [
  {
    id: "core",
    title: "05 Core Safe",
    sub: "High Floor • Small League",
    y: 45,
  },
  {
    id: "form-out",
    title: "15 Form Heavy",
    sub: "Momentum • Hot Streaks",
    y: 115,
  },
  {
    id: "hist-out",
    title: "05 Historic",
    sub: "3-Yr Venue Specialists",
    y: 185,
  },
  {
    id: "punt-out",
    title: "05 Punt Picks",
    sub: "Debutants • Grand League",
    y: 255,
  },
];

export function LinearPipelineBento() {
  const [selectedKey, setSelectedKey] = useState<string>("K");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      const pressed = e.key.toUpperCase();
      const matched = KEYBOARD_SHORTCUTS.find((item) => item.key === pressed);
      if (matched) {
        setSelectedKey(matched.key);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const activeShortcut =
    KEYBOARD_SHORTCUTS.find((item) => item.key === selectedKey) ??
    KEYBOARD_SHORTCUTS[0];

  return (
    <section className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-12 py-24 space-y-14">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <p className="eyebrow-label text-accent-gold">
          ENGINEERED WITH UNFORGIVING PRECISION
        </p>
        <h2 className="font-display text-4xl sm:text-6xl text-ivory font-normal">
          Unlike any fantasy tool{" "}
          <span className="italic text-accent-gold">you&apos;ve used before.</span>
        </h2>
        <p className="text-sm text-ivory-muted leading-relaxed">
          Real-time neural synthesis connected directly to deterministic integer
          programming and instant keyboard-first navigation.
        </p>
      </div>

      <div className="rounded-sm glass-card p-6 sm:p-10 border border-ivory/12 shadow-glass-panel space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ivory/10 pb-5">
          <div>
            <p className="eyebrow-label text-accent-gold">
              LIVE TELEMETRY CIRCUIT &bull; PIXEL-ACCURATE ROUTING
            </p>
            <h3 className="mt-1 font-display text-2xl sm:text-3xl text-ivory">
              From raw stadium physics to{" "}
              <span className="italic text-accent-gold">
                30 verified lineups.
              </span>
            </h3>
          </div>
          <span className="rounded-full bg-ivory/4 px-3.5 py-1 font-mono text-[11px] text-accent-gold border border-accent-gold/30 tabular-score">
            Hover any node to trace signal
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-2">
          <div className="lg:col-span-3 space-y-3">
            {INPUT_NODES.map((node) => {
              const isHighlighted = hoveredNode === node.id;
              return (
                <div
                  key={node.id}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className={cn(
                    "rounded-sm p-3.5 border transition-all duration-300 cursor-pointer",
                    isHighlighted
                      ? "bg-accent-gold/15 border-accent-gold shadow-turf-glow"
                      : "bg-black/45 border-ivory/10 hover:border-ivory/25"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-ivory">
                      {node.title}
                    </span>
                    <span className="h-2 w-2 rounded-full bg-accent-gold animate-pulse-live" />
                  </div>
                  <p className="mt-0.5 font-mono text-[10px] text-ivory-muted">
                    {node.sub}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-6 relative flex items-center justify-center py-6">
            <svg
              viewBox="0 0 500 300"
              className="w-full h-64 overflow-visible"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="pulse-gold"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="rgba(200,178,115,0.1)" />
                  <stop offset="50%" stopColor="rgba(200,178,115,0.95)" />
                  <stop offset="100%" stopColor="rgba(91,140,117,0.85)" />
                </linearGradient>
              </defs>

              {INPUT_NODES.map((node, idx) => (
                <g key={node.id}>
                  <path
                    d={`M 10 ${node.y} C 120 ${node.y}, 140 150, 250 150`}
                    fill="none"
                    stroke={
                      hoveredNode === node.id
                        ? "rgba(200,178,115,0.85)"
                        : "rgba(244,241,234,0.14)"
                    }
                    strokeWidth={hoveredNode === node.id ? "2.2" : "1.2"}
                  />
                  <motion.circle
                    r="3.5"
                    fill="#c8b273"
                    initial={{ offsetDistance: "0%" }}
                    animate={{
                      cx: [10, 125, 250],
                      cy: [node.y, (node.y + 150) / 2, 150],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      delay: idx * 0.45,
                      ease: "linear",
                    }}
                  />
                </g>
              ))}

              {OUTPUT_BUCKETS.map((bucket, idx) => (
                <g key={bucket.id}>
                  <path
                    d={`M 250 150 C 360 150, 380 ${bucket.y}, 490 ${bucket.y}`}
                    fill="none"
                    stroke={
                      hoveredNode === bucket.id
                        ? "rgba(142,194,168,0.9)"
                        : "rgba(244,241,234,0.14)"
                    }
                    strokeWidth={hoveredNode === bucket.id ? "2.2" : "1.2"}
                  />
                  <motion.circle
                    r="3.5"
                    fill="#8ec2a8"
                    animate={{
                      cx: [250, 370, 490],
                      cy: [150, (150 + bucket.y) / 2, bucket.y],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      delay: idx * 0.45 + 1.1,
                      ease: "linear",
                    }}
                  />
                </g>
              ))}
            </svg>

            <div className="absolute flex flex-col items-center justify-center rounded-xl glass-dock px-6 py-5 border border-accent-gold/50 shadow-gold-glow text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-gold/15 border border-accent-gold/40 mb-2">
                <Cpu className="h-5 w-5 text-accent-gold" />
              </div>
              <span className="font-display text-xl text-ivory">
                Gemini 3.8 + HiGHS
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-accent-gold mt-0.5 tabular-score">
                100.0 CR SOLVER CORE
              </span>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-3">
            {OUTPUT_BUCKETS.map((bucket) => {
              const isHighlighted = hoveredNode === bucket.id;
              return (
                <div
                  key={bucket.id}
                  onMouseEnter={() => setHoveredNode(bucket.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className={cn(
                    "rounded-sm p-3.5 border transition-all duration-300 cursor-pointer text-right",
                    isHighlighted
                      ? "bg-sage-turf/20 border-[#8ec2a8] shadow-turf-glow"
                      : "bg-black/45 border-ivory/10 hover:border-ivory/25"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="h-2 w-2 rounded-full bg-[#8ec2a8]" />
                    <span className="text-xs font-semibold text-ivory tabular-score">
                      {bucket.title}
                    </span>
                  </div>
                  <p className="mt-0.5 font-mono text-[10px] text-ivory-muted">
                    {bucket.sub}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 rounded-sm glass-card p-8 border border-ivory/12 shadow-glass-panel flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="eyebrow-label text-accent-gold">
                BUILT FOR YOUR KEYBOARD
              </p>
              <h3 className="font-display text-3xl text-ivory font-normal">
                Fly through 20 lineups{" "}
                <span className="italic text-accent-gold">in milliseconds.</span>
              </h3>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ivory-dim">
              Press or click any key
            </span>
          </div>

          <div className="rounded-lg bg-[#050708] p-4 border border-ivory/10 space-y-2.5 shadow-inner">
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {KEYBOARD_SHORTCUTS.map((item) => {
                const isSelected = item.key === activeShortcut?.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSelectedKey(item.key)}
                    className={cn(
                      "relative flex flex-col items-center justify-center h-14 rounded-md border font-mono transition-all duration-200 cursor-pointer select-none",
                      isSelected
                        ? "bg-accent-gold text-stadium-navy border-accent-gold shadow-turf-glow -translate-y-0.5 font-bold"
                        : "bg-[#0e1316] text-ivory-muted border-ivory/12 hover:border-ivory/30 hover:text-ivory"
                    )}
                  >
                    <span className="text-sm">{item.key}</span>
                    <span
                      className={cn(
                        "text-[8px] uppercase tracking-wider mt-0.5",
                        isSelected ? "text-stadium-navy/80" : "text-ivory-dim"
                      )}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {activeShortcut && (
              <motion.div
                key={activeShortcut.key}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={SPRING_SNAPPY}
                className="flex items-center justify-between rounded-md bg-ivory/4 px-4 py-3 border border-ivory/10"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-accent-gold/20 px-1.5 py-0.5 font-mono text-[10px] text-accent-gold border border-accent-gold/30">
                      {activeShortcut.label}
                    </span>
                    <span className="text-xs font-semibold text-ivory">
                      {activeShortcut.actionTitle}
                    </span>
                  </div>
                  <p className="text-[11px] text-ivory-muted">
                    {activeShortcut.actionDetail}
                  </p>
                </div>
                <span className="font-mono text-xs text-[#8ec2a8] tabular-score shrink-0 ml-4">
                  {activeShortcut.latency}
                </span>
              </motion.div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 rounded-sm glass-card p-8 border border-ivory/12 shadow-glass-panel flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <p className="eyebrow-label text-accent-gold">
              BREATHTAKINGLY FAST &bull; MUMBAI EDGE
            </p>
            <h3 className="font-display text-3xl text-ivory font-normal">
              Meet your{" "}
              <span className="italic text-accent-gold">Toss Command.</span>
            </h3>
            <p className="text-xs sm:text-sm text-ivory-muted leading-relaxed">
              When captains exchange team sheets 30 minutes before first ball,
              our edge poller detects benched starters and executes atomic
              PostgreSQL swaps across all 30 lineups.
            </p>
          </div>

          <div className="rounded-lg bg-[#050708] p-4 border border-ivory/10 font-mono text-xs space-y-2.5">
            <div className="flex items-center justify-between text-[10px] text-ivory-dim border-b border-ivory/10 pb-2">
              <span className="flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-accent-gold" />
                <span>TOSS_AUTO_SWAP_DAEMON</span>
              </span>
              <span className="text-[#8ec2a8] tabular-score">19:00:04 IST</span>
            </div>

            <div className="space-y-1.5 text-[11px] tabular-score">
              <p className="text-ivory-muted">
                <span className="text-accent-gold">&gt;</span> Playing XI
                confirmed at Wankhede...
              </p>
              <p className="text-[#eb8f8f]">
                <span className="text-accent-crimson">− Benched:</span> D.
                Conway (WK • 8.5 Cr)
              </p>
              <p className="text-[#8ec2a8]">
                <span>+ Swapped:</span> R. Rickelton (WK • 8.5 Cr)
              </p>
              <p className="text-ivory/90 flex items-center justify-between pt-1 border-t border-ivory/8">
                <span className="flex items-center gap-1 text-accent-gold">
                  <Zap className="h-3 w-3" /> 30 / 30 Lineups Re-Verified
                </span>
                <span className="text-ivory-dim">1.14s</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
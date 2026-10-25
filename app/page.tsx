import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Activity,
  ArrowRight,
  BarChart3,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MorphTransition } from "@/components/ui/view-transition";

const FEATURE_CARDS = [
  {
    morphName: "hero-scores",
    href: "/scores",
    badge: "PUBLIC SEO ROUTE",
    badgeVariant: "default" as const,
    title: "Live Match Center & Scorecards",
    description:
      "Cricbuzz & CREX style batting/bowling tables, NumberFlow rolling digits, and Motion ball tracker.",
    metric: "<200ms Broadcast",
    icon: Activity,
  },
  {
    morphName: "hero-fantasy",
    href: "/fantasy",
    badge: "30 AI TEAMS",
    badgeVariant: "provisional" as const,
    title: "20-Team AI Fantasy Arena",
    description:
      "Gemini 3.8 Flash (High + Deep Research) + HiGHS WASM solver. 4 locked core teams + 16 differentials.",
    metric: "100.0 Cr Cap",
    icon: Sparkles,
  },
  {
    morphName: "hero-analytics",
    href: "/analytics",
    badge: "AERODYNAMICS & DEW",
    badgeVariant: "confirmed" as const,
    title: "Pitch & Micro-Matchup Matrix",
    description:
      "Day vs Night surface degradation, Open-Meteo dew index, and Batter vs Bowler head-to-head clashes.",
    metric: "10 IPL Venues",
    icon: BarChart3,
  },
  {
    morphName: "hero-settings",
    href: "/settings",
    badge: "MUMBAI (ap-south-1)",
    badgeVariant: "outline" as const,
    title: "Auth & Franchise Theme Engine",
    description:
      "Supabase SSR Google OAuth, Magic Links, and dynamic ambient franchise stadium lighting.",
    metric: "RLS Protected",
    icon: Settings,
  },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl glass-card p-6 sm:p-10 shadow-glass-panel">
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="confirmed">NEXT.JS 16.3.8 + REACT 19.2</Badge>
            <Badge variant="provisional">
              GEMINI 3.8 FLASH HIGH &bull; DEEP RESEARCH
            </Badge>
            <Badge variant="outline">HIGHS WASM SOLVER</Badge>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
            30 Mathematically Optimal{" "}
            <span className="text-pitch-turf">IPL Fantasy Lineups</span> Before
            Every Toss.
          </h1>

          <p className="text-base text-slate-300 sm:text-lg leading-relaxed">
            Provisional squads generated at{" "}
            <strong className="text-accent-gold tabular-score">
              T-24 Hours
            </strong>
            , with automated zero-hallucination Playing XI swaps at{" "}
            <strong className="text-pitch-turf tabular-score">
              T-30 Minutes
            </strong>
            . Press{" "}
            <kbd className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-pitch-turf border border-slate-700">
              Ctrl+K
            </kbd>{" "}
            anytime to jump between modules.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <Button asChild size="lg" variant="default">
              <Link href="/fantasy">
                <Sparkles className="h-5 w-5" />
                <span>Open 20-Team Fantasy Arena</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline">
              <Link href="/scores">
                <Activity className="h-5 w-5 text-pitch-turf" />
                <span>View Public Live Scorecards</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Interactive Stadium Modules (Click any card to morph)
          </h2>
          <span className="text-xs text-slate-400 tabular-score">
            React 19.2 ViewTransition Active
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <MorphTransition key={card.href} name={card.morphName}>
                <Link
                  href={card.href}
                  className="group block rounded-2xl glass-card p-6 hover:border-pitch-turf/40 transition-all duration-200 shadow-glass-panel"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 group-hover:border-pitch-turf/40 text-pitch-turf">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant={card.badgeVariant}>{card.badge}</Badge>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-pitch-turf transition-colors">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                    {card.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs font-semibold text-slate-300">
                    <span className="tabular-score text-pitch-turf">
                      {card.metric}
                    </span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Enter Module <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </MorphTransition>
            );
          })}
        </div>
      </section>
    </div>
  );
}
// File: app/page.tsx
import React from "react";
import Link from "next/link";
import { Sparkles, Activity, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl glass-card p-6 sm:p-10 shadow-glass-panel">
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="confirmed">NEXT.JS 16.3.8 + REACT 19.2</Badge>
            <Badge variant="provisional">GEMINI 3.8 FLASH (1M CONTEXT)</Badge>
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
            . Press <kbd className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-pitch-turf border border-slate-700">Ctrl+K</kbd> anytime to jump between modules.
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
    </div>
  );
}
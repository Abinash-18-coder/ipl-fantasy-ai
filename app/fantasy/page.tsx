import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MorphTransition } from "@/components/ui/view-transition";

export default function FantasyPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 sm:px-10 py-14 space-y-8">
      <MorphTransition name="hero-fantasy">
        <div className="glass-card rounded-sm p-8 sm:p-12 space-y-6 shadow-glass-panel border border-ivory/12">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ivory/10 pb-5">
            <span className="eyebrow-label text-accent-gold">
              02 / 04 &mdash; GEMINI 3.8 FLASH HIGH + HIGHS SOLVER
            </span>
            <span className="font-mono text-xs text-ivory-muted tabular-score">
              4 Core Locked &bull; 16 Differential
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-normal text-ivory leading-tight">
            The 20-Team{" "}
            <span className="italic text-accent-gold">Fantasy Arena.</span>
          </h1>

          <p className="text-base text-ivory-muted max-w-2xl leading-relaxed">
            Powered by Gemini 3.8 Flash Deep Research and the HiGHS WASM
            integer programming solver. Synthesizes 30 provisional lineups at
            T-24h and executes atomic Playing XI substitutions at T-30m toss.
          </p>

          <div className="pt-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Pavilion</span>
              </Link>
            </Button>
          </div>
        </div>
      </MorphTransition>
    </div>
  );
}
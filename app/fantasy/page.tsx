import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MorphTransition } from "@/components/ui/view-transition";

export default function FantasyPage() {
  return (
    <div className="space-y-6">
      <MorphTransition name="hero-fantasy">
        <div className="glass-card rounded-2xl p-8 space-y-4 shadow-glass-panel">
          <div className="flex items-center justify-between">
            <Badge variant="provisional">30 AI TEAMS &bull; PROTECTED</Badge>
            <span className="text-xs font-semibold text-accent-gold tabular-score">
              4 Core + 16 Differential Split
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Sparkles className="h-7 w-7 text-accent-gold" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              20-Team AI Fantasy Arena
            </h1>
          </div>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Powered by Gemini 3.8 Flash (High + Deep Research) and the HiGHS
            WASM integer programming solver. Generates 30 provisional teams at
            T-24h and executes atomic PostgreSQL auto-swaps at T-30m toss.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Stadium Overview</span>
            </Link>
          </Button>
        </div>
      </MorphTransition>
    </div>
  );
}
import React from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MorphTransition } from "@/components/ui/view-transition";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <MorphTransition name="hero-analytics">
        <div className="glass-card rounded-2xl p-8 space-y-4 shadow-glass-panel">
          <div className="flex items-center justify-between">
            <Badge variant="confirmed">AERODYNAMICS & DEW</Badge>
            <span className="text-xs font-semibold text-pitch-turf tabular-score">
              10 IPL Venues Mapped
            </span>
          </div>
          <div className="flex items-center gap-3">
            <BarChart3 className="h-7 w-7 text-pitch-turf" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Pitch & Micro-Matchup Matrix
            </h1>
          </div>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Day (3:30 PM) vs Night (7:30 PM) pitch degradation models,
            Open-Meteo evening dew index, and Batter vs Bowler head-to-head
            matchups will render here in Phase 2.
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
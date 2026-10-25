import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MorphTransition } from "@/components/ui/view-transition";

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 sm:px-10 py-14 space-y-8">
      <MorphTransition name="hero-analytics">
        <div className="glass-card rounded-sm p-8 sm:p-12 space-y-6 shadow-glass-panel border border-ivory/12">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ivory/10 pb-5">
            <span className="eyebrow-label text-accent-gold">
              03 / 04 &mdash; AERODYNAMICS &amp; MICRO-BATTLES
            </span>
            <span className="font-mono text-xs text-ivory-muted tabular-score">
              10 IPL Stadiums Mapped
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-normal text-ivory leading-tight">
            Pitch Soil &amp;{" "}
            <span className="italic text-accent-gold">Dew Physics.</span>
          </h1>

          <p className="text-base text-ivory-muted max-w-2xl leading-relaxed">
            Day (15:30 IST) baking spin surfaces versus Night (19:30 IST) dew
            slides across all ten IPL venues, paired with batter-versus-bowler
            phase matchups in Phase 2.
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
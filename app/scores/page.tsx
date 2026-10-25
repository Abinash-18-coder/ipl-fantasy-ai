import React from "react";
import Link from "next/link";
import { ArrowLeft, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MorphTransition } from "@/components/ui/view-transition";

export default function ScoresPage() {
  return (
    <div className="space-y-6">
      <MorphTransition name="hero-scores">
        <div className="glass-card rounded-2xl p-8 space-y-4 shadow-glass-panel">
          <div className="flex items-center justify-between">
            <Badge variant="default">PUBLIC SEO ROUTE</Badge>
            <span className="text-xs font-semibold text-pitch-turf tabular-score">
              CRR: 9.45 &bull; RRR: 10.20
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Activity className="h-7 w-7 text-pitch-turf" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Live Match Center & Scorecards
            </h1>
          </div>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Cricbuzz & CREX style batting/bowling tables with sticky player
            columns, tabular-nums digits, NumberFlow rolling scores, and Motion
            ball-by-ball trackers will connect here in Weeks 3 & 4.
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
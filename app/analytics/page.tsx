// File: app/analytics/page.tsx
import React from "react";
import { Badge } from "@/components/ui/badge";

export default function AnalyticsPage() {
  return (
    <div className="glass-card rounded-2xl p-8 space-y-3 shadow-glass-panel">
      <Badge variant="confirmed">AERODYNAMICS & DEW ENGINE</Badge>
      <h1 className="text-2xl font-extrabold text-white">
        Pitch Aerodynamics & Micro-Matchup Matrix
      </h1>
      <p className="text-sm text-slate-300">
        Stadium dimensions, Day vs Night surface degradation, Open-Meteo dew
        index, and Batter vs Bowler head-to-head matchups will render here in Phase 2.
      </p>
    </div>
  );
}
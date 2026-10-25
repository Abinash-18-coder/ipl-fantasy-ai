// File: app/scores/page.tsx
import React from "react";
import { Badge } from "@/components/ui/badge";

export default function ScoresPage() {
  return (
    <div className="glass-card rounded-2xl p-8 space-y-3 shadow-glass-panel">
      <Badge variant="default">PUBLIC SEO ROUTE</Badge>
      <h1 className="text-2xl font-extrabold text-white">
        Live IPL Match Center & Scorecards
      </h1>
      <p className="text-sm text-slate-300">
        Cricbuzz & CREX style batting/bowling scorecards, NumberFlow rolling
        digits, and Motion ball-by-ball trackers will connect here in Weeks 3 & 4.
      </p>
    </div>
  );
}
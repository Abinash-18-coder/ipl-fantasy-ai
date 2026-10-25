// File: app/fantasy/page.tsx
import React from "react";
import { Badge } from "@/components/ui/badge";

export default function FantasyPage() {
  return (
    <div className="glass-card rounded-2xl p-8 space-y-3 shadow-glass-panel">
      <Badge variant="provisional">30 AI TEAMS &bull; PROTECTED ROUTE</Badge>
      <h1 className="text-2xl font-extrabold text-white">
        20-Team AI Fantasy Arena (Rolling 3-Day Window)
      </h1>
      <p className="text-sm text-slate-300">
        4 locked core teams + 16 differential lineups powered by Gemini 3.8
        Flash and the HiGHS WASM solver will render here.
      </p>
    </div>
  );
}
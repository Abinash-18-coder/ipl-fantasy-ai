import React from "react";

export default function GlobalLoadingSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading cricket scorecards and AI fantasy lineups"
      className="space-y-6"
    >
      <div className="glass-card rounded-2xl p-6 border border-slate-800/80 space-y-5">
        <div className="flex items-center justify-between">
          <div className="h-5 w-36 rounded-full shimmer-bg animate-shimmer" />
          <div className="h-5 w-28 rounded-full shimmer-bg animate-shimmer" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center py-2">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl shimmer-bg animate-shimmer" />
            <div className="space-y-2">
              <div className="h-5 w-28 rounded shimmer-bg animate-shimmer" />
              <div className="h-7 w-24 rounded shimmer-bg animate-shimmer tabular-score" />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="h-6 w-40 rounded-full shimmer-bg animate-shimmer" />
            <div className="h-3 w-52 rounded-full shimmer-bg animate-shimmer" />
          </div>

          <div className="flex items-center md:justify-end gap-4">
            <div className="space-y-2 md:text-right">
              <div className="h-5 w-28 rounded shimmer-bg animate-shimmer" />
              <div className="h-7 w-24 rounded shimmer-bg animate-shimmer tabular-score" />
            </div>
            <div className="h-14 w-14 rounded-2xl shimmer-bg animate-shimmer" />
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 border border-slate-800/80 space-y-3">
        <div className="h-5 w-44 rounded shimmer-bg animate-shimmer mb-4" />
        {Array.from({ length: 5 }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            className="grid grid-cols-6 gap-4 items-center py-2.5 border-b border-slate-800/60"
          >
            <div className="col-span-2 h-4 w-36 rounded shimmer-bg animate-shimmer" />
            <div className="h-4 w-10 rounded shimmer-bg animate-shimmer justify-self-end" />
            <div className="h-4 w-10 rounded shimmer-bg animate-shimmer justify-self-end" />
            <div className="h-4 w-10 rounded shimmer-bg animate-shimmer justify-self-end" />
            <div className="h-4 w-12 rounded shimmer-bg animate-shimmer justify-self-end" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="glass-card rounded-xl p-5 border border-slate-800/80 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-5 w-28 rounded shimmer-bg animate-shimmer" />
              <div className="h-5 w-20 rounded-full shimmer-bg animate-shimmer" />
            </div>
            <div className="h-32 w-full rounded-xl shimmer-bg animate-shimmer" />
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div className="h-4 w-24 rounded shimmer-bg animate-shimmer" />
              <div className="h-4 w-24 rounded shimmer-bg animate-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
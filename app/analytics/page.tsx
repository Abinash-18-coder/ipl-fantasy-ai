import React, { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MorphTransition } from "@/components/ui/view-transition";
import { PlayerFormExplorer } from "@/components/analytics/PlayerFormExplorer";
import { getAggregatedPlayerAnalytics } from "@/lib/analytics/playerAggregations";

function AnalyticsExplorerSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-36 w-full rounded-sm glass-card shimmer-bg animate-shimmer border border-ivory/10" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-64 rounded-sm glass-card shimmer-bg animate-shimmer border border-ivory/10" />
        <div className="h-64 rounded-sm glass-card shimmer-bg animate-shimmer border border-ivory/10" />
        <div className="h-64 rounded-sm glass-card shimmer-bg animate-shimmer border border-ivory/10" />
      </div>
    </div>
  );
}

async function AnalyticsDataLoader() {
  await connection();
  const analyticsPayload = await getAggregatedPlayerAnalytics();

  return (
    <PlayerFormExplorer
      initialPlayers={analyticsPayload.players}
      franchiseRollups={analyticsPayload.franchise_rollups}
      dataSource={analyticsPayload.source}
    />
  );
}

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12 py-12 space-y-10">
      <MorphTransition name="hero-analytics">
        <div className="space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="eyebrow-label text-accent-gold">
                03 / 04 &mdash; 4-MATCH FORM SPARKLINES &amp; 3-YEAR TELEMETRY
              </p>
              <h1 className="font-display text-4xl sm:text-6xl font-normal text-ivory leading-tight">
                Pitch &amp; Player{" "}
                <span className="italic text-accent-gold">
                  Intelligence.
                </span>
              </h1>
            </div>

            <Button asChild variant="outline" size="sm">
              <Link href="/">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Overview</span>
              </Link>
            </Button>
          </div>

          <Suspense fallback={<AnalyticsExplorerSkeleton />}>
            <AnalyticsDataLoader />
          </Suspense>
        </div>
      </MorphTransition>
    </div>
  );
}
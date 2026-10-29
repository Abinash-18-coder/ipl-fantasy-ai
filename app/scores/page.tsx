import React, { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MorphTransition } from "@/components/ui/view-transition";
import { MatchAmbientHeader } from "@/components/scores/MatchAmbientHeader";
import { getRollingThreeDayFixtures } from "@/lib/cricket/rollingFixtures";
import { syncAndGetLiveMatchScorecard } from "@/lib/cricket/liveScoreSync";

function ScoresStageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-12 w-full max-w-md rounded-sm shimmer-bg animate-shimmer" />
      <div className="h-80 w-full rounded-sm glass-card shimmer-bg animate-shimmer border border-ivory/10" />
    </div>
  );
}

async function ScoresTelemetryLoader() {
  await connection();

  const rollingPayload = await getRollingThreeDayFixtures();
  const firstFixtureId =
    rollingPayload.fixtures[0]?.external_match_id ?? "ipl-sim-match-42";

  const liveScorePayload = await syncAndGetLiveMatchScorecard(
    firstFixtureId,
    false
  );

  return (
    <MatchAmbientHeader
      initialFixtures={rollingPayload.fixtures}
      initialScorecard={liveScorePayload.scorecard}
      initialCacheStatus={liveScorePayload.cache_status}
    />
  );
}

export default function ScoresPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12 py-12 space-y-10">
      <MorphTransition name="hero-scores">
        <div className="space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="eyebrow-label text-accent-gold">
                01 / 04 &mdash; PUBLIC MATCH TELEMETRY &amp; SCORECARDS
              </p>
              <h1 className="font-display text-4xl sm:text-6xl font-normal text-ivory leading-tight">
                Live Match{" "}
                <span className="italic text-accent-gold">Pavilions.</span>
              </h1>
            </div>

            <Button asChild variant="outline" size="sm">
              <Link href="/">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Overview</span>
              </Link>
            </Button>
          </div>

          <Suspense fallback={<ScoresStageSkeleton />}>
            <ScoresTelemetryLoader />
          </Suspense>
        </div>
      </MorphTransition>
    </div>
  );
}
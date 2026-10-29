import { NextResponse } from "next/server";
import { getRollingThreeDayFixtures } from "@/lib/cricket/rollingFixtures";

export async function GET() {
  const payload = await getRollingThreeDayFixtures();

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      "X-CricIntel-Cache": payload.cache_status,
      "X-CricIntel-Window": `${payload.window_start_date}_to_${payload.window_end_date}`,
      "X-CricIntel-Supabase-Sync": String(payload.synced_with_supabase),
    },
  });
}
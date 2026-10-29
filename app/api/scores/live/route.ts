import { NextResponse, type NextRequest } from "next/server";
import { syncAndGetLiveMatchScorecard } from "@/lib/cricket/liveScoreSync";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get("matchId") ?? "ipl-sim-match-42";
  const force = searchParams.get("force") === "true";

  const result = await syncAndGetLiveMatchScorecard(matchId, force);

  return NextResponse.json(result, {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
      "X-CricIntel-Cache": result.cache_status,
      "X-CricIntel-Backend": result.cache_backend,
      "X-CricIntel-Supabase-Sync": String(result.synced_with_supabase),
    },
  });
}

export async function POST(request: NextRequest) {
  let matchId = "ipl-sim-match-42";

  try {
    const body = (await request.json()) as { matchId?: string };
    if (typeof body.matchId === "string" && body.matchId.trim() !== "") {
      matchId = body.matchId.trim();
    }
  } catch {
    matchId = "ipl-sim-match-42";
  }

  const result = await syncAndGetLiveMatchScorecard(matchId, true);

  return NextResponse.json(result, {
    status: 200,
    headers: {
      "X-CricIntel-Cache": result.cache_status,
      "X-CricIntel-Supabase-Sync": String(result.synced_with_supabase),
    },
  });
}
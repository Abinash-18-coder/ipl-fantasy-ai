import { NextResponse, type NextRequest } from "next/server";
import { getAggregatedPlayerAnalytics } from "@/lib/analytics/playerAggregations";
import type {
  AnalyticsSortField,
  FranchiseCode,
  PlayerRole,
  RiskBucket,
} from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const franchise = (searchParams.get("franchise") ?? "ALL") as
    | FranchiseCode
    | "ALL";
  const role = (searchParams.get("role") ?? "ALL") as PlayerRole | "ALL";
  const riskBucket = (searchParams.get("riskBucket") ?? "ALL") as
    | RiskBucket
    | "ALL";
  const search = searchParams.get("search") ?? "";
  const sortBy = (searchParams.get("sortBy") ??
    "form_4m_avg") as AnalyticsSortField;
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : undefined;

  const payload = await getAggregatedPlayerAnalytics({
    franchise,
    role,
    riskBucket,
    search,
    sortBy,
    limit,
  });

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      "X-CricIntel-Analytics-Source": payload.source,
      "X-CricIntel-Player-Count": String(payload.total_players),
    },
  });
}
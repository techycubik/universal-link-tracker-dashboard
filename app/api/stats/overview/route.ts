import { NextResponse } from "next/server";
import { getOverviewStats } from "@/lib/dynamodb/stats";

export async function GET() {
  try {
    const stats = await getOverviewStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching overview stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

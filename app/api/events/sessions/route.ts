import { NextRequest, NextResponse } from "next/server";
import { getAllSessions, getSessionsByVisitorIP } from "@/lib/dynamodb/events";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const groupBy = searchParams.get("groupBy") || "tracking_id";

    const offset = (page - 1) * limit;

    if (groupBy === "visitor_ip") {
      const result = await getSessionsByVisitorIP(limit, offset);
      return NextResponse.json(result);
    } else {
      const result = await getAllSessions(limit, offset);
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

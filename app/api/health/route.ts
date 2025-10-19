import { NextResponse } from "next/server";

/**
 * Health check endpoint for monitoring and load balancers
 * This endpoint does not require authentication
 */
export async function GET() {
  try {
    // Basic health check - can be extended to check DB connectivity
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
      },
      { status: 503 }
    );
  }
}

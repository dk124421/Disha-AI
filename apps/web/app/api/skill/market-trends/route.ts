import { NextRequest, NextResponse } from "next/server";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const career = searchParams.get("career") || "";
    const location = searchParams.get("location") || "India";

    const response = await fetch(
      `${AI_SERVICE_URL}/skill/market-trends?career_title=${encodeURIComponent(career)}&location=${encodeURIComponent(location)}`,
      { method: "GET" }
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `AI service error: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[/api/skill/market-trends] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch market trends" },
      { status: 500 }
    );
  }
}

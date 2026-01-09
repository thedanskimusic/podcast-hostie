import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { episodes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { showId: string } }
) {
  const { showId } = params;

  if (!showId) {
    return NextResponse.json(
      { error: "showId is required" },
      { status: 400 }
    );
  }

  try {
    const episodesList = await db
      .select()
      .from(episodes)
      .where(eq(episodes.show_id, showId))
      .orderBy(desc(episodes.published_at), desc(episodes.created_at));

    return NextResponse.json(episodesList);
  } catch (error) {
    console.error("Error fetching episodes:", error);
    return NextResponse.json(
      { error: "Failed to fetch episodes" },
      { status: 500 }
    );
  }
}

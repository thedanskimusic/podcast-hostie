import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { shows } from "@/db/schema";
import { eq } from "drizzle-orm";

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
    const show = await db
      .select()
      .from(shows)
      .where(eq(shows.id, showId))
      .limit(1);

    if (show.length === 0) {
      return NextResponse.json(
        { error: "Show not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(show[0]);
  } catch (error) {
    console.error("Error fetching show:", error);
    return NextResponse.json(
      { error: "Failed to fetch show" },
      { status: 500 }
    );
  }
}

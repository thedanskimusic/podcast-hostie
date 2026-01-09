import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { episodes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { episodes, shows } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { showId: string } }
) {
  const { showId } = params;
  const tenantId = request.headers.get("x-tenant-id");

  if (!showId) {
    return NextResponse.json(
      { error: "showId is required" },
      { status: 400 }
    );
  }

  try {
    // If tenant ID is provided, verify the show belongs to that tenant
    if (tenantId) {
      const show = await db
        .select()
        .from(shows)
        .where(eq(shows.id, showId))
        .limit(1);

      if (show.length === 0 || show[0].tenant_id !== tenantId) {
        return NextResponse.json(
          { error: "Show not found" },
          { status: 404 }
        );
      }
    }

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

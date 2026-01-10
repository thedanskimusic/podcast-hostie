import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { episodes, shows } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

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

export async function POST(
  request: NextRequest,
  { params }: { params: { showId: string } }
) {
  const { showId } = params;
  const tenantId = request.headers.get("x-tenant-id");

  if (!tenantId) {
    return NextResponse.json(
      { error: "Tenant ID is required" },
      { status: 401 }
    );
  }

  try {
    // Verify the show belongs to the tenant
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

    // Parse request body
    const body = await request.json();
    const { title, audio_url, duration_seconds, published_at } = body;

    if (!title || !audio_url || !duration_seconds) {
      return NextResponse.json(
        { error: "Title, audio_url, and duration_seconds are required" },
        { status: 400 }
      );
    }

    // Create episode
    const episodeId = randomUUID();
    await db.insert(episodes).values({
      id: episodeId,
      show_id: showId,
      title,
      audio_url,
      duration_seconds: parseInt(duration_seconds, 10),
      published_at: published_at ? new Date(published_at) : null,
    });

    // Query the created episode
    const createdEpisode = await db
      .select()
      .from(episodes)
      .where(eq(episodes.id, episodeId))
      .limit(1);

    return NextResponse.json(createdEpisode[0], { status: 201 });
  } catch (error) {
    console.error("Error creating episode:", error);
    return NextResponse.json(
      { error: "Failed to create episode" },
      { status: 500 }
    );
  }
}

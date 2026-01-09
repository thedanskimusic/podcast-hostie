import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { shows } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tenantId = searchParams.get("tenant_id");

  if (!tenantId) {
    return NextResponse.json(
      { error: "tenant_id is required" },
      { status: 400 }
    );
  }

  try {
    const showsList = await db
      .select()
      .from(shows)
      .where(eq(shows.tenant_id, tenantId));

    return NextResponse.json(showsList);
  } catch (error) {
    console.error("Error fetching shows:", error);
    return NextResponse.json(
      { error: "Failed to fetch shows" },
      { status: 500 }
    );
  }
}

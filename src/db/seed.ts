import { db } from "./index";
import { tenants, shows, episodes, users } from "./schema";

async function seed() {
  try {
    console.log("Seeding database...");

    // Insert test tenant
    const tenantId = "550e8400-e29b-41d4-a716-446655440000";
    await db.insert(tenants).values({
      id: tenantId,
      name: "Acme Podcast Network",
      slug: "acme",
      primary_color: "#3b82f6",
      logo_url: null,
      font_family: "system-ui",
      border_radius: 8,
      custom_domain: null,
    });

    // Insert test shows
    const showId1 = "660e8400-e29b-41d4-a716-446655440001";
    const showId2 = "660e8400-e29b-41d4-a716-446655440002";

    await db.insert(shows).values([
      {
        id: showId1,
        tenant_id: tenantId,
        title: "Tech Talk Weekly",
        description: "Weekly discussions about the latest in technology and innovation.",
        cover_image: null,
        author: "John Doe",
      },
      {
        id: showId2,
        tenant_id: tenantId,
        title: "Business Insights",
        description: "Deep dives into business strategies and market trends.",
        cover_image: null,
        author: "Jane Smith",
      },
    ]);

    // Insert test episodes
    await db.insert(episodes).values([
      {
        id: "770e8400-e29b-41d4-a716-446655440001",
        show_id: showId1,
        title: "Introduction to AI",
        audio_url: "https://example.com/episode1.mp3",
        duration_seconds: 1800,
        published_at: new Date(),
      },
      {
        id: "770e8400-e29b-41d4-a716-446655440002",
        show_id: showId1,
        title: "Future of Web Development",
        audio_url: "https://example.com/episode2.mp3",
        duration_seconds: 2100,
        published_at: new Date(),
      },
      {
        id: "770e8400-e29b-41d4-a716-446655440003",
        show_id: showId2,
        title: "Startup Strategies",
        audio_url: "https://example.com/episode3.mp3",
        duration_seconds: 2400,
        published_at: new Date(),
      },
    ]);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("Seed completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });

import { db } from "./index";
import { tenants, shows, episodes, users, userProgress } from "./schema";

async function seed() {
  try {
    console.log("Seeding database...");

    // Clear existing data in reverse dependency order
    console.log("Clearing existing data...");
    await db.delete(userProgress);
    await db.delete(episodes);
    await db.delete(shows);
    await db.delete(users);
    await db.delete(tenants);

    // Insert test tenants
    const tenantId1 = "550e8400-e29b-41d4-a716-446655440000";
    const tenantId2 = "770e8400-e29b-41d4-a716-446655440000";

    await db.insert(tenants).values([
      {
        id: tenantId1,
        name: "Acme Podcast Network",
        slug: "acme",
        primary_color: "#3b82f6",
        logo_url: null,
        font_family: "system-ui",
        border_radius: 8,
        custom_domain: "acme-podcasts.test",
      },
      {
        id: tenantId2,
        name: "Indie Media Network",
        slug: "indie-media",
        primary_color: "#10b981",
        logo_url: null,
        font_family: "Georgia, serif",
        border_radius: 12,
        custom_domain: "indie-media.test",
      },
    ]);

    // Insert test shows
    const showId1 = "660e8400-e29b-41d4-a716-446655440001";
    const showId2 = "660e8400-e29b-41d4-a716-446655440002";
    const showId3 = "880e8400-e29b-41d4-a716-446655440001";
    const showId4 = "880e8400-e29b-41d4-a716-446655440002";

    await db.insert(shows).values([
      {
        id: showId1,
        tenant_id: tenantId1,
        title: "Tech Talk Weekly",
        description: "Weekly discussions about the latest in technology and innovation.",
        cover_image: null,
        author: "John Doe",
      },
      {
        id: showId2,
        tenant_id: tenantId1,
        title: "Business Insights",
        description: "Deep dives into business strategies and market trends.",
        cover_image: null,
        author: "Jane Smith",
      },
      {
        id: showId3,
        tenant_id: tenantId2,
        title: "Independent Voices",
        description: "Stories and interviews from independent creators and artists.",
        cover_image: null,
        author: "Sarah Johnson",
      },
      {
        id: showId4,
        tenant_id: tenantId2,
        title: "Creative Process",
        description: "Exploring the creative process with musicians, writers, and filmmakers.",
        cover_image: null,
        author: "Michael Chen",
      },
    ]);

    // Insert test episodes with working audio URLs
    // Using publicly available test audio files
    await db.insert(episodes).values([
      // Acme Podcast Network episodes
      {
        id: "770e8400-e29b-41d4-a716-446655440001",
        show_id: showId1,
        title: "Introduction to AI",
        audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        duration_seconds: 1800,
        published_at: new Date(),
      },
      {
        id: "770e8400-e29b-41d4-a716-446655440002",
        show_id: showId1,
        title: "Future of Web Development",
        audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        duration_seconds: 2100,
        published_at: new Date(),
      },
      {
        id: "770e8400-e29b-41d4-a716-446655440003",
        show_id: showId2,
        title: "Startup Strategies",
        audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        duration_seconds: 2400,
        published_at: new Date(),
      },
      // Indie Media Network episodes
      {
        id: "990e8400-e29b-41d4-a716-446655440001",
        show_id: showId3,
        title: "The Art of Storytelling",
        audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        duration_seconds: 2000,
        published_at: new Date(),
      },
      {
        id: "990e8400-e29b-41d4-a716-446655440002",
        show_id: showId4,
        title: "Finding Your Creative Voice",
        audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        duration_seconds: 2200,
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

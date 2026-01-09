import { Tenant } from "./types";

export async function getTenantData(host: string): Promise<Tenant | null> {
  // For now, return a hardcoded tenant for localhost:3000
  if (host === "localhost:3000") {
    return {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Acme Podcast Network",
      slug: "acme",
      primary_color: "#3b82f6",
      logo_url: null,
      font_family: "system-ui",
      border_radius: 8,
      custom_domain: null,
    };
  }

  // TODO: Later, implement database lookup by custom_domain or slug
  return null;
}

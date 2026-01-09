import { Tenant } from "./types";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Get tenant by ID from database
 */
export async function getTenantById(tenantId: string): Promise<Tenant | null> {
  try {
    const result = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const tenant = result[0];
    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      custom_domain: tenant.custom_domain,
      primary_color: tenant.primary_color,
      logo_url: tenant.logo_url,
      font_family: tenant.font_family,
      border_radius: tenant.border_radius,
    };
  } catch (error) {
    console.error("Error fetching tenant by ID:", error);
    return null;
  }
}

/**
 * Get tenant data by tenant ID (from header)
 * Falls back to hostname lookup if needed
 */
export async function getTenantData(tenantId?: string, host?: string): Promise<Tenant | null> {
  // If tenantId is provided (from header), query database
  if (tenantId) {
    const tenant = await getTenantById(tenantId);
    if (tenant) {
      return tenant;
    }
  }

  // Fallback: For localhost development, return hardcoded tenant
  if (host === "localhost:3000" || host === "localhost") {
    return await getTenantById("550e8400-e29b-41d4-a716-446655440000");
  }

  // TODO: Later, implement database lookup by custom_domain or slug if tenantId not found
  return null;
}

"use client";

import { useTenant } from "@/providers/tenant-theme-provider";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function Navbar() {
  const { tenant } = useTenant();

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          {tenant.logo_url ? (
            <Avatar className="h-10 w-10">
              <AvatarImage src={tenant.logo_url} alt={tenant.name} />
              <AvatarFallback>{tenant.name.charAt(0)}</AvatarFallback>
            </Avatar>
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-white font-bold"
              style={{ backgroundColor: tenant.primary_color }}
            >
              {tenant.name.charAt(0)}
            </div>
          )}
          <h1 className="text-xl font-semibold" style={{ color: tenant.primary_color }}>
            {tenant.name}
          </h1>
        </div>
      </div>
    </nav>
  );
}

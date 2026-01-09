"use client";

import React, { createContext, useContext } from "react";
import { Tenant } from "@/lib/types";

interface TenantThemeContextType {
  tenant: Tenant;
}

const TenantThemeContext = createContext<TenantThemeContextType | undefined>(
  undefined
);

export function useTenant() {
  const context = useContext(TenantThemeContext);
  if (!context) {
    throw new Error("useTenant must be used within TenantThemeProvider");
  }
  return context;
}

interface TenantThemeProviderProps {
  tenant: Tenant;
  children: React.ReactNode;
}

export function TenantThemeProvider({
  tenant,
  children,
}: TenantThemeProviderProps) {
  const style = {
    "--brand-primary": tenant.primary_color,
    "--brand-radius": `${tenant.border_radius}px`,
    "--brand-font": tenant.font_family || "system-ui",
  } as React.CSSProperties;

  return (
    <TenantThemeContext.Provider value={{ tenant }}>
      <div style={style} className="min-h-screen">
        {children}
      </div>
    </TenantThemeContext.Provider>
  );
}

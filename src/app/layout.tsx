import type { Metadata } from "next";
import { headers } from "next/headers";
import { TenantThemeProvider } from "@/providers/tenant-theme-provider";
import { getTenantData } from "@/lib/tenant";
import "./globals.css";

export const metadata: Metadata = {
  title: "Podcast Platform",
  description: "Multi-tenant podcast hosting platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  
  const tenant = await getTenantData(host);

  if (!tenant) {
    return (
      <html lang="en">
        <body>
          <div className="flex items-center justify-center min-h-screen">
            <p>Tenant not found for host: {host}</p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        <TenantThemeProvider tenant={tenant}>
          {children}
        </TenantThemeProvider>
      </body>
    </html>
  );
}

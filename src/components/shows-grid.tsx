"use client";

import { useEffect, useState } from "react";
import { useTenant } from "@/providers/tenant-theme-provider";
import { Show } from "@/lib/types";
import { ShowCard } from "./show-card";

export function ShowsGrid() {
  const { tenant } = useTenant();
  const [showsList, setShowsList] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchShows() {
      try {
        // For now, we'll need to handle this server-side later
        // This is a placeholder for the client-side fetch
        const response = await fetch(`/api/shows?tenant_id=${tenant.id}`);
        if (response.ok) {
          const data = await response.json();
          setShowsList(data);
        }
      } catch (error) {
        console.error("Error fetching shows:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchShows();
  }, [tenant.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Loading shows...</p>
      </div>
    );
  }

  if (showsList.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">No shows available yet.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Podcasts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {showsList.map((show) => (
          <ShowCard key={show.id} show={show} />
        ))}
      </div>
    </div>
  );
}

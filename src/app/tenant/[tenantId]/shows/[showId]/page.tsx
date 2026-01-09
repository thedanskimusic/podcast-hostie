"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { AudioPlayer } from "@/components/audio-player";
import { EpisodeCard } from "@/components/episode-card";
import { Show, Episode } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ShowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params?.tenantId as string;
  const showId = params?.showId as string;

  const [show, setShow] = useState<Show | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch show details
        const showResponse = await fetch(`/api/shows/${showId}`);
        if (showResponse.ok) {
          const showData = await showResponse.json();
          setShow(showData);
        }

        // Fetch episodes
        const episodesResponse = await fetch(`/api/shows/${showId}/episodes`);
        if (episodesResponse.ok) {
          const episodesData = await episodesResponse.json();
          setEpisodes(episodesData);
        }
      } catch (error) {
        console.error("Error fetching show data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (showId) {
      fetchData();
    }
  }, [showId]);

  if (loading) {
    return (
      <div className="min-h-screen pb-24">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">Loading show...</p>
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen pb-24">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">Show not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push(`/tenant/${tenantId}`)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shows
        </Button>

        <div className="mb-8">
          {show.cover_image && (
            <div className="aspect-video w-full max-w-md mb-6 rounded-lg overflow-hidden">
              <img
                src={show.cover_image}
                alt={show.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <h1 className="text-4xl font-bold mb-2">{show.title}</h1>
          {show.author && (
            <p className="text-xl text-muted-foreground mb-4">by {show.author}</p>
          )}
          {show.description && (
            <p className="text-muted-foreground max-w-2xl">{show.description}</p>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Episodes</h2>
          {episodes.length === 0 ? (
            <p className="text-muted-foreground">No episodes available yet.</p>
          ) : (
            <div className="space-y-4">
              {episodes.map((episode) => (
                <EpisodeCard
                  key={episode.id}
                  episode={episode}
                  showTitle={show.title}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <AudioPlayer />
    </div>
  );
}

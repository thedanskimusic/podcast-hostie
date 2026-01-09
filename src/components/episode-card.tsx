"use client";

import { Episode } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioPlayer } from "@/providers/audio-player-provider";

interface EpisodeCardProps {
  episode: Episode;
  showTitle?: string;
}

export function EpisodeCard({ episode, showTitle }: EpisodeCardProps) {
  const { setEpisode } = useAudioPlayer();

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}`;
    }
    return `${mins}`;
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handlePlay = () => {
    setEpisode(episode);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{episode.title}</CardTitle>
            {showTitle && (
              <CardDescription className="mt-1">{showTitle}</CardDescription>
            )}
          </div>
          <Button
            onClick={handlePlay}
            size="icon"
            className="shrink-0"
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            <Play className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {episode.published_at && (
            <span>{formatDate(episode.published_at)}</span>
          )}
          <span>{formatDuration(episode.duration_seconds)} min</span>
        </div>
      </CardContent>
    </Card>
  );
}

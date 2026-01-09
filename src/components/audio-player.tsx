"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioPlayer } from "@/providers/audio-player-provider";

export function AudioPlayer() {
  const { currentEpisode } = useAudioPlayer();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const audioSrc = currentEpisode?.audio_url || null;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Reset state when episode changes
    if (!audioSrc) {
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      setError(null);
      setLoading(false);
      return;
    }

    // Update audio source when episode changes
    if (audio.src !== audioSrc) {
      setError(null);
      setLoading(true);
      setCurrentTime(0);
      setIsPlaying(false);
      audio.src = audioSrc;
      audio.load();
    }

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      setDuration(audio.duration);
      setLoading(false);
    };
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => {
      setIsPlaying(true);
      setError(null);
    };
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      setError("Unable to load audio. The file may not be available or the format is not supported.");
      setIsPlaying(false);
      setLoading(false);
    };
    const handleLoadStart = () => {
      setLoading(true);
      setError(null);
    };
    const handleCanPlay = () => {
      setLoading(false);
      setError(null);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [audioSrc]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!currentEpisode) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 shadow-lg">
      <div className="container mx-auto">
        <div className="flex items-center gap-4">
          <div className="shrink-0 min-w-[200px]">
            <p className="text-sm font-medium line-clamp-1">{currentEpisode.title}</p>
            {currentEpisode.show_id && (
              <p className="text-xs text-muted-foreground line-clamp-1">Episode</p>
            )}
          </div>

          <Button
            onClick={togglePlay}
            size="icon"
            className="shrink-0"
            disabled={!audioSrc || loading || !!error}
            style={{ backgroundColor: audioSrc && !error ? "var(--brand-primary)" : undefined }}
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          <div className="flex-1">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleProgressChange}
              disabled={!!error || loading}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(to right, var(--brand-primary) 0%, var(--brand-primary) ${(currentTime / duration) * 100}%, #e5e7eb ${(currentTime / duration) * 100}%, #e5e7eb 100%)`,
              }}
            />
          </div>

          <div className="text-sm text-muted-foreground shrink-0 min-w-[80px] text-right">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {error && (
          <div className="mt-2 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>

      {audioSrc && <audio ref={audioRef} src={audioSrc} />}
    </div>
  );
}

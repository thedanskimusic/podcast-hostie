"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Episode } from "@/lib/types";

interface AudioPlayerContextType {
  currentEpisode: Episode | null;
  setEpisode: (episode: Episode) => void;
  clearEpisode: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(
  undefined
);

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  }
  return context;
}

interface AudioPlayerProviderProps {
  children: React.ReactNode;
}

export function AudioPlayerProvider({ children }: AudioPlayerProviderProps) {
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);

  const setEpisode = useCallback((episode: Episode) => {
    setCurrentEpisode(episode);
  }, []);

  const clearEpisode = useCallback(() => {
    setCurrentEpisode(null);
  }, []);

  return (
    <AudioPlayerContext.Provider
      value={{
        currentEpisode,
        setEpisode,
        clearEpisode,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

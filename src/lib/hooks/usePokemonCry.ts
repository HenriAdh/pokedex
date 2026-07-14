"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface UsePokemonCryOptions {
  url: string | null;
}

export interface UsePokemonCryReturn {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  play: () => void;
  stop: () => void;
  toggle: () => void;
}

export function usePokemonCry({ url }: UsePokemonCryOptions): UsePokemonCryReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load();
      audioRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const play = useCallback(() => {
    if (!url) return;

    setError(null);
    setIsLoading(true);

    if (!audioRef.current) {
      audioRef.current = new Audio(url);
      audioRef.current.preload = "none";

      audioRef.current.addEventListener("canplaythrough", () => {
        setIsLoading(false);
      });

      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false);
      });

      audioRef.current.addEventListener("error", () => {
        setIsLoading(false);
        setIsPlaying(false);
        setError("Failed to load audio");
      });
    }

    audioRef.current.src = url;
    audioRef.current.load();

    audioRef.current.play().then(() => {
      setIsPlaying(true);
      setIsLoading(false);
    }).catch((err) => {
      setIsPlaying(false);
      setIsLoading(false);
      setError(err instanceof Error ? err.message : "Failed to play audio");
    });
  }, [url]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  }, [isPlaying, play, stop]);

  return { isPlaying, isLoading, error, play, stop, toggle };
}

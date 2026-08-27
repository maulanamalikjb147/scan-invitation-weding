"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useAmbientMusic() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getAudio = useCallback((src?: string) => {
    const desired = src || "/music.mp3";
    if (!audioRef.current) {
      const audio = new Audio(desired);
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = 0.45;
      audioRef.current = audio;
    }
    return audioRef.current;
  }, []);

  const start = useCallback(async (src?: string) => {
    const audio = getAudio(src);
    if (src && !audio.src.includes(src.split("/").pop() || src)) {
      // only update if src actually different (handles absolute vs relative)
      try { audio.src = src; audio.load(); } catch {}
    }
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      // Browsers may reject playback when it is not triggered by a gesture.
      // The floating player remains available for the guest to try again.
      setPlaying(false);
    }
  }, [getAudio]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
  }, []);

  const toggle = useCallback((src?: string) => playing ? pause() : void start(src), [pause, playing, start]);

  useEffect(() => () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
  }, []);

  return { playing, start, toggle };
}

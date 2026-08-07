"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useAmbientMusic() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio("/music.mp3");
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = 0.45;
      audioRef.current = audio;
    }
    return audioRef.current;
  }, []);

  const start = useCallback(async () => {
    const audio = getAudio();
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

  const toggle = useCallback(() => playing ? pause() : void start(), [pause, playing, start]);

  useEffect(() => () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
  }, []);

  return { playing, start, toggle };
}

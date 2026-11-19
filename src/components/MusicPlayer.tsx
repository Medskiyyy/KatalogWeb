"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface MusicPlayerProps {
  track: string;
  autoPlayTrigger?: boolean;
  className?: string;
}

export const BUILTIN_MUSIC_URLS: Record<string, string> = {
  "builtin:romance": "/audio/music/romance-piano.mp3",
  "builtin:lofi": "/audio/music/lofi-chat.mp3",
  "builtin:bossa": "/audio/music/bossa-brunch.mp3",
  "builtin:indie": "/audio/music/indie-warm.mp3",
  "builtin:birthday": "/audio/music/birthday-upbeat.mp3",
  "builtin:wedding": "/audio/music/wedding-canon.mp3",
  "builtin:nikah-minang": "/audio/music/nikah-minang.mp3",
  "builtin:nikah-jawa": "/audio/music/nikah-jawa.mp3",
  "builtin:nikah-sunda": "/audio/music/nikah-sunda.mp3",
  "builtin:nikah-bali": "/audio/music/nikah-bali.mp3",
  "builtin:nikah-batak": "/audio/music/nikah-batak.mp3",
  "builtin:nikah-betawi": "/audio/music/nikah-betawi.mp3",
  "builtin:nikah-bugis": "/audio/music/nikah-bugis.mp3",
  "builtin:nikah-palembang": "/audio/music/nikah-palembang.mp3",
  "builtin:nikah-banjar": "/audio/music/nikah-banjar.mp3",
  "builtin:nikah-dayak": "/audio/music/nikah-dayak.mp3",
  "builtin:nikah-melayu": "/audio/music/nikah-melayu.mp3",
  "builtin:nikah-aceh": "/audio/music/nikah-aceh.mp3",
  "builtin:nikah-chinese": "/audio/music/nikah-chinese.mp3",
  "builtin:classic-valse": "/audio/music/classic-valse.mp3",
  "builtin:nocturne-chopin-g": "/audio/music/nocturne-chopin-g.mp3",
  "builtin:nocturne-chopin-f": "/audio/music/nocturne-chopin-f.mp3",
  "builtin:classic-waltz-gentle": "/audio/music/classic-waltz-gentle.mp3",
  "builtin:nocturne-chopin-c": "/audio/music/nocturne-chopin-c.mp3",
};

export function resolveMusicTrackUrl(track: string): string | null {
  const trimmed = track.trim();
  if (!trimmed || trimmed === "none") return null;
  if (trimmed.startsWith("builtin:")) {
    return BUILTIN_MUSIC_URLS[trimmed] ?? BUILTIN_MUSIC_URLS["builtin:romance"];
  }
  return trimmed;
}

export function MusicPlayer({
  track,
  autoPlayTrigger = false,
  className,
}: MusicPlayerProps) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const manualPauseRef = useRef(false);
  const triggeredRef = useRef(false);

  const resolvedUrl = useMemo(() => resolveMusicTrackUrl(track), [track]);

  const stopAudio = useCallback((byUser = false) => {
    if (byUser) {
      manualPauseRef.current = true;
    }
    const el = audioRef.current;
    if (el) {
      el.pause();
    }
    setIsPlaying(false);
  }, []);

  const attemptPlay = useCallback(async (): Promise<boolean> => {
    const el = audioRef.current;
    if (!el || !resolvedUrl) return false;

    manualPauseRef.current = false;
    el.volume = 0.45;
    try {
      await el.play();
      setIsPlaying(true);
      return true;
    } catch {
      setIsPlaying(false);
      return false;
    }
  }, [resolvedUrl]);

  useEffect(() => {
    if (!autoPlayTrigger || !resolvedUrl || manualPauseRef.current) return;
    if (triggeredRef.current) return;
    triggeredRef.current = true;

    let detachGesture = () => {};

    const runAutoPlay = async () => {
      const started = await attemptPlay();
      if (started || manualPauseRef.current) return;

      const onFirstGesture = () => {
        detachGesture();
        if (!manualPauseRef.current) {
          void attemptPlay();
        }
      };

      window.addEventListener("pointerdown", onFirstGesture, { once: true });
      window.addEventListener("keydown", onFirstGesture, { once: true });
      detachGesture = () => {
        window.removeEventListener("pointerdown", onFirstGesture);
        window.removeEventListener("keydown", onFirstGesture);
      };
    };

    const frame = window.requestAnimationFrame(() => {
      void runAutoPlay();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      detachGesture();
    };
  }, [attemptPlay, autoPlayTrigger, resolvedUrl]);

  useEffect(() => {
    triggeredRef.current = false;
  }, [resolvedUrl]);

  if (!resolvedUrl) return null;

  const toggle = () => {
    if (isPlaying) {
      stopAudio(true);
    } else {
      void attemptPlay();
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={resolvedUrl}
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
      />

      <button
        type="button"
        onClick={toggle}
        aria-label={isPlaying ? "Matikan musik latar" : "Putar musik latar"}
        className={cn(
          "fixed right-4 bottom-4 z-40 inline-flex items-center gap-2 rounded-full border border-black/15 bg-white/95 px-3.5 py-2 text-xs font-medium text-zinc-900 shadow-md backdrop-blur-sm transition-transform active:scale-[0.98]",
          className
        )}
      >
        {isPlaying ? (
          <SpeakerHigh size={16} weight="fill" />
        ) : (
          <SpeakerSlash size={16} weight="regular" />
        )}

        <span>{isPlaying ? "Musik Aktif" : "Putar Musik"}</span>

        {isPlaying && (
          <span
            aria-hidden="true"
            className="inline-flex h-3 items-end gap-[2px]"
          >
            {[
              { h: 11, dur: 0.52 },
              { h: 8, dur: 0.68 },
              { h: 12, dur: 0.44 },
            ].map((bar, idx) => (
              <motion.span
                key={idx}
                animate={
                  prefersReducedMotion
                    ? { height: `${bar.h}px` }
                    : { height: ["4px", `${bar.h}px`, "5px"] }
                }
                transition={
                  prefersReducedMotion
                    ? { duration: 0.1 }
                    : {
                        repeat: Infinity,
                        repeatType: "mirror",
                        duration: bar.dur,
                        ease: "easeInOut",
                      }
                }
                className="w-[2.5px] rounded-[1px] bg-emerald-600"
              />
            ))}
          </span>
        )}
      </button>
    </>
  );
}

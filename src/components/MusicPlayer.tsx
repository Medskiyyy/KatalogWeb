"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface MusicPlayerProps {
  track: string;
  autoPlayTrigger?: boolean;
  className?: string;
}

const MELODIES: Record<string, { notes: number[]; tempoMs: number; wave: OscillatorType }> = {
  "builtin:romance": {
    notes: [261.63, 329.63, 392.0, 493.88, 392.0, 329.63, 293.66, 349.23],
    tempoMs: 520,
    wave: "sine",
  },
  "builtin:birthday": {
    notes: [261.63, 261.63, 293.66, 261.63, 349.23, 329.63, 261.63, 392.0],
    tempoMs: 420,
    wave: "triangle",
  },
  "builtin:wedding": {
    notes: [293.66, 369.99, 440.0, 587.33, 440.0, 369.99, 329.63, 440.0],
    tempoMs: 600,
    wave: "sine",
  },
};

export function MusicPlayer({
  track,
  autoPlayTrigger = false,
  className,
}: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const stepRef = useRef(0);
  const triggeredRef = useRef(false);

  const isBuiltin = track.startsWith("builtin:");

  const stopAudio = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const startAudio = useCallback(() => {
    if (!track || track === "none") return;

    if (!isBuiltin) {
      if (!audioRef.current) {
        const el = new Audio(track);
        el.loop = true;
        audioRef.current = el;
      }
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
      return;
    }

    const preset = MELODIES[track] ?? MELODIES["builtin:romance"];
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
    }

    const ctx = new AudioCtx();
    ctxRef.current = ctx;
    stepRef.current = 0;

    const playNote = () => {
      if (!ctxRef.current || ctxRef.current.state === "closed") return;
      const now = ctx.currentTime;
      const freq = preset.notes[stepRef.current % preset.notes.length];
      stepRef.current += 1;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = preset.wave;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.06, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + preset.tempoMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + preset.tempoMs / 1000 + 0.05);
    };

    playNote();
    timerRef.current = window.setInterval(playNote, preset.tempoMs);
    setIsPlaying(true);
  }, [isBuiltin, track]);

  useEffect(() => {
    if (autoPlayTrigger && !triggeredRef.current && track !== "none") {
      triggeredRef.current = true;
      const frame = window.requestAnimationFrame(() => {
        startAudio();
      });
      return () => window.cancelAnimationFrame(frame);
    }
  }, [autoPlayTrigger, startAudio, track]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => {});
        ctxRef.current = null;
      }
    };
  }, []);

  if (!track || track === "none") return null;

  const toggle = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  return (
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
    </button>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  CaretLeft,
  CaretRight,
  Disc,
  Lock,
  MusicNote,
  MusicNotes,
  Pause,
  Play,
  Quotes,
  SkipBack,
  SkipForward,
  SpeakerHigh,
  SpeakerSlash,
  VinylRecord,
  X,
} from "@phosphor-icons/react";
import { playSfx } from "@/lib/sfx";
import type { BucinSiteConfig } from "@/lib/schema";
import { cn } from "@/lib/utils";

interface ElapsedDuration {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const DEFAULT_TRACK_URLS = [
  "/audio/tracks/track-01.mp3",
  "/audio/tracks/track-02.mp3",
  "/audio/tracks/track-03.mp3",
  "/audio/tracks/track-04.mp3",
  "/audio/tracks/track-05.mp3",
  "/audio/tracks/track-06.mp3",
];

const MONTH_NAMES_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const FLOATING_NOTES = [
  { id: 0, left: "10%", top: "24%", delay: 0, duration: 2.8, driftX: -12, size: 18 },
  { id: 1, left: "82%", top: "30%", delay: 0.7, duration: 3.1, driftX: 12, size: 16 },
  { id: 2, left: "90%", top: "54%", delay: 1.4, duration: 2.6, driftX: 10, size: 20 },
  { id: 3, left: "18%", top: "68%", delay: 2.0, duration: 3.0, driftX: -10, size: 15 },
];

const VINYL_MOOD_PRESETS = [
  {
    id: "hujan-sore",
    title: "Hujan Sore di Jendela",
    subtitle: "Santai & akustik hangat",
    trackIndex: 1,
    linerQuote:
      "Cocok diputar pas rintik hujan mulai turun pelan di kaca, bikin obrolan kecil di ruang tamu kerasa lebih dekat dan tenang.",
  },
  {
    id: "pulang-malam",
    title: "Perjalanan Pulang Malam",
    subtitle: "Ritme santai bikin tenang di jalan",
    trackIndex: 4,
    linerQuote:
      "Teman setia buat lampu jalanan kota yang mulai lengang, pas kepala lagi butuh jeda setelah hari yang padat.",
  },
  {
    id: "minggu-pagi",
    title: "Minggu Pagi Santai",
    subtitle: "Gitar klasik & seruling pagi",
    trackIndex: 3,
    linerQuote:
      "Pas banget buat nemenin kopi hangat pertama di akhir pekan, tanpa buru-buru ke mana-mana selain duduk berdua.",
  },
];

function formatAnniversaryDate(dateString: string): string {
  const parts = dateString.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    return dateString;
  }
  const [year, month, day] = parts;
  const monthLabel = MONTH_NAMES_ID[month - 1] ?? "";
  if (!monthLabel) return dateString;
  return `${day} ${monthLabel} ${year}`;
}

function computeElapsed(anniversaryDate: string): ElapsedDuration {
  const parts = anniversaryDate.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const [year, month, day] = parts;
  const startMs = new Date(year, month - 1, day, 0, 0, 0).getTime();
  const diffMs = Math.max(0, Date.now() - startMs);

  const days = Math.floor(diffMs / 86_400_000);
  const hours = Math.floor((diffMs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diffMs % 3_600_000) / 60_000);
  const seconds = Math.floor((diffMs % 60_000) / 1000);

  return { days, hours, minutes, seconds };
}

function padTwo(value: number): string {
  return String(value).padStart(2, "0");
}

function formatAudioTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${padTwo(secs)}`;
}

function EqualizerBars({
  playing,
  reducedMotion,
  active,
}: {
  playing: boolean;
  reducedMotion: boolean;
  active: boolean;
}) {
  const heights = active ? [12, 18, 10, 16] : [8, 12, 6, 10];
  const durations = [0.55, 0.72, 0.48, 0.65];

  return (
    <span
      aria-hidden="true"
      className="inline-flex h-5 items-end gap-[3px]"
    >
      {heights.map((baseHeight, idx) => (
        <motion.span
          key={idx}
          animate={
            playing && !reducedMotion
              ? {
                  height: [
                    `${Math.max(4, Math.round(baseHeight * 0.45))}px`,
                    `${baseHeight}px`,
                    `${Math.max(5, Math.round(baseHeight * 0.6))}px`,
                  ],
                }
              : { height: `${Math.max(5, Math.round(baseHeight * 0.65))}px` }
          }
          transition={
            playing && !reducedMotion
              ? {
                  repeat: Infinity,
                  repeatType: "mirror",
                  duration: durations[idx],
                  ease: "easeInOut",
                }
              : { duration: 0.2 }
          }
          className={cn(
            "w-[3px] rounded-[1px]",
            active ? "bg-[#DC2626]" : "bg-[#57534E]/45"
          )}
        />
      ))}
    </span>
  );
}

function CassetteSpool({
  spinning,
}: {
  spinning: boolean;
}) {
  return (
    <motion.div
      animate={spinning ? { rotate: 360 } : { rotate: 0 }}
      transition={
        spinning
          ? { repeat: Infinity, duration: 4.2, ease: "linear" }
          : { duration: 0.3 }
      }
      className="h-9 w-9 shrink-0"
    >
      <svg viewBox="0 0 40 40" className="h-full w-full">
        <circle cx="20" cy="20" r="18" fill="#292524" stroke="#57534E" strokeWidth="1.5" />
        <circle cx="20" cy="20" r="10" fill="#181615" stroke="#FAF8F5" strokeOpacity="0.25" strokeWidth="1" />
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <rect
            key={angle}
            x="18.7"
            y="8.5"
            width="2.6"
            height="4"
            rx="0.8"
            fill="#FAF8F5"
            fillOpacity="0.85"
            transform={`rotate(${angle} 20 20)`}
          />
        ))}
        <circle cx="20" cy="20" r="4" fill="#DC2626" />
      </svg>
    </motion.div>
  );
}

export function BucinPlaylistTemplate({
  site,
  embedded = false,
}: {
  site: BucinSiteConfig;
  embedded?: boolean;
}) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const { data } = site;
  const expectedPin = data.passcodePin.trim();
  const hasPin = expectedPin.length > 0;

  const [isUnlocked, setIsUnlocked] = useState(embedded);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);

  const [elapsed, setElapsed] = useState<ElapsedDuration | null>(null);
  const [isTurntablePlaying, setIsTurntablePlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showMiniDeck, setShowMiniDeck] = useState(false);

  const [reasonIndex, setReasonIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const heroHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const wantPlayRef = useRef(false);
  const switchingTrackRef = useRef(false);

  const totalMemories = data.memories.length;
  const safeActiveTrack =
    totalMemories > 0 ? Math.min(activeTrack, totalMemories - 1) : 0;
  const activeMemory = data.memories[safeActiveTrack];
  const activeAudioUrl =
    activeMemory?.audioUrl ||
    DEFAULT_TRACK_URLS[safeActiveTrack % DEFAULT_TRACK_URLS.length];

  useEffect(() => {
    const update = () => {
      setElapsed(computeElapsed(data.anniversaryDate));
    };
    const frame = window.requestAnimationFrame(update);
    const interval = window.setInterval(update, 1000);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(interval);
    };
  }, [data.anniversaryDate]);

  useEffect(() => {
    data.memories.forEach((memory) => {
      const img = new window.Image();
      img.src = memory.imageUrl;
    });
  }, [data.memories]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    setCurrentTime(0);
    setDuration(
      Number.isFinite(el.duration) && el.duration > 0 ? el.duration : 0
    );

    if (wantPlayRef.current) {
      const promise = el.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {});
      }
    }
  }, [activeAudioUrl]);

  useEffect(() => {
    if (embedded || !isUnlocked) {
      return;
    }

    const target = heroHeadingRef.current;
    if (!target || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        const scrolledAbove =
          !entry.isIntersecting && entry.boundingClientRect.top < 0;
        setShowMiniDeck(scrolledAbove);
      },
      { threshold: 0 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [embedded, isUnlocked]);

  const unlockMixtape = useCallback(() => {
    setPinError(false);
    setIsUnlocked(true);
    playSfx("vinyl-needle");
    wantPlayRef.current = true;
    setIsTurntablePlaying(true);

    const el = audioRef.current;
    if (el) {
      el.muted = isMuted;
      const promise = el.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {
          wantPlayRef.current = false;
          setIsTurntablePlaying(false);
        });
      }
    }
  }, [isMuted]);

  const submitPin = useCallback(
    (candidate: string) => {
      if (!hasPin || candidate === expectedPin) {
        unlockMixtape();
        return;
      }
      setPinError(true);
      setShakeCount((prev) => prev + 1);
      setPinInput("");
    },
    [expectedPin, hasPin, unlockMixtape]
  );

  const handleDigitPress = useCallback(
    (digit: string) => {
      if (!hasPin || pinInput.length >= 4) return;
      const next = `${pinInput}${digit}`;
      setPinError(false);
      setPinInput(next);
      if (next.length === 4) {
        if (next === expectedPin) {
          unlockMixtape();
        } else {
          setPinError(true);
          setShakeCount((prev) => prev + 1);
          setPinInput("");
        }
      }
    },
    [expectedPin, hasPin, pinInput, unlockMixtape]
  );

  const handleBackspace = useCallback(() => {
    setPinError(false);
    setPinInput((prev) => prev.slice(0, -1));
  }, []);

  useEffect(() => {
    if (isUnlocked || !hasPin) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key >= "0" && event.key <= "9") {
        event.preventDefault();
        handleDigitPress(event.key);
      } else if (event.key === "Backspace") {
        event.preventDefault();
        handleBackspace();
      } else if (event.key === "Enter" && pinInput.length > 0) {
        event.preventDefault();
        submitPin(pinInput);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    handleBackspace,
    handleDigitPress,
    hasPin,
    isUnlocked,
    pinInput,
    submitPin,
  ]);

  const togglePlayback = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;

    if (isTurntablePlaying) {
      wantPlayRef.current = false;
      el.pause();
      setIsTurntablePlaying(false);
      return;
    }

    wantPlayRef.current = true;
    setIsTurntablePlaying(true);
    const promise = el.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(() => {
        wantPlayRef.current = false;
        setIsTurntablePlaying(false);
      });
    }
  }, [isTurntablePlaying]);

  const selectTrack = useCallback(
    (index: number) => {
      if (totalMemories === 0) return;
      const normalized =
        ((index % totalMemories) + totalMemories) % totalMemories;
      playSfx("vinyl-needle");
      wantPlayRef.current = true;
      setIsTurntablePlaying(true);
      setCurrentTime(0);

      if (normalized === safeActiveTrack) {
        const el = audioRef.current;
        if (el) {
          el.currentTime = 0;
          el.play().catch(() => {
            wantPlayRef.current = false;
            setIsTurntablePlaying(false);
          });
        }
        return;
      }

      switchingTrackRef.current = true;
      setActiveTrack(normalized);
    },
    [safeActiveTrack, totalMemories]
  );

  const goPrevTrack = useCallback(() => {
    selectTrack(safeActiveTrack - 1);
  }, [safeActiveTrack, selectTrack]);

  const goNextTrack = useCallback(() => {
    selectTrack(safeActiveTrack + 1);
  }, [safeActiveTrack, selectTrack]);

  const handleSeek = (nextTime: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const goPrevPhoto = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null || totalMemories === 0) return null;
      return (prev - 1 + totalMemories) % totalMemories;
    });
  }, [totalMemories]);

  const goNextPhoto = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null || totalMemories === 0) return null;
      return (prev + 1) % totalMemories;
    });
  }, [totalMemories]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
      } else if (event.key === "ArrowLeft") {
        goPrevPhoto();
      } else if (event.key === "ArrowRight") {
        goNextPhoto();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeLightbox, goNextPhoto, goPrevPhoto, lightboxIndex]);

  const totalReasons = data.loveReasons.length;
  const safeReasonIndex =
    totalReasons > 0
      ? ((reasonIndex % totalReasons) + totalReasons) % totalReasons
      : 0;

  const selectReason = (index: number) => {
    if (totalReasons === 0) return;
    playSfx("paper-flip");
    setReasonIndex(((index % totalReasons) + totalReasons) % totalReasons);
  };

  const goPrevReason = () => {
    if (totalReasons <= 1) return;
    selectReason(safeReasonIndex - 1);
  };

  const goNextReason = () => {
    if (totalReasons <= 1) return;
    selectReason(safeReasonIndex + 1);
  };

  const openPhotoLightbox = (index: number) => {
    playSfx("camera-shutter");
    setLightboxIndex(index);
  };

  const milestones = data.milestones ?? [];
  const littleThings = data.littleThings ?? [];
  const activeMood =
    VINYL_MOOD_PRESETS.find((mood) => {
      const safeTrack =
        totalMemories > 0 ? Math.min(mood.trackIndex, totalMemories - 1) : 0;
      return safeTrack === safeActiveTrack;
    }) ?? null;
  const activeMilestone =
    milestones.length > 0
      ? milestones[safeActiveTrack % milestones.length]
      : null;

  const activeLightboxMemory =
    lightboxIndex !== null ? data.memories[lightboxIndex] ?? null : null;

  const counterUnits = [
    { label: "HARI", value: elapsed ? String(elapsed.days) : "--" },
    { label: "JAM", value: elapsed ? padTwo(elapsed.hours) : "--" },
    { label: "MENIT", value: elapsed ? padTwo(elapsed.minutes) : "--" },
    { label: "DETIK", value: elapsed ? padTwo(elapsed.seconds) : "--" },
  ];

  const keypadDigits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const shouldSpinDisc = isUnlocked && isTurntablePlaying && !prefersReducedMotion;
  const catalogYear = data.anniversaryDate.slice(0, 4) || "2024";
  const closingParagraphs = data.closingLetter
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const safeDuration = duration > 0 ? duration : 40;
  const progressPercent = Math.min(
    100,
    Math.max(0, (currentTime / safeDuration) * 100)
  );
  const tickerLine = `${data.partnerOne} & ${data.partnerTwo} * ${data.songDedication.title} - ${data.songDedication.artist} * SIDE A & SIDE B MIXTAPE`;

  return (
    <div
      className={cn(
        "relative w-full bg-[#FAF8F5] font-jakarta text-[#181615] selection:bg-[#DC2626]/15 selection:text-[#DC2626]",
        embedded
          ? isUnlocked
            ? "min-h-[760px]"
            : "h-[760px] overflow-hidden"
          : "min-h-[100dvh]"
      )}
    >
      <audio
        ref={audioRef}
        src={activeAudioUrl}
        preload="auto"
        onLoadedMetadata={(event) => {
          const el = event.currentTarget;
          if (Number.isFinite(el.duration) && el.duration > 0) {
            setDuration(el.duration);
          }
          if (wantPlayRef.current && el.paused) {
            el.play().catch(() => {});
          }
        }}
        onCanPlay={(event) => {
          const el = event.currentTarget;
          if (wantPlayRef.current && el.paused) {
            el.play().catch(() => {});
          }
          switchingTrackRef.current = false;
        }}
        onTimeUpdate={(event) => {
          const el = event.currentTarget;
          setCurrentTime(el.currentTime);
          if (Number.isFinite(el.duration) && el.duration > 0) {
            setDuration(el.duration);
          }
        }}
        onPlay={() => {
          switchingTrackRef.current = false;
          wantPlayRef.current = true;
          setIsTurntablePlaying(true);
        }}
        onPause={(event) => {
          const el = event.currentTarget;
          if (switchingTrackRef.current || el.ended) return;
          wantPlayRef.current = false;
          setIsTurntablePlaying(false);
        }}
        onEnded={() => {
          if (totalMemories === 0) return;
          wantPlayRef.current = true;
          setIsTurntablePlaying(true);
          setCurrentTime(0);
          if (totalMemories === 1) {
            const el = audioRef.current;
            if (el) {
              el.currentTime = 0;
              el.play().catch(() => {});
            }
            return;
          }
          switchingTrackRef.current = true;
          setActiveTrack((prev) => (prev + 1) % totalMemories);
        }}
      />

      <AnimatePresence>
        {!isUnlocked && (
          <motion.div
            key="playlist-cover-gate"
            initial={{ opacity: 1 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0, transition: { duration: 0.15 } }
                : {
                    opacity: 0,
                    y: -36,
                    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
                  }
            }
            className={cn(
              "inset-0 z-40 flex items-center justify-center bg-[#FAF8F5]/96 px-4 py-8 backdrop-blur-xs",
              embedded ? "absolute" : "fixed"
            )}
          >
            {hasPin ? (
              <motion.div
                key={shakeCount}
                initial={prefersReducedMotion ? false : { opacity: 1, y: 12 }}
                animate={
                  pinError && !prefersReducedMotion
                    ? { opacity: 1, y: 0, x: [0, -8, 8, -6, 6, -3, 3, 0] }
                    : { opacity: 1, y: 0, x: 0 }
                }
                transition={{ duration: 0.36 }}
                className="w-full max-w-md overflow-hidden rounded-2xl border border-[#181615]/15 bg-white shadow-[0_24px_60px_rgba(24,22,21,0.1)]"
              >
                <div className="flex items-center justify-between border-b border-[#E7E2DA] bg-[#FAF8F5] px-6 py-3 font-mono text-[11px] tracking-[0.16em] text-[#57534E] uppercase">
                  <span>LOCKED PRESSING / LP-01</span>
                  <span>
                    {data.partnerOne} &amp; {data.partnerTwo}
                  </span>
                </div>

                <div className="px-6 py-7 sm:px-8">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#181615]/15 bg-[#181615] text-white">
                    <Lock size={20} weight="duotone" />
                  </div>

                  <div className="text-center">
                    <p className="font-handwriting text-2xl text-[#DC2626]">
                      Side A untuk {data.partnerTwo}
                    </p>
                    <h2 className="mt-1 font-archivo text-2xl font-bold tracking-tight text-[#181615]">
                      Buka Kunci Mixtape Kita
                    </h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#57534E]">
                      Masukin 4 digit PIN buat muter piringan hitam dan baca liner notes-nya.
                    </p>
                  </div>

                  <div
                    className="mt-6 flex justify-center gap-3"
                    aria-label="Kolom 4 digit PIN"
                  >
                    {[0, 1, 2, 3].map((slot) => {
                      const filled = slot < pinInput.length;
                      return (
                        <div
                          key={slot}
                          className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-xl border font-mono text-lg font-bold transition-colors",
                            pinError
                              ? "border-[#DC2626] bg-[#DC2626]/5 text-[#DC2626]"
                              : filled
                                ? "border-[#181615] bg-[#181615] text-white"
                                : "border-[#E7E2DA] bg-[#FAF8F5] text-[#57534E]"
                          )}
                        >
                          {filled ? (
                            <Disc size={16} weight="fill" />
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-[#57534E]/40" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {pinError && (
                    <p
                      role="alert"
                      className="mt-3 text-center text-xs font-medium text-[#DC2626]"
                    >
                      PIN belum pas nih, coba inget lagi tanggal spesialnya.
                    </p>
                  )}

                  <div className="mx-auto mt-6 grid max-w-[260px] grid-cols-3 gap-2.5">
                    {keypadDigits.map((digit) => (
                      <button
                        key={digit}
                        type="button"
                        onClick={() => handleDigitPress(digit)}
                        className="flex h-11 items-center justify-center rounded-xl border border-[#E7E2DA] bg-[#FAF8F5] font-mono text-base font-semibold text-[#181615] transition-colors hover:border-[#181615]/40 hover:bg-white active:scale-[0.97]"
                      >
                        {digit}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleBackspace}
                      className="flex h-11 items-center justify-center rounded-xl border border-[#E7E2DA] bg-white text-xs font-semibold text-[#57534E] transition-colors hover:bg-[#FAF8F5] active:scale-[0.97]"
                    >
                      Hapus
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDigitPress("0")}
                      className="flex h-11 items-center justify-center rounded-xl border border-[#E7E2DA] bg-[#FAF8F5] font-mono text-base font-semibold text-[#181615] transition-colors hover:border-[#181615]/40 hover:bg-white active:scale-[0.97]"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={() => submitPin(pinInput)}
                      className="flex h-11 items-center justify-center rounded-xl bg-[#DC2626] text-xs font-semibold text-white transition-colors hover:bg-[#B91C1C] active:scale-[0.97]"
                    >
                      Buka
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="w-full max-w-xl">
                <div className="group relative mx-auto max-w-[440px] pr-14 sm:pr-24">
                  {/* Peeking Grooved Black Vinyl Disc */}
                  <div
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute top-1/2 right-0 z-0 aspect-square w-[78%] -translate-y-1/2 transition-transform duration-500 ease-out",
                      !prefersReducedMotion && "group-hover:translate-x-3"
                    )}
                  >
                    <div
                      style={{
                        backgroundImage:
                          "repeating-radial-gradient(circle at center, #181615 0px, #181615 4px, #272321 5px, #181615 6px)",
                      }}
                      className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-black/50 shadow-[0_22px_50px_rgba(24,22,21,0.3)]"
                    >
                      <div
                        style={{
                          backgroundImage:
                            "conic-gradient(from 15deg, transparent 0deg, rgba(255,255,255,0.14) 24deg, transparent 52deg, transparent 180deg, rgba(255,255,255,0.1) 204deg, transparent 236deg)",
                        }}
                        className="absolute inset-0 rounded-full"
                      />
                      <div className="relative flex h-[34%] w-[34%] flex-col items-center justify-center rounded-full border-2 border-[#FAF8F5]/20 bg-[#DC2626] p-2 text-center text-white">
                        <span className="font-mono text-[8px] tracking-[0.16em] uppercase opacity-90">
                          SIDE A
                        </span>
                        <span className="mt-1 h-2.5 w-2.5 rounded-full border border-black/30 bg-[#FAF8F5]" />
                        <span className="mt-1 font-mono text-[8px] tracking-wider uppercase opacity-90">
                          33 RPM
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* LP Sleeve Jacket */}
                  <div className="relative z-10 overflow-hidden rounded-2xl border border-[#181615]/15 bg-white shadow-[0_24px_60px_rgba(24,22,21,0.16)]">
                    <div className="flex items-center justify-between border-b border-[#E7E2DA] bg-[#FAF8F5] px-5 py-3 font-mono text-[10px] tracking-[0.16em] text-[#57534E] uppercase">
                      <span>CAT. NO. KW-{catalogYear}</span>
                      <span>{padTwo(totalMemories)} TRACKS</span>
                    </div>

                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F1ECE4]">
                      {data.memories[0] && (
                        <img
                          src={data.memories[0].imageUrl}
                          alt={data.memories[0].caption}
                          loading="eager"
                          className="block h-full w-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#181615]/85 via-[#181615]/25 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                        <p className="font-handwriting text-2xl text-[#FCA5A5]">
                          {data.partnerOne} &amp; {data.partnerTwo}
                        </p>
                        <h2 className="mt-0.5 font-archivo text-xl leading-tight font-bold tracking-tight sm:text-2xl">
                          {data.songDedication.title} - {data.songDedication.artist}
                        </h2>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6">
                      <p className="text-sm leading-relaxed text-[#57534E]">
                        Keluarkan piringan dari sampulnya dan mulai putar track pertama dari mixtape kenangan kita.
                      </p>
                      <button
                        type="button"
                        onClick={unlockMixtape}
                        className="mt-4 inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#181615] px-5 py-3.5 text-sm font-semibold text-[#FAF8F5] transition-colors hover:bg-[#DC2626] active:scale-[0.98]"
                      >
                        <Play size={16} weight="fill" />
                        <span>Turunkan Jarum &amp; Putar Mixtape</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn(!isUnlocked && "pointer-events-none select-none")}>
        <header className="border-b border-[#E7E2DA] bg-white/80 backdrop-blur-xs">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.16em] text-[#57534E] uppercase">
              <VinylRecord size={16} weight="duotone" className="text-[#DC2626]" />
              <span>CAT. NO. KW-{catalogYear}</span>
            </div>
            <p className="font-archivo text-sm font-bold tracking-tight text-[#181615] uppercase">
              {data.partnerOne} &amp; {data.partnerTwo}
            </p>
            <div className="font-mono tabular-nums text-[11px] tracking-[0.14em] text-[#57534E] uppercase">
              {padTwo(totalMemories)} TRACKS / STEREO 33 RPM
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl space-y-20 px-4 py-10 sm:px-6 sm:py-14 lg:space-y-24 lg:px-8 lg:py-16">
          {/* Section 1: Turntable & LP Sleeve Hero */}
          <section aria-labelledby="hero-sleeve-heading">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-6">
                <div className="relative mx-auto w-full max-w-[460px] pr-14 sm:pr-24">
                  {/* Floating Musical Notes while playing */}
                  {isUnlocked && isTurntablePlaying && !prefersReducedMotion && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -inset-4 z-30 overflow-visible"
                    >
                      {FLOATING_NOTES.map((note) => (
                        <motion.div
                          key={note.id}
                          style={{ left: note.left, top: note.top }}
                          initial={{ y: 0, x: 0, opacity: 0, scale: 0.85 }}
                          animate={{
                            y: [0, -24, -48],
                            x: [0, note.driftX, note.driftX * 0.6],
                            opacity: [0, 0.85, 0],
                            scale: [0.85, 1, 0.9],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: note.duration,
                            delay: note.delay,
                            ease: "easeOut",
                          }}
                          className="absolute text-[#DC2626]"
                        >
                          <MusicNote size={note.size} weight="fill" />
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Pivoting Tonearm */}
                  <motion.div
                    aria-hidden="true"
                    animate={
                      isTurntablePlaying
                        ? { rotate: 16 }
                        : { rotate: -6 }
                    }
                    transition={
                      prefersReducedMotion
                        ? { duration: 0.05 }
                        : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
                    }
                    style={{ transformOrigin: "82% 16%" }}
                    className="pointer-events-none absolute -top-3 -right-1 z-20 h-32 w-24 sm:-top-4 sm:right-2 sm:h-40 sm:w-28"
                  >
                    <svg
                      viewBox="0 0 110 160"
                      className="h-full w-full drop-shadow-[0_6px_12px_rgba(24,22,21,0.18)]"
                    >
                      <circle cx="88" cy="24" r="14" fill="#181615" />
                      <circle cx="88" cy="24" r="7" fill="#D6D3D1" />
                      <path
                        d="M88 24 L68 96 L48 128"
                        fill="none"
                        stroke="#292524"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M88 24 L68 96 L48 128"
                        fill="none"
                        stroke="#E7E2DA"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <rect
                        x="38"
                        y="124"
                        width="16"
                        height="22"
                        rx="3"
                        transform="rotate(28 46 135)"
                        fill="#181615"
                      />
                      <rect
                        x="42"
                        y="141"
                        width="6"
                        height="5"
                        rx="1"
                        transform="rotate(28 45 143)"
                        fill="#DC2626"
                      />
                    </svg>
                  </motion.div>

                  {/* Protruding Spinning Vinyl Disc with Specular Shimmer */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 right-0 z-0 aspect-square w-[76%] -translate-y-1/2"
                  >
                    <motion.div
                      animate={
                        shouldSpinDisc
                          ? { rotate: 360 }
                          : { rotate: 0 }
                      }
                      transition={
                        shouldSpinDisc
                          ? {
                              repeat: Infinity,
                              duration: 7.5,
                              ease: "linear",
                            }
                          : { duration: 0.4 }
                      }
                      style={{
                        backgroundImage:
                          "repeating-radial-gradient(circle at center, #181615 0px, #181615 4px, #272321 5px, #181615 6px)",
                      }}
                      className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-black/40 shadow-[0_18px_40px_rgba(24,22,21,0.28)]"
                    >
                      <div
                        style={{
                          backgroundImage:
                            "conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.16) 24deg, transparent 54deg, transparent 180deg, rgba(255,255,255,0.12) 204deg, transparent 236deg)",
                        }}
                        className="absolute inset-0 rounded-full"
                      />
                      <div className="relative flex h-[34%] w-[34%] flex-col items-center justify-center rounded-full border-2 border-[#FAF8F5]/20 bg-[#DC2626] p-2 text-center text-white">
                        <span className="font-mono text-[8px] tracking-[0.18em] uppercase opacity-90 sm:text-[9px]">
                          SIDE A
                        </span>
                        <span className="mt-1 h-3 w-3 rounded-full border border-black/30 bg-[#FAF8F5]" />
                        <span className="mt-1 font-mono text-[8px] tracking-wider uppercase opacity-90">
                          33 RPM
                        </span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Album Cover Sleeve */}
                  <div className="relative z-10 aspect-square w-full overflow-hidden rounded-xl border border-[#181615]/15 bg-white shadow-[0_22px_50px_rgba(24,22,21,0.16)]">
                    {activeMemory && (
                      <img
                        src={activeMemory.imageUrl}
                        alt={activeMemory.caption}
                        loading="eager"
                        className="absolute inset-0 block h-full w-full object-cover"
                      />
                    )}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/20 to-transparent"
                    />
                    {activeMemory && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#181615]/90 via-[#181615]/55 to-transparent px-4 pt-10 pb-3.5 text-white">
                        <div className="flex items-center justify-between gap-2 font-mono tabular-nums text-[11px] tracking-[0.14em] text-white/85 uppercase">
                          <span>TRACK {padTwo(safeActiveTrack + 1)}</span>
                          <span>{activeMemory.dateLabel}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <p className="font-handwriting text-2xl text-[#DC2626] sm:text-[26px]">
                  SIDE A - {data.partnerOne.toUpperCase()} &amp;{" "}
                  {data.partnerTwo.toUpperCase()}
                </p>

                <h1
                  ref={heroHeadingRef}
                  id="hero-sleeve-heading"
                  className="mt-2 font-archivo text-3xl leading-[1.08] font-bold tracking-tight text-[#181615] sm:text-4xl lg:text-[44px]"
                >
                  {data.heroHeadline}
                </h1>

                <p className="mt-4 text-base leading-relaxed text-[#57534E]">
                  {data.openingNote}
                </p>

                {/* Turntable Deck Controls & Seekable Scrubber */}
                <div className="mt-6 rounded-2xl border border-[#E7E2DA] bg-white p-4 shadow-[0_10px_28px_rgba(24,22,21,0.04)] sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FAF8F5] text-[#DC2626]">
                        <MusicNotes size={18} weight="duotone" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono tabular-nums text-[10px] tracking-[0.16em] text-[#57534E] uppercase">
                          TRACK {padTwo(safeActiveTrack + 1)} / {padTwo(totalMemories)} -{" "}
                          {data.songDedication.title} ({data.songDedication.artist})
                        </p>
                        <p className="truncate text-sm font-semibold text-[#181615]">
                          {activeMemory?.caption ?? data.songDedication.title}
                        </p>
                      </div>
                    </div>

                    <EqualizerBars
                      playing={isTurntablePlaying}
                      reducedMotion={prefersReducedMotion}
                      active={isTurntablePlaying}
                    />
                  </div>

                  {/* Seekable Audio Scrubber */}
                  <div className="mt-4">
                    <input
                      type="range"
                      min={0}
                      max={safeDuration}
                      step={0.1}
                      value={Math.min(currentTime, safeDuration)}
                      onChange={(event) => handleSeek(Number(event.target.value))}
                      aria-label="Posisi pemutaran lagu"
                      style={{
                        background: `linear-gradient(to right, #DC2626 ${progressPercent}%, #E7E2DA ${progressPercent}%)`,
                      }}
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full accent-[#DC2626]"
                    />
                    <div className="mt-1.5 flex items-center justify-between font-mono tabular-nums text-[11px] text-[#57534E]">
                      <span>{formatAudioTime(currentTime)}</span>
                      <span>{formatAudioTime(duration)}</span>
                    </div>
                  </div>

                  {/* Transport Buttons */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={goPrevTrack}
                        aria-label="Track sebelumnya"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#E7E2DA] bg-[#FAF8F5] text-[#181615] transition-colors hover:border-[#181615]/35 hover:bg-white active:scale-[0.97]"
                      >
                        <SkipBack size={16} weight="fill" />
                      </button>

                      <button
                        type="button"
                        onClick={togglePlayback}
                        className="inline-flex h-10 items-center justify-center gap-2.5 rounded-xl bg-[#181615] px-4 text-sm font-semibold text-[#FAF8F5] transition-colors hover:bg-[#2E2A28] active:scale-[0.98]"
                      >
                        {isTurntablePlaying ? (
                          <Pause size={15} weight="fill" className="text-[#DC2626]" />
                        ) : (
                          <Play size={15} weight="fill" className="text-[#DC2626]" />
                        )}
                        <span>
                          {isTurntablePlaying ? "Jeda" : "Putar"}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={goNextTrack}
                        aria-label="Track berikutnya"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#E7E2DA] bg-[#FAF8F5] text-[#181615] transition-colors hover:border-[#181615]/35 hover:bg-white active:scale-[0.97]"
                      >
                        <SkipForward size={16} weight="fill" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={toggleMute}
                      aria-label={isMuted ? "Nyalakan suara" : "Matikan suara"}
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#E7E2DA] bg-[#FAF8F5] px-3.5 text-xs font-semibold text-[#57534E] transition-colors hover:border-[#181615]/35 hover:text-[#181615]"
                    >
                      {isMuted ? (
                        <SpeakerSlash size={16} weight="fill" className="text-[#DC2626]" />
                      ) : (
                        <SpeakerHigh size={16} weight="fill" />
                      )}
                      <span>{isMuted ? "Muted" : "Audio On"}</span>
                    </button>
                  </div>
                </div>

                {/* Album Runtime Counter */}
                <div className="mt-7 border-t border-[#E7E2DA] pt-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[11px] tracking-[0.14em] text-[#57534E] uppercase">
                      ALBUM RUNTIME
                    </span>
                    <span className="font-mono text-[11px] text-[#57534E]">
                      Sejak {formatAnniversaryDate(data.anniversaryDate)}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-4 gap-2.5">
                    {counterUnits.map((unit) => (
                      <div
                        key={unit.label}
                        className="rounded-xl border border-[#E7E2DA] bg-white px-3 py-3 text-center"
                      >
                        <div className="font-mono tabular-nums text-xl font-bold tracking-tight text-[#181615] sm:text-2xl">
                          {unit.value}
                        </div>
                        <div className="mt-0.5 font-mono text-[10px] tracking-[0.14em] text-[#57534E] uppercase">
                          {unit.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Single Kinetic Vinyl Marquee Ticker */}
          <div
            aria-label="Informasi mixtape berjalan"
            className="overflow-hidden rounded-xl bg-[#181615] py-3 text-[#FAF8F5]"
          >
            {prefersReducedMotion ? (
              <div className="px-4 text-center font-mono text-xs tracking-[0.16em] uppercase">
                {tickerLine}
              </div>
            ) : (
              <motion.div
                animate={{ x: ["0%", "-50%"] }}
                transition={{
                  repeat: Infinity,
                  duration: 24,
                  ease: "linear",
                }}
                className="flex w-max whitespace-nowrap font-mono text-xs tracking-[0.16em] uppercase"
              >
                {[0, 1].map((groupIdx) => (
                  <div key={groupIdx} className="flex shrink-0 items-center">
                    {[0, 1, 2].map((repeatIdx) => (
                      <span key={repeatIdx} className="px-5">
                        {tickerLine}
                      </span>
                    ))}
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Section 2: Interactive Tracklist & Behind the Track */}
          <section aria-labelledby="tracklist-heading">
            <div className="mb-6 flex flex-col justify-between gap-2 border-b border-[#E7E2DA] pb-4 sm:flex-row sm:items-end">
              <div>
                <p className="font-mono text-[11px] tracking-[0.16em] text-[#DC2626] uppercase">
                  SIDE A / TRACKLIST &amp; LINER NOTES
                </p>
                <h2
                  id="tracklist-heading"
                  className="mt-1 font-archivo text-2xl font-bold tracking-tight text-[#181615] sm:text-3xl"
                >
                  Daftar Track &amp; Cerita di Baliknya
                </h2>
              </div>
              <p className="font-mono tabular-nums text-xs text-[#57534E]">
                Klik salah satu track buat putar audio dan lihat catatan rekamannya
              </p>
            </div>

            <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-12">
              {/* Selectable Tracklist */}
              <div className="overflow-hidden rounded-xl border border-[#E7E2DA] bg-white lg:col-span-7">
                <div className="divide-y divide-[#E7E2DA]">
                  {data.memories.map((memory, idx) => {
                    const isSelected = idx === safeActiveTrack;
                    return (
                      <button
                        key={`${memory.dateLabel}-${idx}`}
                        type="button"
                        onClick={() => selectTrack(idx)}
                        aria-current={isSelected ? "true" : undefined}
                        className={cn(
                          "flex w-full items-center justify-between gap-4 border-l-3 px-4 py-3.5 text-left transition-colors sm:px-5 sm:py-4",
                          isSelected
                            ? "border-l-[#DC2626] bg-[#FAF8F5]"
                            : "border-l-transparent bg-white hover:bg-[#FAF8F5]/70"
                        )}
                      >
                        <div className="flex min-w-0 items-start gap-3.5 sm:items-center">
                          <span
                            className={cn(
                              "mt-0.5 shrink-0 font-mono tabular-nums text-xs font-bold sm:mt-0",
                              isSelected ? "text-[#DC2626]" : "text-[#57534E]"
                            )}
                          >
                            {padTwo(idx + 1)}
                          </span>
                          <div className="min-w-0">
                            <p
                              className={cn(
                                "text-sm leading-snug font-semibold sm:text-[15px]",
                                isSelected ? "text-[#181615]" : "text-[#181615]/90"
                              )}
                            >
                              {memory.caption}
                            </p>
                            <p className="mt-0.5 font-mono text-[11px] text-[#57534E]">
                              {memory.dateLabel}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                          {isSelected ? (
                            <EqualizerBars
                              playing={isTurntablePlaying}
                              reducedMotion={prefersReducedMotion}
                              active
                            />
                          ) : (
                            <span className="font-mono text-[11px] text-[#57534E]/75">
                              PLAY
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Behind the Track Liner Card */}
              <div className="lg:col-span-5">
                <div className="rounded-xl border border-[#E7E2DA] bg-white p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between border-b border-[#E7E2DA] pb-3">
                    <span className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#57534E] uppercase">
                      Catatan di Balik Track
                    </span>
                    <span className="font-mono tabular-nums text-xs font-bold text-[#DC2626]">
                      TRACK {padTwo(safeActiveTrack + 1)}
                    </span>
                  </div>

                  <AnimatePresence mode="wait">
                    {activeMemory && (
                      <motion.div
                        key={`liner-${safeActiveTrack}`}
                        initial={
                          prefersReducedMotion ? false : { opacity: 1, y: 8 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        exit={
                          prefersReducedMotion
                            ? { opacity: 0.6 }
                            : { opacity: 0.4, y: -6 }
                        }
                        transition={{ duration: 0.18 }}
                      >
                        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-[#E7E2DA] bg-[#F1ECE4]">
                          <img
                            src={activeMemory.imageUrl}
                            alt={activeMemory.caption}
                            loading="eager"
                            className="absolute inset-0 block h-full w-full object-cover"
                          />
                        </div>

                        <p className="mt-4 font-mono text-[11px] tracking-wider text-[#57534E] uppercase">
                          {activeMemory.dateLabel}
                        </p>
                        <h3 className="mt-1 font-archivo text-lg leading-snug font-bold text-[#181615]">
                          {activeMemory.caption}
                        </h3>

                        {activeMilestone && (
                          <div className="mt-4 rounded-lg border border-[#E7E2DA] bg-[#FAF8F5] p-4">
                            <div className="flex items-center justify-between gap-2 font-mono text-[11px] text-[#57534E]">
                              <span className="font-semibold text-[#DC2626]">
                                STORY LOG
                              </span>
                              <span>{activeMilestone.dateLabel}</span>
                            </div>
                            <p className="mt-1.5 text-sm font-semibold text-[#181615]">
                              {activeMilestone.title}
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-[#57534E]">
                              {activeMilestone.description}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {milestones.length > 0 && (
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {milestones.map((milestone, idx) => (
                  <motion.div
                    key={`${milestone.dateLabel}-${idx}`}
                    initial={
                      prefersReducedMotion || embedded
                        ? false
                        : { opacity: 1, y: 12 }
                    }
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-xl border border-[#E7E2DA] bg-white p-4"
                  >
                    <p className="font-mono tabular-nums text-[11px] font-semibold tracking-wider text-[#DC2626] uppercase">
                      {padTwo(idx + 1)} / {milestone.dateLabel}
                    </p>
                    <h3 className="mt-1.5 font-archivo text-base font-bold text-[#181615]">
                      {milestone.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#57534E]">
                      {milestone.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Section 3: Potongan Lirik & Alasan Betah (Dual-Spool Cassette Lyric Card) */}
          <section aria-labelledby="lyrics-heading">
            <div className="mb-6 border-b border-[#E7E2DA] pb-4">
              <p className="font-mono text-[11px] tracking-[0.16em] text-[#DC2626] uppercase">
                SIDE B / POTONGAN LIRIK &amp; ALASAN BETAH
              </p>
              <h2
                id="lyrics-heading"
                className="mt-1 font-archivo text-2xl font-bold tracking-tight text-[#181615] sm:text-3xl"
              >
                Alasan Kenapa Selalu Betah Sama Kamu
              </h2>
            </div>

            <div className="grid grid-cols-1 items-stretch gap-7 lg:grid-cols-12">
              <div className="flex flex-col justify-between rounded-xl bg-[#181615] p-6 text-[#FAF8F5] sm:p-8 lg:col-span-5">
                <div>
                  <div className="flex items-center justify-between border-b border-white/15 pb-3 font-mono tabular-nums text-xs text-white/70">
                    <span>
                      LINER QUOTE {padTwo(safeReasonIndex + 1)} /{" "}
                      {padTwo(totalReasons)}
                    </span>
                    <Quotes size={18} weight="fill" className="text-[#DC2626]" />
                  </div>

                  {/* Miniature Dual-Spool Cassette Window */}
                  <div
                    aria-hidden="true"
                    className="mt-5 flex items-center justify-between rounded-xl border border-white/15 bg-[#221F1D] px-4 py-2.5"
                  >
                    <CassetteSpool spinning={shouldSpinDisc} />
                    <div className="mx-3 flex flex-1 flex-col items-center gap-1">
                      <span className="font-mono text-[9px] tracking-[0.18em] text-white/55 uppercase">
                        SIDE B TAPE
                      </span>
                      <div className="h-2.5 w-full rounded-sm border border-white/15 bg-[#12100F] p-0.5">
                        <div className="h-full w-3/5 rounded-[1px] bg-[#57534E]/60" />
                      </div>
                    </div>
                    <CassetteSpool spinning={shouldSpinDisc} />
                  </div>
                </div>

                <div className="my-7">
                  <AnimatePresence mode="wait">
                    <motion.blockquote
                      key={`lyric-${safeReasonIndex}`}
                      initial={
                        prefersReducedMotion ? false : { opacity: 1, y: 8 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      exit={
                        prefersReducedMotion
                          ? { opacity: 0.6 }
                          : { opacity: 0.4, y: -6 }
                      }
                      transition={{ duration: 0.18 }}
                      className="font-archivo text-xl leading-snug font-bold tracking-tight text-white sm:text-2xl"
                    >
                      &ldquo;{data.loveReasons[safeReasonIndex]}&rdquo;
                    </motion.blockquote>
                  </AnimatePresence>
                </div>

                <div className="flex items-center justify-between border-t border-white/15 pt-4">
                  <div className="flex items-center gap-1.5">
                    {data.loveReasons.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        aria-label={`Pilih alasan ${idx + 1}`}
                        onClick={() => selectReason(idx)}
                        className={cn(
                          "h-1.5 rounded-xs transition-all",
                          idx === safeReasonIndex
                            ? "w-6 bg-[#DC2626]"
                            : "w-2 bg-white/30 hover:bg-white/50"
                        )}
                      />
                    ))}
                  </div>

                  {totalReasons > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={goPrevReason}
                        aria-label="Lirik sebelumnya"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 text-white transition-colors hover:bg-white/10"
                      >
                        <CaretLeft size={16} weight="bold" />
                      </button>
                      <button
                        type="button"
                        onClick={goNextReason}
                        aria-label="Lirik berikutnya"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#DC2626] text-white transition-colors hover:bg-[#B91C1C]"
                      >
                        <CaretRight size={16} weight="bold" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-[#E7E2DA] bg-white lg:col-span-7">
                <div className="divide-y divide-[#E7E2DA]">
                  {data.loveReasons.map((reason, idx) => {
                    const isSelected = idx === safeReasonIndex;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectReason(idx)}
                        className={cn(
                          "flex w-full items-start gap-4 px-5 py-4 text-left transition-colors",
                          isSelected
                            ? "bg-[#FAF8F5]"
                            : "bg-white hover:bg-[#FAF8F5]/65"
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 shrink-0 font-mono tabular-nums text-xs font-bold",
                            isSelected ? "text-[#DC2626]" : "text-[#57534E]"
                          )}
                        >
                          {padTwo(idx + 1)}
                        </span>
                        <span className="text-sm leading-relaxed text-[#181615]">
                          {reason}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Tilted Gatefold Sleeve Photo Booklet */}
          <section aria-labelledby="booklet-heading">
            <div className="mb-6 flex flex-col justify-between gap-2 border-b border-[#E7E2DA] pb-4 sm:flex-row sm:items-end">
              <div>
                <p className="font-mono text-[11px] tracking-[0.16em] text-[#DC2626] uppercase">
                  SLEEVE BOOKLET / ARSIP FOTO
                </p>
                <h2
                  id="booklet-heading"
                  className="mt-1 font-archivo text-2xl font-bold tracking-tight text-[#181615] sm:text-3xl"
                >
                  Buklet Foto Rekaman
                </h2>
              </div>
              <p className="font-mono tabular-nums text-xs text-[#57534E]">
                {padTwo(totalMemories)} FRAMES - Klik foto buat perbesar
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.memories.map((memory, idx) => {
                const tiltDeg = idx % 2 === 0 ? -1 : 1;
                return (
                  <motion.button
                    key={`${memory.imageUrl}-${idx}`}
                    type="button"
                    onClick={() => openPhotoLightbox(idx)}
                    initial={
                      prefersReducedMotion || embedded
                        ? false
                        : { opacity: 1, y: 12, rotate: tiltDeg }
                    }
                    whileInView={
                      prefersReducedMotion
                        ? { opacity: 1, y: 0 }
                        : { opacity: 1, y: 0, rotate: tiltDeg }
                    }
                    whileHover={
                      prefersReducedMotion
                        ? undefined
                        : { rotate: 0, y: -6 }
                    }
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{
                      type: "spring",
                      stiffness: 340,
                      damping: 22,
                    }}
                    className={cn(
                      "group rounded-xl border border-[#E7E2DA] bg-white p-3 text-left shadow-[0_8px_24px_rgba(24,22,21,0.05)] transition-colors hover:border-[#181615]/35 hover:shadow-[0_16px_36px_rgba(24,22,21,0.1)]",
                      prefersReducedMotion
                        ? ""
                        : idx % 2 === 0
                          ? "-rotate-1"
                          : "rotate-1"
                    )}
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-[#F1ECE4]">
                      <img
                        src={memory.imageUrl}
                        alt={memory.caption}
                        loading="eager"
                        className="absolute inset-0 block h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between font-mono tabular-nums text-[11px] text-[#57534E] uppercase">
                      <span>FRAME {padTwo(idx + 1)}</span>
                      <span>{memory.dateLabel}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm leading-snug font-medium text-[#181615]">
                      {memory.caption}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </section>

          {/* Section 5: Kebiasaan Kecil & Mood Turntable */}
          <section aria-labelledby="mood-turntable-heading" className="space-y-12">
            {littleThings.length > 0 && (
              <div>
                <div className="mb-6 border-b border-[#E7E2DA] pb-4">
                  <p className="font-mono text-[11px] tracking-[0.16em] text-[#DC2626] uppercase">
                    STUDIO LINER NOTES
                  </p>
                  <h2
                    id="studio-pass-heading"
                    className="mt-1 font-archivo text-2xl font-bold tracking-tight text-[#181615] sm:text-3xl"
                  >
                    Kebiasaan Kecil yang Paling Aku Hafal
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {littleThings.map((item, idx) => (
                    <motion.div
                      key={`${item.label}-${idx}`}
                      initial={
                        prefersReducedMotion || embedded
                          ? false
                          : { opacity: 1, y: 12 }
                      }
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.15 }}
                      transition={{ duration: 0.25 }}
                      className="rounded-xl border border-[#E7E2DA] bg-white p-5 sm:p-6"
                    >
                      <p className="font-mono tabular-nums text-[11px] font-semibold tracking-[0.14em] text-[#DC2626] uppercase">
                        NOTE {padTwo(idx + 1)}
                      </p>
                      <h3 className="mt-1.5 font-archivo text-lg font-bold text-[#181615]">
                        {item.label}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#57534E]">
                        {item.detail}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="mb-6 flex flex-col justify-between gap-2 border-b border-[#E7E2DA] pb-4 sm:flex-row sm:items-end">
                <div>
                  <p className="font-mono text-[11px] tracking-[0.16em] text-[#DC2626] uppercase">
                    MOOD TURNTABLE
                  </p>
                  <h2
                    id="mood-turntable-heading"
                    className="mt-1 font-archivo text-2xl font-bold tracking-tight text-[#181615] sm:text-3xl"
                  >
                    Pilih Suasana Putaran Malam Ini
                  </h2>
                </div>
                <p className="font-mono text-xs text-[#57534E]">
                  Klik salah satu suasana buat langsung ganti putaran track-nya
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {VINYL_MOOD_PRESETS.map((mood) => {
                  const safeTrack =
                    totalMemories > 0
                      ? Math.min(mood.trackIndex, totalMemories - 1)
                      : 0;
                  const isSelected = safeActiveTrack === safeTrack;

                  return (
                    <button
                      key={mood.id}
                      type="button"
                      onClick={() => selectTrack(safeTrack)}
                      aria-pressed={isSelected}
                      className={cn(
                        "flex flex-col justify-between rounded-xl border p-5 text-left transition-colors sm:p-6",
                        isSelected
                          ? "border-[#DC2626] bg-white shadow-[0_12px_30px_rgba(220,38,38,0.08)]"
                          : "border-[#E7E2DA] bg-white hover:border-[#181615]/35 hover:bg-[#FAF8F5]/60"
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <span
                            className={cn(
                              "font-mono tabular-nums text-[11px] font-semibold tracking-[0.16em] uppercase",
                              isSelected ? "text-[#DC2626]" : "text-[#57534E]"
                            )}
                          >
                            TRACK {padTwo(safeTrack + 1)}
                          </span>

                          {isSelected ? (
                            <EqualizerBars
                              playing={isTurntablePlaying}
                              reducedMotion={prefersReducedMotion}
                              active
                            />
                          ) : (
                            <Disc size={18} weight="duotone" className="text-[#57534E]" />
                          )}
                        </div>

                        <h3 className="mt-3 font-archivo text-lg leading-snug font-bold text-[#181615]">
                          {mood.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-[#57534E]">
                          {mood.subtitle}
                        </p>
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-[#E7E2DA] pt-3 font-mono text-[11px] uppercase">
                        <span className={isSelected ? "font-semibold text-[#DC2626]" : "text-[#57534E]"}>
                          {isSelected ? "SEDANG DIPILIH" : "PUTAR MOOD INI"}
                        </span>
                        <Play
                          size={13}
                          weight="fill"
                          className={isSelected ? "text-[#DC2626]" : "text-[#57534E]"}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                {activeMood && (
                  <motion.div
                    key={activeMood.id}
                    initial={
                      prefersReducedMotion ? false : { opacity: 1, y: 8 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    exit={
                      prefersReducedMotion
                        ? { opacity: 0.6 }
                        : { opacity: 0.4, y: -6 }
                    }
                    transition={{ duration: 0.18 }}
                    className="mt-4 rounded-xl border border-[#E7E2DA] bg-[#181615] p-5 text-[#FAF8F5] sm:p-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] tracking-[0.14em] text-[#FCA5A5] uppercase">
                      <span>LINER NOTE MOOD / {activeMood.title}</span>
                      <span>
                        TRACK {padTwo(Math.min(activeMood.trackIndex, Math.max(0, totalMemories - 1)) + 1)}
                      </span>
                    </div>
                    <p className="mt-2.5 text-sm leading-relaxed text-white/90 sm:text-base">
                      &ldquo;{activeMood.linerQuote}&rdquo;
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Section 6: Sampul Belakang Mixtape */}
          <section aria-labelledby="closing-sleeve-heading">
            <motion.div
              initial={
                prefersReducedMotion || embedded
                  ? false
                  : { opacity: 1, y: 12 }
              }
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border border-[#E7E2DA] bg-white p-6 shadow-[0_14px_40px_rgba(24,22,21,0.05)] sm:p-10"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E7E2DA] pb-4">
                <div>
                  <p className="font-mono text-[11px] tracking-[0.16em] text-[#DC2626] uppercase">
                    BACK COVER / SAMPUL BELAKANG MIXTAPE
                  </p>
                  <h2
                    id="closing-sleeve-heading"
                    className="mt-1 font-archivo text-2xl font-bold tracking-tight text-[#181615] sm:text-3xl"
                  >
                    Untuk {data.partnerTwo}, Dari {data.partnerOne}
                  </h2>
                </div>
                <span className="font-mono tabular-nums text-xs text-[#57534E]">
                  SIDE B OUTRO
                </span>
              </div>

              <div className="mt-6 space-y-4 text-base leading-relaxed text-[#181615]/90">
                {closingParagraphs.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-8 flex flex-col justify-between gap-3 border-t border-[#E7E2DA] pt-5 font-mono text-xs text-[#57534E] sm:flex-row sm:items-center">
                <span>
                  PRODUCED BY {data.partnerOne.toUpperCase()} FOR{" "}
                  {data.partnerTwo.toUpperCase()}
                </span>
                <span>
                  DEDICATION: {data.songDedication.title} -{" "}
                  {data.songDedication.artist}
                </span>
              </div>
            </motion.div>
          </section>
        </main>

        <footer className="border-t border-[#E7E2DA] bg-white/80 py-6 text-center text-xs text-[#57534E]">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-[#DC2626]"
          >
            <span>Dibuat dengan KatalogWeb</span>
          </Link>
        </footer>
      </div>

      {/* Sticky Bottom Mini-Turntable Bar */}
      <AnimatePresence>
        {showMiniDeck && isUnlocked && !embedded && (
          <motion.div
            key="sticky-mini-turntable"
            initial={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 0, y: 20 }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 20 }
            }
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-4 bottom-4 left-4 z-30 flex items-center justify-between gap-3 rounded-2xl border border-[#181615]/15 bg-[#181615] p-3 text-[#FAF8F5] shadow-[0_18px_40px_rgba(24,22,21,0.28)] sm:left-auto sm:w-[380px]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <motion.div
                animate={shouldSpinDisc ? { rotate: 360 } : { rotate: 0 }}
                transition={
                  shouldSpinDisc
                    ? { repeat: Infinity, duration: 5, ease: "linear" }
                    : { duration: 0.3 }
                }
                style={{
                  backgroundImage:
                    "repeating-radial-gradient(circle at center, #292524 0px, #292524 2px, #3B3633 3px, #292524 4px)",
                }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15"
              >
                <span className="h-3.5 w-3.5 rounded-full border border-white/25 bg-[#DC2626]" />
              </motion.div>

              <div className="min-w-0">
                <p className="font-mono tabular-nums text-[10px] tracking-[0.14em] text-[#FCA5A5] uppercase">
                  TRACK {padTwo(safeActiveTrack + 1)} / {padTwo(totalMemories)}
                </p>
                <p className="truncate text-xs font-semibold text-white">
                  {activeMemory?.caption ?? data.songDedication.title}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={togglePlayback}
                aria-label={isTurntablePlaying ? "Jeda lagu" : "Putar lagu"}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#DC2626] text-white transition-colors hover:bg-[#B91C1C] active:scale-[0.96]"
              >
                {isTurntablePlaying ? (
                  <Pause size={15} weight="fill" />
                ) : (
                  <Play size={15} weight="fill" />
                )}
              </button>
              <button
                type="button"
                onClick={goNextTrack}
                aria-label="Track berikutnya"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 active:scale-[0.96]"
              >
                <SkipForward size={15} weight="fill" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeLightboxMemory && lightboxIndex !== null && (
          <motion.div
            key="playlist-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label="Detail foto buklet rekaman"
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#181615]/80 p-4 backdrop-blur-xs"
          >
            <motion.div
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.96 }
              }
              animate={{ opacity: 1, scale: 1 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.96 }
              }
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
              className="relative w-full max-w-2xl rounded-2xl border border-[#E7E2DA] bg-white p-4 shadow-2xl sm:p-6"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono tabular-nums text-xs font-semibold text-[#57534E]">
                  FRAME {padTwo(lightboxIndex + 1)} / {padTwo(totalMemories)} -{" "}
                  {activeLightboxMemory.dateLabel}
                </span>
                <button
                  type="button"
                  onClick={closeLightbox}
                  aria-label="Tutup foto"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E7E2DA] text-[#181615] transition-colors hover:bg-[#FAF8F5]"
                >
                  <X size={16} weight="bold" />
                </button>
              </div>

              <div className="max-h-[65dvh] overflow-hidden rounded-lg bg-[#FAF8F5]">
                <img
                  src={activeLightboxMemory.imageUrl}
                  alt={activeLightboxMemory.caption}
                  loading="eager"
                  className="max-h-[65dvh] w-full object-contain"
                />
              </div>

              <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <p className="text-sm leading-relaxed font-medium text-[#181615]">
                  {activeLightboxMemory.caption}
                </p>

                {totalMemories > 1 && (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={goPrevPhoto}
                      aria-label="Foto sebelumnya"
                      className="inline-flex items-center gap-1 rounded-xl border border-[#E7E2DA] px-3 py-2 text-xs font-semibold text-[#181615] transition-colors hover:bg-[#FAF8F5]"
                    >
                      <CaretLeft size={14} weight="bold" />
                      <span>Prev</span>
                    </button>
                    <button
                      type="button"
                      onClick={goNextPhoto}
                      aria-label="Foto berikutnya"
                      className="inline-flex items-center gap-1 rounded-xl bg-[#DC2626] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#B91C1C]"
                    >
                      <span>Next</span>
                      <CaretRight size={14} weight="bold" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

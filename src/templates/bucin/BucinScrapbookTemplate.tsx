"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Calendar,
  CaretLeft,
  CaretRight,
  Check,
  EnvelopeOpen,
  Heart,
  Lock,
  LockOpen,
  MusicNotes,
  Note,
  Ticket,
  VinylRecord,
  X,
} from "@phosphor-icons/react";
import { MusicPlayer } from "@/components/MusicPlayer";
import type { BucinSiteConfig } from "@/lib/schema";
import { playSfx } from "@/lib/sfx";
import { cn } from "@/lib/utils";

interface ElapsedDuration {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

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

const POLAROID_ROTATIONS = [
  "-rotate-2",
  "rotate-1",
  "-rotate-1",
  "rotate-2",
  "-rotate-2",
  "rotate-1",
];

const TAPE_STYLES = [
  "border-amber-200/80 bg-amber-100/85 -rotate-2",
  "border-rose-200/75 bg-[#FDF2F8]/95 rotate-1",
  "border-emerald-200/75 bg-emerald-50/90 -rotate-1",
  "border-amber-200/80 bg-amber-100/85 rotate-2",
  "border-rose-200/75 bg-[#FDF2F8]/95 -rotate-2",
  "border-sky-200/75 bg-sky-50/90 rotate-1",
];

const STICKY_NOTE_STYLES = [
  {
    bg: "bg-[#FEF9C3] border-amber-200/90",
    tape: "bg-amber-200/75 border-amber-300/60",
    tilt: "-rotate-1",
  },
  {
    bg: "bg-[#FCE7F3] border-rose-200/90",
    tape: "bg-rose-200/75 border-rose-300/60",
    tilt: "rotate-1",
  },
  {
    bg: "bg-[#DCFCE7] border-emerald-200/90",
    tape: "bg-emerald-200/75 border-emerald-300/60",
    tilt: "-rotate-1",
  },
  {
    bg: "bg-[#E0F2FE] border-sky-200/90",
    tape: "bg-sky-200/75 border-sky-300/60",
    tilt: "rotate-1",
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

export function BucinScrapbookTemplate({
  site,
  embedded = false,
}: {
  site: BucinSiteConfig;
  embedded?: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const { data } = site;
  const expectedPin = data.passcodePin.trim();
  const hasPin = expectedPin.length > 0;

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);

  const [elapsed, setElapsed] = useState<ElapsedDuration | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [reasonIndex, setReasonIndex] = useState(0);
  const [deckDirection, setDeckDirection] = useState<1 | -1>(1);
  const [claimedCoupons, setClaimedCoupons] = useState<Record<number, boolean>>({});

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

  const unlockScrapbook = useCallback(() => {
    setPinError(false);
    setIsUnlocked(true);
  }, []);

  const submitPin = useCallback(
    (candidate: string) => {
      if (!hasPin) {
        unlockScrapbook();
        return;
      }
      if (candidate === expectedPin) {
        unlockScrapbook();
        return;
      }
      setPinError(true);
      setShakeCount((prev) => prev + 1);
      setPinInput("");
    },
    [expectedPin, hasPin, unlockScrapbook]
  );

  const handleDigitPress = useCallback(
    (digit: string) => {
      if (!hasPin || pinInput.length >= 4) return;
      const next = `${pinInput}${digit}`;
      setPinError(false);
      setPinInput(next);
      if (next.length === 4) {
        if (next === expectedPin) {
          unlockScrapbook();
        } else {
          setPinError(true);
          setShakeCount((prev) => prev + 1);
          setPinInput("");
        }
      }
    },
    [expectedPin, hasPin, pinInput, unlockScrapbook]
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
  }, [handleBackspace, handleDigitPress, hasPin, isUnlocked, pinInput, submitPin]);

  const totalMemories = data.memories.length;

  const openLightbox = (index: number) => {
    playSfx("camera-shutter");
    setLightboxIndex(index);
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
  const activeReasonIndex =
    totalReasons > 0 ? ((reasonIndex % totalReasons) + totalReasons) % totalReasons : 0;

  const goPrevReason = () => {
    if (totalReasons <= 1) return;
    playSfx("paper-flip");
    setDeckDirection(-1);
    setReasonIndex((prev) => (prev - 1 + totalReasons) % totalReasons);
  };

  const goNextReason = () => {
    if (totalReasons <= 1) return;
    playSfx("paper-flip");
    setDeckDirection(1);
    setReasonIndex((prev) => (prev + 1) % totalReasons);
  };

  const toggleCouponClaim = (index: number) => {
    if (!claimedCoupons[index]) {
      playSfx("stamp-claim");
    }
    setClaimedCoupons((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const primaryMemory = data.memories[0];
  const secondaryMemory = data.memories[1];
  const milestones = data.milestones ?? [];
  const littleThings = data.littleThings ?? [];
  const coupons = data.coupons ?? [];

  const activeLightboxMemory =
    lightboxIndex !== null ? data.memories[lightboxIndex] ?? null : null;

  const counterUnits = [
    { label: "Hari", value: elapsed ? String(elapsed.days) : "--" },
    { label: "Jam", value: elapsed ? padTwo(elapsed.hours) : "--" },
    { label: "Menit", value: elapsed ? padTwo(elapsed.minutes) : "--" },
    { label: "Detik", value: elapsed ? padTwo(elapsed.seconds) : "--" },
  ];

  const keypadDigits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const shouldSpinVinyl =
    isUnlocked && site.musicTrack !== "none" && !prefersReducedMotion;

  return (
    <div
      style={{
        backgroundImage: "radial-gradient(#CBD5E1 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
      className={cn(
        "relative w-full bg-[#F8F9FA] font-jakarta text-[#18181B] selection:bg-[#FDF2F8] selection:text-[#BE185D]",
        embedded
          ? isUnlocked
            ? "min-h-[760px]"
            : "h-[760px] overflow-hidden"
          : "min-h-[100dvh]"
      )}
    >
      {/* Section 1: Animated Folded Paper Envelope PIN Gate */}
      <AnimatePresence>
        {!isUnlocked && (
          <motion.div
            key="bucin-lock-gate"
            initial={{ opacity: 1 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0, transition: { duration: 0.15 } }
                : { opacity: 0, y: -48, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }
            }
            style={{
              backgroundImage: "radial-gradient(#CBD5E1 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
            className={cn(
              "inset-0 z-30 flex items-center justify-center bg-[#F8F9FA]/96 px-4 py-8 backdrop-blur-xs",
              embedded ? "absolute" : "fixed"
            )}
          >
            <motion.div
              key={shakeCount}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={
                pinError && !prefersReducedMotion
                  ? { opacity: 1, y: 0, x: [0, -8, 8, -6, 6, -3, 3, 0] }
                  : { opacity: 1, y: 0, x: 0 }
              }
              transition={{ duration: 0.38 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200/90 bg-[#FFFDF9] shadow-[0_24px_60px_rgba(24,24,27,0.1)]"
            >
              {/* Folded paper envelope top flap */}
              <div className="relative h-14 w-full overflow-hidden border-b border-rose-200/60 bg-[#FDF2F8]">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 400 56"
                  preserveAspectRatio="none"
                  className="h-full w-full"
                >
                  <polygon points="0,0 400,0 200,52" fill="#FFF7FA" />
                  <polyline
                    points="0,0 200,52 400,0"
                    fill="none"
                    stroke="#FBCFE8"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>

              <div className="relative px-6 pt-8 pb-6 sm:px-8 sm:pb-8">
                {/* Envelope paper seal */}
                <div className="mx-auto -mt-14 mb-4 flex h-12 w-12 items-center justify-center rounded-xl rotate-3 border-2 border-[#BE185D]/25 bg-[#BE185D] text-white shadow-md">
                  {hasPin ? (
                    <Lock size={20} weight="duotone" />
                  ) : (
                    <EnvelopeOpen size={20} weight="duotone" />
                  )}
                </div>

                <div className="text-center">
                  <p className="font-handwriting text-2xl text-[#BE185D]">
                    Buat {data.partnerTwo}, dari {data.partnerOne}
                  </p>

                  <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-[#18181B]">
                    Psst, ada surat kecil buat kamu
                  </h2>

                  <p className="mt-1.5 text-sm leading-relaxed text-[#52525B]">
                    {hasPin
                      ? "Coba masukin 4 digit tanggal jadian kita ya."
                      : "Tap tombol di bawah buat buka scrapbook kenangan kita."}
                  </p>
                </div>

                {hasPin ? (
                  <div className="mt-6">
                    <div
                      className="flex justify-center gap-3"
                      aria-label="Kolom 4 digit PIN"
                    >
                      {[0, 1, 2, 3].map((slot) => {
                        const filled = slot < pinInput.length;
                        return (
                          <div
                            key={slot}
                            className={cn(
                              "flex h-12 w-12 items-center justify-center rounded-xl border text-lg font-semibold transition-colors",
                              pinError
                                ? "border-red-400 bg-red-50 text-red-600"
                                : filled
                                  ? "border-[#BE185D] bg-[#FDF2F8] text-[#BE185D]"
                                  : "border-zinc-200 bg-white text-zinc-400"
                            )}
                          >
                            {filled ? (
                              <Heart size={15} weight="fill" className="text-[#BE185D]" />
                            ) : (
                              <span className="h-1.5 w-1.5 rounded-xs bg-zinc-300" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {expectedPin === "1205" && (
                      <p className="mt-3 text-center font-mono text-xs text-[#52525B]">
                        Bocoran demo: 1205
                      </p>
                    )}

                    {pinError && (
                      <p
                        role="alert"
                        className="mt-2 text-center text-xs font-medium text-red-600"
                      >
                        Eh salah, masa lupa tanggal sendiri? Coba lagi ya.
                      </p>
                    )}

                    <div className="mx-auto mt-5 grid max-w-[260px] grid-cols-3 gap-2.5">
                      {keypadDigits.map((digit) => (
                        <button
                          key={digit}
                          type="button"
                          onClick={() => handleDigitPress(digit)}
                          className="flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white text-base font-semibold text-[#18181B] shadow-2xs transition-colors hover:border-[#BE185D]/40 hover:bg-[#FDF2F8] active:scale-[0.97]"
                        >
                          {digit}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={handleBackspace}
                        className="flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-semibold text-[#52525B] transition-colors hover:bg-zinc-100 active:scale-[0.97]"
                      >
                        Hapus
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDigitPress("0")}
                        className="flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white text-base font-semibold text-[#18181B] shadow-2xs transition-colors hover:border-[#BE185D]/40 hover:bg-[#FDF2F8] active:scale-[0.97]"
                      >
                        0
                      </button>
                      <button
                        type="button"
                        onClick={() => submitPin(pinInput)}
                        className="flex h-11 items-center justify-center rounded-xl bg-[#BE185D] text-xs font-semibold text-white transition-colors hover:bg-[#9D174D] active:scale-[0.97]"
                      >
                        Buka
                      </button>
                    </div>

                    <div className="mt-5 flex flex-col items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => submitPin(pinInput)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#BE185D] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#9D174D] active:scale-[0.99]"
                      >
                        <LockOpen size={17} weight="bold" />
                        <span>Buka Sekarang</span>
                      </button>

                      {(expectedPin === "1205" || embedded) && (
                        <button
                          type="button"
                          onClick={unlockScrapbook}
                          className="text-xs font-medium text-[#52525B] underline decoration-zinc-300 underline-offset-4 transition-colors hover:text-[#BE185D]"
                        >
                          Lewati (Demo)
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 flex justify-center">
                    <button
                      type="button"
                      onClick={unlockScrapbook}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#BE185D] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#9D174D] active:scale-[0.99]"
                    >
                      <EnvelopeOpen size={18} weight="fill" />
                      <span>Buka Sekarang</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div aria-hidden={!isUnlocked}>
        {/* Section 2: Scrapbook Hero */}
        <header
          className={cn(
            "mx-auto flex max-w-6xl items-center px-5 pt-16 pb-14 sm:px-8",
            embedded ? "min-h-[700px]" : "min-h-[100dvh]"
          )}
        >
          <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
            <motion.div
              initial={
                prefersReducedMotion || embedded
                  ? false
                  : { opacity: 1, y: 12 }
              }
              animate={isUnlocked ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-7"
            >
              <p className="font-handwriting text-2xl text-[#BE185D] sm:text-3xl">
                Buat {data.partnerTwo}, dari {data.partnerOne}
              </p>

              <h1 className="mt-3 text-4xl leading-[1.1] font-bold tracking-tight text-[#18181B] sm:text-5xl lg:text-6xl">
                {data.heroHeadline}
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-[#52525B] sm:text-lg">
                {data.openingNote}
              </p>

              <div className="mt-8 rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-[0_8px_30px_rgba(24,24,27,0.05)] sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold tracking-wider text-[#BE185D] uppercase">
                    Kita Udah Bareng Selama
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#52525B]">
                    <Calendar size={14} weight="regular" />
                    <span>Sejak {formatAnniversaryDate(data.anniversaryDate)}</span>
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-2.5 sm:gap-4">
                  {counterUnits.map((unit) => (
                    <div
                      key={unit.label}
                      className="rounded-xl border border-zinc-100 bg-[#FDF2F8]/65 px-2 py-3 text-center"
                    >
                      <div className="font-mono tabular-nums text-2xl font-bold tracking-tight text-[#18181B] sm:text-3xl">
                        {unit.value}
                      </div>
                      <div className="mt-1 text-[11px] font-semibold tracking-wide text-[#52525B] uppercase">
                        {unit.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Overlapping 2-photo Polaroid collage */}
            {primaryMemory && (
              <div className="relative flex min-h-[380px] items-center justify-center lg:col-span-5 lg:justify-end">
                <div className="relative w-full max-w-[360px] pt-4 pb-6">
                  {secondaryMemory && (
                    <motion.button
                      type="button"
                      onClick={() => openLightbox(1)}
                      initial={
                        prefersReducedMotion || embedded
                          ? false
                          : { opacity: 1, rotate: -10, y: 14 }
                      }
                      animate={
                        isUnlocked
                          ? { opacity: 1, rotate: -6, y: 0 }
                          : undefined
                      }
                      whileHover={
                        prefersReducedMotion
                          ? undefined
                          : { y: -6, rotate: -3, transition: { type: "spring", stiffness: 300, damping: 22 } }
                      }
                      transition={{ duration: 0.55, delay: 0.14 }}
                      className="group absolute top-0 -right-2 w-[72%] rounded-sm border border-zinc-200 bg-white p-2.5 pb-4 text-left shadow-[0_14px_32px_rgba(24,24,27,0.09)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BE185D] sm:-right-4"
                    >
                      <div
                        aria-hidden="true"
                        className="absolute -top-2.5 left-1/2 h-5 w-20 -translate-x-1/2 rotate-2 border border-rose-200/75 bg-[#FDF2F8]/95 shadow-2xs"
                      />
                      <div className="relative aspect-[4/4.2] w-full overflow-hidden rounded-[2px] bg-zinc-100">
                        <img
                          src={secondaryMemory.imageUrl}
                          alt={secondaryMemory.caption}
                          loading="eager"
                          decoding="async"
                          className="absolute inset-0 block h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                      <p className="font-handwriting mt-2.5 truncate px-1 text-lg text-[#18181B]">
                        {secondaryMemory.caption}
                      </p>
                    </motion.button>
                  )}

                  <motion.button
                    type="button"
                    onClick={() => openLightbox(0)}
                    initial={
                      prefersReducedMotion || embedded
                        ? false
                        : { opacity: 1, rotate: 6, y: 16 }
                    }
                    animate={
                      isUnlocked
                        ? { opacity: 1, rotate: 2, y: 0 }
                        : undefined
                    }
                    whileHover={
                      prefersReducedMotion
                        ? undefined
                        : { y: -8, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 22 } }
                    }
                    transition={{ duration: 0.55, delay: 0.05 }}
                    className={cn(
                      "group relative z-10 w-[82%] rounded-sm border border-zinc-200 bg-white p-3 pb-5 text-left shadow-[0_20px_44px_rgba(24,24,27,0.12)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BE185D]",
                      secondaryMemory ? "mt-16" : "mx-auto block w-full max-w-sm"
                    )}
                  >
                    <div
                      aria-hidden="true"
                      className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-2 border border-amber-200/80 bg-amber-100/85 shadow-2xs"
                    />
                    <div className="relative aspect-[4/4.6] w-full overflow-hidden rounded-[2px] bg-zinc-100">
                      <img
                        src={primaryMemory.imageUrl}
                        alt={primaryMemory.caption}
                        loading="eager"
                        decoding="async"
                        className="absolute inset-0 block h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <p className="font-handwriting mt-3.5 text-2xl leading-snug text-[#18181B]">
                      {primaryMemory.caption}
                    </p>
                    <p className="mt-1 font-mono text-xs text-[#52525B]">
                      {primaryMemory.dateLabel}
                    </p>
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-6xl space-y-24 px-5 pb-20 sm:px-8">
          {/* Section 3: "Jejak Cerita Kita" Milestone Timeline */}
          {milestones.length > 0 && (
            <section aria-labelledby="milestones-heading" className="mx-auto max-w-3xl">
              <div className="border-b border-zinc-200/80 pb-5">
                <p className="font-handwriting text-2xl text-[#BE185D]">
                  Dari awal kenal
                </p>
                <h2
                  id="milestones-heading"
                  className="mt-0.5 text-2xl font-bold tracking-tight text-[#18181B] sm:text-3xl"
                >
                  Cerita Kita Dari Awal
                </h2>
              </div>

              <ol className="relative mt-10 ml-3 border-l-2 border-dashed border-[#BE185D]/30 pl-7 sm:ml-4 sm:pl-9">
                {milestones.map((item, idx) => (
                  <motion.li
                    key={`${item.dateLabel}-${idx}`}
                    initial={
                      prefersReducedMotion || embedded
                        ? false
                        : { opacity: 1, x: -12 }
                    }
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: "some" }}
                    transition={
                      prefersReducedMotion
                        ? { duration: 0.1 }
                        : { duration: 0.45, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }
                    }
                    className={cn("relative", idx < milestones.length - 1 && "pb-9")}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute top-1.5 -left-[39px] flex h-5 w-5 items-center justify-center rounded-md border border-[#BE185D]/30 bg-[#FDF2F8] text-[#BE185D] sm:-left-[47px]"
                    >
                      <Heart size={11} weight="fill" />
                    </span>

                    <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-[0_6px_22px_rgba(24,24,27,0.04)] sm:p-6">
                      <p className="font-mono text-xs font-semibold tracking-wide text-[#BE185D]">
                        {item.dateLabel}
                      </p>
                      <h3 className="mt-1.5 text-lg font-bold text-[#18181B]">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-[#52525B] sm:text-base">
                        {item.description}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </section>
          )}

          {/* Section 4: Expanded 6-Photo Polaroid Wall */}
          <section aria-labelledby="scrapbook-gallery-heading">
            <div className="flex flex-col justify-between gap-3 border-b border-zinc-200/80 pb-5 sm:flex-row sm:items-end">
              <div>
                <p className="font-handwriting text-2xl text-[#BE185D]">
                  Album kita
                </p>
                <h2
                  id="scrapbook-gallery-heading"
                  className="mt-0.5 text-2xl font-bold tracking-tight text-[#18181B] sm:text-3xl"
                >
                  Foto-Foto Favoritku Sama Kamu
                </h2>
              </div>
              <p className="text-sm text-[#52525B]">
                Klik fotonya kalau mau lihat lebih dekat.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {data.memories.map((memory, index) => {
                const rotationClass =
                  POLAROID_ROTATIONS[index % POLAROID_ROTATIONS.length];
                const tapeClass = TAPE_STYLES[index % TAPE_STYLES.length];

                return (
                  <motion.button
                    key={`${memory.imageUrl}-${index}`}
                    type="button"
                    onClick={() => openLightbox(index)}
                    initial={
                      prefersReducedMotion || embedded
                        ? false
                        : { opacity: 1, y: 14 }
                    }
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: "some" }}
                    whileHover={
                      prefersReducedMotion
                        ? undefined
                        : {
                            y: -6,
                            rotate: 0,
                            scale: 1.015,
                            transition: { type: "spring", stiffness: 320, damping: 22 },
                          }
                    }
                    transition={
                      prefersReducedMotion
                        ? { duration: 0.1 }
                        : { duration: 0.4, delay: (index % 3) * 0.07 }
                    }
                    className={cn(
                      "group relative flex flex-col rounded-sm border border-zinc-200/90 bg-white p-3.5 pb-5 text-left shadow-[0_10px_28px_rgba(24,24,27,0.07)] transition-shadow hover:z-10 hover:shadow-[0_20px_42px_rgba(24,24,27,0.13)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BE185D]",
                      rotationClass
                    )}
                  >
                    <div
                      aria-hidden="true"
                      className={cn(
                        "absolute -top-2.5 left-1/2 h-5 w-20 -translate-x-1/2 border shadow-2xs",
                        tapeClass
                      )}
                    />

                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2px] bg-zinc-100">
                      <img
                        src={memory.imageUrl}
                        alt={memory.caption}
                        loading="eager"
                        decoding="async"
                        className="absolute inset-0 block h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    </div>

                    <div className="mt-3.5 flex flex-1 flex-col justify-between px-1">
                      <p className="font-handwriting text-2xl leading-snug text-[#18181B]">
                        {memory.caption}
                      </p>
                      <div className="mt-2.5 flex items-center justify-between text-xs font-medium text-[#52525B]">
                        <span className="font-mono">{memory.dateLabel}</span>
                        <span className="inline-flex items-center gap-1 font-semibold text-[#BE185D] opacity-85 transition-opacity group-hover:opacity-100">
                          <span>Lihat</span>
                          <ArrowRight size={12} weight="bold" />
                        </span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </section>

          {/* Section 5: "Hal-Hal Kecil Tentangmu yang Aku Hafal" Sticky Notes */}
          {littleThings.length > 0 && (
            <section aria-labelledby="little-things-heading">
              <div className="flex flex-col justify-between gap-2 border-b border-zinc-200/80 pb-5 sm:flex-row sm:items-end">
                <div>
                  <p className="font-handwriting text-2xl text-[#BE185D]">
                    Kebiasaan kecil
                  </p>
                  <h2
                    id="little-things-heading"
                    className="mt-0.5 text-2xl font-bold tracking-tight text-[#18181B] sm:text-3xl"
                  >
                    Hal Receh Tentang Kamu yang Aku Hafal
                  </h2>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#52525B]">
                  <Note size={15} weight="duotone" className="text-[#BE185D]" />
                  <span>{littleThings.length} hal yang aku hafal</span>
                </span>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {littleThings.map((item, idx) => {
                  const style = STICKY_NOTE_STYLES[idx % STICKY_NOTE_STYLES.length];
                  return (
                    <motion.article
                      key={`${item.label}-${idx}`}
                      initial={
                        prefersReducedMotion || embedded
                          ? false
                          : { opacity: 1, y: 12 }
                      }
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: "some" }}
                      whileHover={
                        prefersReducedMotion
                          ? undefined
                          : { y: -4, rotate: 0, transition: { type: "spring", stiffness: 320, damping: 24 } }
                      }
                      transition={
                        prefersReducedMotion
                          ? { duration: 0.1 }
                          : { duration: 0.4, delay: idx * 0.08 }
                      }
                      className={cn(
                        "relative flex flex-col justify-between rounded-sm border p-5 pt-7 shadow-[0_10px_24px_rgba(24,24,27,0.06)]",
                        style.bg,
                        style.tilt
                      )}
                    >
                      <div
                        aria-hidden="true"
                        className={cn(
                          "absolute -top-2.5 left-1/2 h-5 w-16 -translate-x-1/2 border",
                          style.tape
                        )}
                      />
                      <div>
                        <p className="font-mono text-[11px] font-semibold tracking-wider text-[#52525B] uppercase">
                          {padTwo(idx + 1)}
                        </p>
                        <h3 className="mt-2 text-base font-bold text-[#18181B]">
                          {item.label}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-[#52525B]">
                          {item.detail}
                        </p>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            </section>
          )}

          {/* Section 6: 3D Stacked "Alasan Aku Sayang Kamu" Deck */}
          <section aria-labelledby="love-reasons-heading" className="mx-auto max-w-3xl">
            <div className="text-center">
              <p className="font-handwriting text-2xl text-[#BE185D]">
                Tumpukan kartu
              </p>
              <h2
                id="love-reasons-heading"
                className="mt-0.5 text-2xl font-bold tracking-tight text-[#18181B] sm:text-3xl"
              >
                Kenapa Aku Sayang Banget Sama Kamu
              </h2>
              <p className="mt-2 text-sm text-[#52525B]">
                Geser atau klik tombol di bawah buat baca satu per satu.
              </p>
            </div>

            <div className="relative mx-auto mt-10 max-w-xl pb-6">
              {/* Layer 3 (deepest card in stack) */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-full translate-y-6 scale-[0.92] rotate-2 rounded-2xl border border-rose-200/80 bg-[#FDF2F8] shadow-sm"
              />
              {/* Layer 2 (middle card in stack) */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-full translate-y-3 scale-[0.96] -rotate-1 rounded-2xl border border-zinc-200 bg-white/95 shadow-sm"
              />

              {/* Layer 1 (active top card) */}
              <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_16px_38px_rgba(24,24,27,0.08)] sm:p-8">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                  <span className="text-xs font-bold tracking-wider text-[#BE185D] uppercase">
                    Alasan #{activeReasonIndex + 1}
                  </span>
                  <span className="font-mono tabular-nums text-xs font-semibold text-[#52525B]">
                    {padTwo(activeReasonIndex + 1)} / {padTwo(totalReasons)}
                  </span>
                </div>

                <div className="relative mt-6 flex min-h-[138px] items-center">
                  <AnimatePresence mode="wait" custom={deckDirection}>
                    <motion.p
                      key={activeReasonIndex}
                      custom={deckDirection}
                      initial={
                        prefersReducedMotion
                          ? { opacity: 0 }
                          : {
                              opacity: 0,
                              x: deckDirection * 48,
                              y: 8,
                              rotate: deckDirection * 3,
                            }
                      }
                      animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
                      exit={
                        prefersReducedMotion
                          ? { opacity: 0 }
                          : {
                              opacity: 0,
                              x: deckDirection * -56,
                              y: -8,
                              rotate: deckDirection * -3.5,
                            }
                      }
                      transition={
                        prefersReducedMotion
                          ? { duration: 0.12 }
                          : { type: "spring", stiffness: 310, damping: 24 }
                      }
                      className="text-lg leading-relaxed font-medium text-[#18181B] sm:text-xl"
                    >
                      {data.loveReasons[activeReasonIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4">
                  <button
                    type="button"
                    onClick={goPrevReason}
                    disabled={totalReasons <= 1}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-[#18181B] transition-colors hover:border-[#BE185D]/40 hover:bg-[#FDF2F8] disabled:opacity-40"
                  >
                    <CaretLeft size={14} weight="bold" />
                    <span>Sebelumnya</span>
                  </button>

                  <button
                    type="button"
                    onClick={goNextReason}
                    disabled={totalReasons <= 1}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#BE185D] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#9D174D] disabled:opacity-40"
                  >
                    <span>Berikutnya</span>
                    <CaretRight size={14} weight="bold" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 7: Interactive "Kupon Manis Buat Kamu Klaim" */}
          {coupons.length > 0 && (
            <section aria-labelledby="coupons-heading">
              <div className="flex flex-col justify-between gap-2 border-b border-zinc-200/80 pb-5 sm:flex-row sm:items-end">
                <div>
                  <p className="font-handwriting text-2xl text-[#BE185D]">
                    Buat kamu klaim
                  </p>
                  <h2
                    id="coupons-heading"
                    className="mt-0.5 text-2xl font-bold tracking-tight text-[#18181B] sm:text-3xl"
                  >
                    Kupon Anti-Ngambek (Bebas Dipake)
                  </h2>
                </div>
                <p className="text-sm text-[#52525B]">
                  Klik aja kuponnya kalau mau langsung dipake.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                {coupons.map((coupon, idx) => {
                  const isClaimed = Boolean(claimedCoupons[idx]);

                  return (
                    <motion.button
                      key={`${coupon.title}-${idx}`}
                      type="button"
                      onClick={() => toggleCouponClaim(idx)}
                      initial={
                        prefersReducedMotion || embedded
                          ? false
                          : { opacity: 1, y: 12 }
                      }
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: "some" }}
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
                      transition={
                        prefersReducedMotion
                          ? { duration: 0.1 }
                          : { duration: 0.4, delay: idx * 0.08 }
                      }
                      className={cn(
                        "group relative flex min-h-[210px] flex-col justify-between overflow-hidden rounded-xl border-2 border-dashed p-6 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BE185D]",
                        isClaimed
                          ? "border-[#BE185D] bg-[#FFF7FA]"
                          : "border-[#BE185D]/35 bg-white hover:border-[#BE185D]/70 hover:bg-[#FDF2F8]/35"
                      )}
                    >
                      {/* Ticket side cutouts */}
                      <span
                        aria-hidden="true"
                        className="absolute top-1/2 -left-3 h-6 w-6 -translate-y-1/2 rounded-full border-r-2 border-dashed border-[#BE185D]/35 bg-[#F8F9FA]"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute top-1/2 -right-3 h-6 w-6 -translate-y-1/2 rounded-full border-l-2 border-dashed border-[#BE185D]/35 bg-[#F8F9FA]"
                      />

                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#BE185D] uppercase">
                          <Ticket size={16} weight="duotone" />
                          <span>Kupon #{padTwo(idx + 1)}</span>
                        </div>
                      </div>

                      <div className="my-4">
                        <h3 className="text-lg font-bold tracking-tight text-[#18181B]">
                          {coupon.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-[#52525B]">
                          {coupon.note}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-dashed border-zinc-200 pt-3.5 text-xs font-semibold">
                        {isClaimed ? (
                          <span className="inline-flex items-center gap-1.5 text-[#BE185D]">
                            <Check size={14} weight="bold" />
                            <span>Tap lagi kalau mau batalin</span>
                          </span>
                        ) : (
                          <span className="text-[#52525B] transition-colors group-hover:text-[#BE185D]">
                            Tap buat klaim kupon
                          </span>
                        )}
                        <span className="font-mono text-[11px] text-[#52525B]">
                          {data.partnerOne} -&gt; {data.partnerTwo}
                        </span>
                      </div>

                      <AnimatePresence>
                        {isClaimed && (
                          <motion.span
                            key="claimed-stamp"
                            initial={
                              prefersReducedMotion
                                ? { opacity: 0 }
                                : { opacity: 0, scale: 1.5, rotate: -14 }
                            }
                            animate={{ opacity: 1, scale: 1, rotate: -6 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={
                              prefersReducedMotion
                                ? { duration: 0.12 }
                                : { type: "spring", stiffness: 380, damping: 20 }
                            }
                            className="pointer-events-none absolute top-5 right-5 rounded-xs border-2 border-[#BE185D] bg-white/90 px-2.5 py-1 font-mono text-[11px] font-bold tracking-widest text-[#BE185D] uppercase shadow-2xs"
                          >
                            UDAH DIPAKE
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Section 8: Spinning Vinyl Dedication + Lined-Paper Closing Letter */}
          <section aria-labelledby="closing-letter-heading" className="mx-auto max-w-3xl space-y-6">
            {/* Spinning Vinyl Dedication */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#BE185D]/20 bg-[#FDF2F8] px-5 py-4 sm:px-6">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={shouldSpinVinyl ? { rotate: 360 } : { rotate: 0 }}
                  transition={
                    shouldSpinVinyl
                      ? { repeat: Infinity, duration: 8, ease: "linear" }
                      : { duration: 0.3 }
                  }
                  className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#18181B] text-[#FDF2F8] shadow-md ring-2 ring-[#BE185D]/25"
                >
                  <VinylRecord size={44} weight="duotone" className="text-zinc-700" />
                  <span
                    aria-hidden="true"
                    className="absolute h-4 w-4 rounded-full border-2 border-white bg-[#BE185D]"
                  />
                </motion.div>

                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-[#BE185D] uppercase">
                    <MusicNotes size={13} weight="fill" />
                    <span>Lagu yang Selalu Ngingetin ke Kamu</span>
                  </div>
                  <p className="mt-0.5 text-base font-bold text-[#18181B]">
                    {data.songDedication.title} - {data.songDedication.artist}
                  </p>
                </div>
              </div>
            </div>

            {/* Lined-Paper Closing Letter */}
            <motion.div
              initial={
                prefersReducedMotion || embedded
                  ? false
                  : { opacity: 1, y: 12 }
              }
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: "some" }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-[#FFFDF9] p-7 shadow-[0_14px_38px_rgba(24,24,27,0.06)] sm:p-10"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-0 bottom-0 left-5 w-px bg-rose-200/80 sm:left-8"
              />

              <div className="pl-4 sm:pl-6">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#BE185D] uppercase">
                  <EnvelopeOpen size={15} weight="duotone" />
                  <span>Baca Ini Kalau Kamu Lagi Capek</span>
                </div>

                <h2
                  id="closing-letter-heading"
                  className="mt-2 text-2xl font-bold tracking-tight text-[#18181B]"
                >
                  Buat {data.partnerTwo}
                </h2>

                <div
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(transparent, transparent 31px, #E2E8F0 31px, #E2E8F0 32px)",
                    backgroundPositionY: "2px",
                  }}
                  className="mt-5 pb-2"
                >
                  <p className="whitespace-pre-line text-base leading-[32px] text-[#3F3F46] sm:text-lg sm:leading-[32px]">
                    {data.closingLetter}
                  </p>
                </div>

                <div className="mt-6 border-t border-zinc-200/70 pt-5">
                  <p className="text-xs font-medium text-[#52525B]">Yang selalu sayang kamu,</p>
                  <p className="font-handwriting mt-1 text-3xl text-[#BE185D]">
                    - {data.partnerOne}
                  </p>
                </div>
              </div>
            </motion.div>
          </section>
        </main>

        <footer className="border-t border-zinc-200/80 bg-white/75 py-6 text-center text-xs text-[#52525B]">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-[#BE185D]"
          >
            <span>Dibuat dengan KatalogWeb</span>
          </Link>
        </footer>
      </div>

      <MusicPlayer
        track={site.musicTrack}
        autoPlayTrigger={isUnlocked}
        className={embedded ? "!absolute" : ""}
      />

      <AnimatePresence>
        {activeLightboxMemory && lightboxIndex !== null && (
          <motion.div
            key="bucin-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label="Detail foto kenangan"
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/75 p-4 backdrop-blur-xs"
          >
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
              className="relative w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl sm:p-6"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono tabular-nums text-xs font-semibold text-[#52525B]">
                  {padTwo(lightboxIndex + 1)} / {padTwo(totalMemories)} -{" "}
                  {activeLightboxMemory.dateLabel}
                </span>
                <button
                  type="button"
                  onClick={closeLightbox}
                  aria-label="Tutup foto"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-[#18181B] transition-colors hover:bg-zinc-100"
                >
                  <X size={16} weight="bold" />
                </button>
              </div>

              <div className="max-h-[65dvh] overflow-hidden rounded-lg bg-zinc-100">
                <img
                  src={activeLightboxMemory.imageUrl}
                  alt={activeLightboxMemory.caption}
                  className="max-h-[65dvh] w-full object-contain"
                />
              </div>

              <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <p className="font-handwriting text-2xl text-[#18181B]">
                  {activeLightboxMemory.caption}
                </p>

                {totalMemories > 1 && (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={goPrevPhoto}
                      aria-label="Foto sebelumnya"
                      className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-[#18181B] transition-colors hover:bg-[#FDF2F8]"
                    >
                      <CaretLeft size={14} weight="bold" />
                      <span>Prev</span>
                    </button>
                    <button
                      type="button"
                      onClick={goNextPhoto}
                      aria-label="Foto berikutnya"
                      className="inline-flex items-center gap-1 rounded-xl bg-[#BE185D] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#9D174D]"
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

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Calendar,
  CaretLeft,
  CaretRight,
  EnvelopeOpen,
  Heart,
  Lock,
  LockOpen,
  MusicNotes,
  X,
} from "@phosphor-icons/react";
import { MusicPlayer } from "@/components/MusicPlayer";
import type { BucinSiteConfig } from "@/lib/schema";
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
  "-rotate-1",
  "rotate-1",
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
    setDeckDirection(-1);
    setReasonIndex((prev) => (prev - 1 + totalReasons) % totalReasons);
  };

  const goNextReason = () => {
    if (totalReasons <= 1) return;
    setDeckDirection(1);
    setReasonIndex((prev) => (prev + 1) % totalReasons);
  };

  const featuredMemory = data.memories[0];
  const activeLightboxMemory =
    lightboxIndex !== null ? data.memories[lightboxIndex] ?? null : null;

  const counterUnits = [
    { label: "Hari", value: elapsed ? String(elapsed.days) : "--" },
    { label: "Jam", value: elapsed ? padTwo(elapsed.hours) : "--" },
    { label: "Menit", value: elapsed ? padTwo(elapsed.minutes) : "--" },
    { label: "Detik", value: elapsed ? padTwo(elapsed.seconds) : "--" },
  ];

  const keypadDigits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

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
      <AnimatePresence>
        {!isUnlocked && (
          <motion.div
            key="bucin-lock-gate"
            initial={{ opacity: 1 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0, transition: { duration: 0.15 } }
                : { opacity: 0, y: -16, transition: { duration: 0.35, ease: "easeOut" } }
            }
            style={{
              backgroundImage: "radial-gradient(#CBD5E1 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
            className={cn(
              "inset-0 z-30 flex items-center justify-center bg-[#F8F9FA]/95 px-4 py-8 backdrop-blur-sm",
              embedded ? "absolute" : "fixed"
            )}
          >
            <motion.div
              key={shakeCount}
              initial={false}
              animate={
                pinError && !prefersReducedMotion
                  ? { x: [0, -8, 8, -6, 6, -3, 3, 0] }
                  : { x: 0 }
              }
              transition={{ duration: 0.35 }}
              className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_20px_50px_rgba(24,24,27,0.08)] sm:p-8"
            >
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-[#BE185D]/20 bg-[#FDF2F8] text-[#BE185D]">
                {hasPin ? (
                  <Lock size={22} weight="duotone" />
                ) : (
                  <EnvelopeOpen size={22} weight="duotone" />
                )}
              </div>

              <div className="text-center">
                <p className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF2F8] px-3 py-1 text-xs font-semibold tracking-wide text-[#BE185D]">
                  <Heart size={13} weight="fill" />
                  <span>
                    {data.partnerOne} &amp; {data.partnerTwo}
                  </span>
                </p>

                <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#18181B]">
                  {hasPin ? "Amplop Terkunci" : "Ada Surat Kecil Untukmu"}
                </h2>

                <p className="mt-1.5 text-sm leading-relaxed text-[#52525B]">
                  {hasPin
                    ? "Masukkan 4 digit tanggal spesial kita untuk membuka scrapbook ini."
                    : "Sentuh tombol di bawah untuk membuka kenangan dan surat dari hatiku."}
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
                                : "border-zinc-200 bg-zinc-50 text-zinc-400"
                          )}
                        >
                          {filled ? (
                            <span className="h-2.5 w-2.5 rounded-full bg-[#BE185D]" />
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-zinc-300" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {expectedPin === "1205" && (
                    <p className="mt-3 text-center text-xs font-medium text-[#52525B]">
                      Petunjuk demo: 1205
                    </p>
                  )}

                  {pinError && (
                    <p
                      role="alert"
                      className="mt-2 text-center text-xs font-medium text-red-600"
                    >
                      Kode belum tepat, coba masukkan 4 digit lagi.
                    </p>
                  )}

                  <div className="mx-auto mt-5 grid max-w-[260px] grid-cols-3 gap-2.5">
                    {keypadDigits.map((digit) => (
                      <button
                        key={digit}
                        type="button"
                        onClick={() => handleDigitPress(digit)}
                        className="flex h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white text-base font-semibold text-[#18181B] shadow-2xs transition-colors hover:border-[#BE185D]/40 hover:bg-[#FDF2F8] active:scale-[0.97]"
                      >
                        {digit}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleBackspace}
                      className="flex h-12 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-semibold text-[#52525B] transition-colors hover:bg-zinc-100 active:scale-[0.97]"
                    >
                      Hapus
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDigitPress("0")}
                      className="flex h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white text-base font-semibold text-[#18181B] shadow-2xs transition-colors hover:border-[#BE185D]/40 hover:bg-[#FDF2F8] active:scale-[0.97]"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={() => submitPin(pinInput)}
                      className="flex h-12 items-center justify-center rounded-xl bg-[#BE185D] text-xs font-semibold text-white transition-colors hover:bg-[#9D174D] active:scale-[0.97]"
                    >
                      Buka
                    </button>
                  </div>

                  <div className="mt-5 flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={() => submitPin(pinInput)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#BE185D] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#9D174D] active:scale-[0.99]"
                    >
                      <LockOpen size={17} weight="bold" />
                      <span>Buka Amplop</span>
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
                    <span>Buka Amplop</span>
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div aria-hidden={!isUnlocked}>
        <header
          className={cn(
            "mx-auto flex max-w-6xl items-center px-5 pt-16 pb-12 sm:px-8",
            embedded ? "min-h-[700px]" : "min-h-[100dvh]"
          )}
        >
          <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#BE185D]/20 bg-[#FDF2F8] px-3.5 py-1.5 text-xs font-semibold tracking-wide text-[#BE185D]">
                <Heart size={14} weight="fill" />
                <span>
                  {data.partnerOne} &amp; {data.partnerTwo}
                </span>
              </div>

              <h1 className="mt-5 text-4xl leading-[1.12] font-bold tracking-tight text-[#18181B] sm:text-5xl lg:text-6xl">
                {data.heroHeadline}
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-[#52525B] sm:text-lg">
                {data.openingNote}
              </p>

              <div className="mt-8 rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-[0_8px_30px_rgba(24,24,27,0.05)] sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold tracking-wider text-[#BE185D] uppercase">
                    Sudah Bersama
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
                      className="rounded-xl border border-zinc-100 bg-[#FDF2F8]/60 px-2 py-3 text-center"
                    >
                      <div className="tabular-nums text-2xl font-bold tracking-tight text-[#18181B] sm:text-3xl">
                        {unit.value}
                      </div>
                      <div className="mt-1 text-[11px] font-semibold tracking-wide text-[#52525B] uppercase">
                        {unit.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {featuredMemory && (
              <div className="flex justify-center lg:col-span-5 lg:justify-end">
                <button
                  type="button"
                  onClick={() => openLightbox(0)}
                  className="group relative w-full max-w-sm rotate-2 rounded-sm border border-zinc-200 bg-white p-3.5 pb-6 text-left shadow-[0_18px_40px_rgba(24,24,27,0.1)] transition-transform duration-300 hover:rotate-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BE185D]"
                >
                  <div
                    aria-hidden="true"
                    className="absolute -top-3.5 left-1/2 h-7 w-28 -translate-x-1/2 -rotate-2 border border-amber-200/80 bg-amber-100/85 shadow-2xs"
                  />
                  <div className="aspect-[4/5] w-full overflow-hidden rounded-[2px] bg-zinc-100">
                    <img
                      src={featuredMemory.imageUrl}
                      alt={featuredMemory.caption}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="mt-4 flex items-baseline justify-between gap-3 px-1">
                    <p className="font-handwriting text-2xl leading-snug text-[#18181B]">
                      {featuredMemory.caption}
                    </p>
                  </div>
                  <p className="mt-1 px-1 text-xs font-medium text-[#52525B]">
                    {featuredMemory.dateLabel}
                  </p>
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-6xl space-y-24 px-5 pb-20 sm:px-8">
          <section aria-labelledby="scrapbook-gallery-heading">
            <div className="flex flex-col justify-between gap-3 border-b border-zinc-200/80 pb-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold tracking-wider text-[#BE185D] uppercase">
                  Album Kenangan
                </p>
                <h2
                  id="scrapbook-gallery-heading"
                  className="mt-1 text-2xl font-bold tracking-tight text-[#18181B] sm:text-3xl"
                >
                  Potongan Momen di Polaroid
                </h2>
              </div>
              <p className="text-sm text-[#52525B]">
                Ketuk foto untuk melihat catatan lebih dekat.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.memories.map((memory, index) => {
                const rotationClass =
                  POLAROID_ROTATIONS[index % POLAROID_ROTATIONS.length];
                const isFirst = index === 0;

                return (
                  <button
                    key={`${memory.imageUrl}-${index}`}
                    type="button"
                    onClick={() => openLightbox(index)}
                    className={cn(
                      "group relative flex flex-col rounded-sm border border-zinc-200/90 bg-white p-3.5 pb-5 text-left shadow-[0_10px_28px_rgba(24,24,27,0.07)] transition-all duration-300 hover:z-10 hover:rotate-0 hover:shadow-[0_18px_38px_rgba(24,24,27,0.12)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BE185D]",
                      rotationClass,
                      isFirst && "md:col-span-2"
                    )}
                  >
                    <div
                      aria-hidden="true"
                      className="absolute -top-2.5 left-1/2 h-5 w-20 -translate-x-1/2 rotate-1 border border-rose-200/70 bg-[#FDF2F8]/95"
                    />

                    <div
                      className={cn(
                        "w-full overflow-hidden rounded-[2px] bg-zinc-100",
                        isFirst ? "aspect-[16/10]" : "aspect-[4/3]"
                      )}
                    >
                      <img
                        src={memory.imageUrl}
                        alt={memory.caption}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>

                    <div className="mt-3.5 flex flex-1 flex-col justify-between px-1">
                      <p className="font-handwriting text-2xl leading-snug text-[#18181B]">
                        {memory.caption}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-xs font-medium text-[#52525B]">
                        <span>{memory.dateLabel}</span>
                        <span className="inline-flex items-center gap-1 text-[#BE185D] opacity-85 transition-opacity group-hover:opacity-100">
                          <span>Lihat</span>
                          <ArrowRight size={12} weight="bold" />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="love-reasons-heading" className="mx-auto max-w-3xl">
            <div className="text-center">
              <p className="text-xs font-bold tracking-wider text-[#BE185D] uppercase">
                Tumpukan Kartu
              </p>
              <h2
                id="love-reasons-heading"
                className="mt-1 text-2xl font-bold tracking-tight text-[#18181B] sm:text-3xl"
              >
                Alasan Aku Sayang Kamu
              </h2>
              <p className="mt-2 text-sm text-[#52525B]">
                Geser atau tekan tombol untuk membaca setiap kartu satu per satu.
              </p>
            </div>

            <div className="relative mx-auto mt-10 max-w-xl">
              <div
                aria-hidden="true"
                className="absolute inset-x-4 top-3 -bottom-3 rotate-2 rounded-2xl border border-zinc-200 bg-[#FDF2F8]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-x-2 top-1.5 -bottom-1.5 -rotate-1 rounded-2xl border border-zinc-200 bg-white/90"
              />

              <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_14px_34px_rgba(24,24,27,0.07)] sm:p-8">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF2F8] px-3 py-1 text-xs font-semibold text-[#BE185D]">
                    <Heart size={13} weight="fill" />
                    <span>Alasan #{activeReasonIndex + 1}</span>
                  </span>
                  <span className="tabular-nums text-xs font-semibold text-[#52525B]">
                    {activeReasonIndex + 1} / {totalReasons}
                  </span>
                </div>

                <div className="relative mt-6 min-h-[132px] flex items-center">
                  <AnimatePresence mode="wait" custom={deckDirection}>
                    <motion.p
                      key={activeReasonIndex}
                      custom={deckDirection}
                      initial={
                        prefersReducedMotion
                          ? { opacity: 0 }
                          : { opacity: 0, x: deckDirection * 32, rotate: deckDirection * 1.5 }
                      }
                      animate={{ opacity: 1, x: 0, rotate: 0 }}
                      exit={
                        prefersReducedMotion
                          ? { opacity: 0 }
                          : { opacity: 0, x: deckDirection * -32, rotate: deckDirection * -1.5 }
                      }
                      transition={
                        prefersReducedMotion
                          ? { duration: 0.12 }
                          : { type: "spring", stiffness: 320, damping: 28 }
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

          <section aria-labelledby="closing-letter-heading" className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-[0_14px_38px_rgba(24,24,27,0.06)] sm:p-10">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#BE185D] uppercase">
                <EnvelopeOpen size={15} weight="duotone" />
                <span>Surat Penutup</span>
              </div>

              <h2
                id="closing-letter-heading"
                className="mt-2 text-2xl font-bold tracking-tight text-[#18181B]"
              >
                Untuk {data.partnerTwo}
              </h2>

              <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-[#52525B] sm:text-lg">
                {data.closingLetter}
              </p>

              <div className="mt-7 border-t border-zinc-100 pt-5">
                <p className="text-xs font-medium text-[#52525B]">Dengan hangat,</p>
                <p className="font-handwriting mt-1 text-3xl text-[#BE185D]">
                  {data.partnerOne}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#BE185D]/20 bg-[#FDF2F8] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#BE185D] shadow-2xs">
                  <MusicNotes size={20} weight="fill" />
                </div>
                <div>
                  <p className="text-[11px] font-bold tracking-wider text-[#BE185D] uppercase">
                    Dedikasi Lagu
                  </p>
                  <p className="text-sm font-semibold text-[#18181B]">
                    {data.songDedication.title} - {data.songDedication.artist}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-zinc-200/80 bg-white/70 py-6 text-center text-xs text-[#52525B]">
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
                <span className="tabular-nums text-xs font-semibold text-[#52525B]">
                  {lightboxIndex + 1} / {totalMemories} - {activeLightboxMemory.dateLabel}
                </span>
                <button
                  type="button"
                  onClick={closeLightbox}
                  aria-label="Tutup foto"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-[#18181B] transition-colors hover:bg-zinc-100"
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

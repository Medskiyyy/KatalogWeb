"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Backspace,
  CaretLeft,
  CaretRight,
  Check,
  EnvelopeOpen,
  Heart,
  Lock,
  MusicNotes,
  Scissors,
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

function buildIssueVolume(dateString: string): string {
  const parts = dateString.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    return "VOL. 01 / NO. 01";
  }
  const [year, month, day] = parts;
  const currentYear = new Date().getFullYear();
  const vol = Math.max(1, currentYear - year + 1);
  return `VOL. ${String(vol).padStart(2, "0")} / NO. ${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}`;
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

function splitLeadParagraph(text: string): { firstChar: string; rest: string } {
  const trimmed = text.trim();
  if (!trimmed) return { firstChar: "", rest: "" };
  return {
    firstChar: trimmed.slice(0, 1),
    rest: trimmed.slice(1),
  };
}

export function BucinMagazineTemplate({
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

  const [isUnlocked, setIsUnlocked] = useState(!hasPin);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);

  const [elapsed, setElapsed] = useState<ElapsedDuration | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [kangenCount, setKangenCount] = useState(0);
  const [kangenPulseKey, setKangenPulseKey] = useState(0);
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

  useEffect(() => {
    data.memories.forEach((memory) => {
      const img = new window.Image();
      img.src = memory.imageUrl;
    });
  }, [data.memories]);

  const unlockIssue = useCallback(() => {
    setPinError(false);
    setIsUnlocked(true);
  }, []);

  const submitPin = useCallback(
    (candidate: string) => {
      if (!hasPin || candidate === expectedPin) {
        unlockIssue();
        return;
      }
      setPinError(true);
      setShakeCount((prev) => prev + 1);
      setPinInput("");
    },
    [expectedPin, hasPin, unlockIssue]
  );

  const handleDigitPress = useCallback(
    (digit: string) => {
      if (!hasPin || pinInput.length >= 4) return;
      const next = `${pinInput}${digit}`;
      setPinError(false);
      setPinInput(next);
      if (next.length === 4) {
        if (next === expectedPin) {
          unlockIssue();
        } else {
          setPinError(true);
          setShakeCount((prev) => prev + 1);
          setPinInput("");
        }
      }
    },
    [expectedPin, hasPin, pinInput, unlockIssue]
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

  const toggleCouponClaim = (index: number) => {
    setClaimedCoupons((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleSendKangen = () => {
    setKangenCount((prev) => prev + 1);
    setKangenPulseKey((prev) => prev + 1);
  };

  const coverMemory = data.memories[0];
  const spreadLead = data.memories[0];
  const spreadSide = data.memories[1];
  const spreadPortraits = data.memories.slice(2, 6);
  const extraMemories = data.memories.slice(6);

  const milestones = data.milestones ?? [];
  const littleThings = data.littleThings ?? [];
  const coupons = data.coupons ?? [];

  const formattedAnniversary = formatAnniversaryDate(data.anniversaryDate);
  const issueVolume = buildIssueVolume(data.anniversaryDate);
  const activeLightboxMemory =
    lightboxIndex !== null ? data.memories[lightboxIndex] ?? null : null;

  const counterUnits = [
    { label: "HARI", value: elapsed ? String(elapsed.days) : "--" },
    { label: "JAM", value: elapsed ? padTwo(elapsed.hours) : "--" },
    { label: "MENIT", value: elapsed ? padTwo(elapsed.minutes) : "--" },
    { label: "DETIK", value: elapsed ? padTwo(elapsed.seconds) : "--" },
  ];

  const leadStoryText =
    milestones.length > 0
      ? `Dimulai sejak ${formattedAnniversary}, setiap fase kecil yang kita jalani pelan-pelan berubah jadi arsip paling berharga. Dari rencana dadakan sampai obrolan larut malam, inilah jejak perjalanan ${data.partnerOne} dan ${data.partnerTwo} yang layak dicetak ulang.`
      : data.openingNote;
  const { firstChar: leadDropCap, rest: leadRest } = splitLeadParagraph(leadStoryText);

  const keypadDigits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const sectionInitial =
    prefersReducedMotion || embedded ? false : { opacity: 1, y: 12 };

  return (
    <div
      className={cn(
        "relative w-full bg-[#FFFFFF] font-jakarta text-[#111111] selection:bg-[#BE123C] selection:text-white",
        embedded
          ? isUnlocked
            ? "min-h-[760px]"
            : "h-[760px] overflow-hidden"
          : "min-h-[100dvh]"
      )}
    >
      {/* Passcode Gate (only active when passcodePin is non-empty) */}
      <AnimatePresence>
        {!isUnlocked && hasPin && (
          <motion.div
            key="magazine-pin-gate"
            initial={{ opacity: 1 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0, transition: { duration: 0.15 } }
                : { opacity: 0, y: -24, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }
            }
            className={cn(
              "inset-0 z-30 flex items-center justify-center bg-[#F6F5F1] px-4 py-8",
              embedded ? "absolute" : "fixed"
            )}
          >
            <motion.div
              key={shakeCount}
              initial={prefersReducedMotion ? false : { opacity: 1, y: 8 }}
              animate={
                pinError && !prefersReducedMotion
                  ? { opacity: 1, y: 0, x: [0, -8, 8, -6, 6, -3, 3, 0] }
                  : { opacity: 1, y: 0, x: 0 }
              }
              transition={{ duration: 0.35 }}
              className="w-full max-w-md border border-[#111111] bg-[#FFFFFF] p-6 sm:p-8"
            >
              <div className="flex items-center justify-between border-b border-[#111111] pb-3 font-mono text-[11px] tracking-widest uppercase">
                <span>EDISI TERBATAS</span>
                <span className="text-[#BE123C]">{issueVolume}</span>
              </div>

              <div className="mt-6 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center border border-[#111111] bg-[#F6F5F1] text-[#111111]">
                  <Lock size={18} weight="bold" />
                </div>
                <p className="font-mono text-[11px] tracking-widest text-[#52525B] uppercase">
                  {data.partnerOne} &amp; {data.partnerTwo}
                </p>
                <h2 className="font-serif-editorial mt-1 text-3xl font-semibold italic text-[#111111]">
                  Buka Edisi Khusus
                </h2>
                <p className="mt-2 text-sm text-[#52525B]">
                  Masukkan 4 digit kode akses pribadi untuk membaca terbitan ini.
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
                        "flex h-12 w-12 items-center justify-center border text-base font-mono transition-colors",
                        pinError
                          ? "border-[#BE123C] bg-[#BE123C]/5 text-[#BE123C]"
                          : filled
                            ? "border-[#111111] bg-[#111111] text-white"
                            : "border-[#111111]/30 bg-[#F6F5F1] text-[#111111]"
                      )}
                    >
                      {filled ? (
                        <Heart size={14} weight="fill" className="text-white" />
                      ) : (
                        <span className="h-1.5 w-1.5 bg-[#111111]/30" />
                      )}
                    </div>
                  );
                })}
              </div>

              {pinError && (
                <p
                  role="alert"
                  className="mt-3 text-center font-mono text-xs font-medium text-[#BE123C]"
                >
                  Kode belum cocok. Coba cek lagi tanggal spesial kalian.
                </p>
              )}

              <div className="mx-auto mt-6 grid max-w-[260px] grid-cols-3 gap-2">
                {keypadDigits.map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleDigitPress(digit)}
                    className="flex h-11 items-center justify-center border border-[#111111] bg-[#FFFFFF] font-mono text-sm font-semibold text-[#111111] transition-colors hover:bg-[#F6F5F1] active:bg-[#111111] active:text-white"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleBackspace}
                  aria-label="Hapus digit"
                  className="flex h-11 items-center justify-center border border-[#111111]/40 bg-[#F6F5F1] text-[#111111] transition-colors hover:border-[#111111]"
                >
                  <Backspace size={18} weight="regular" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDigitPress("0")}
                  className="flex h-11 items-center justify-center border border-[#111111] bg-[#FFFFFF] font-mono text-sm font-semibold text-[#111111] transition-colors hover:bg-[#F6F5F1] active:bg-[#111111] active:text-white"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => submitPin(pinInput)}
                  aria-label="Masuk"
                  className="flex h-11 items-center justify-center border border-[#111111] bg-[#BE123C] text-white transition-colors hover:bg-[#9F1239]"
                >
                  <ArrowRight size={16} weight="bold" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Editorial Zine */}
      <div
        aria-hidden={!isUnlocked}
        className={cn(!isUnlocked && "pointer-events-none select-none")}
      >
        {/* 1. Magazine Masthead & Cover Hero */}
        <header className="border-b border-[#111111] bg-[#FFFFFF]">
          {/* Top Masthead Strip */}
          <div className="border-b border-[#111111] bg-[#F6F5F1]">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2.5 sm:px-8">
              <div className="flex items-center gap-3 font-mono text-[11px] font-semibold tracking-[0.16em] text-[#111111] uppercase">
                <span className="text-[#BE123C]">EDISI KHUSUS ANNIVERSARY</span>
                <span aria-hidden="true" className="text-[#111111]/35">
                  /
                </span>
                <span>{issueVolume}</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] tracking-widest text-[#111111] uppercase">
                <span>TERBIT: {formattedAnniversary}</span>
              </div>
            </div>
          </div>

          {/* Publication Title Bar + Live Counter */}
          <div className="border-b border-[#111111]">
            <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch lg:grid-cols-12">
              <div className="flex flex-col justify-center px-4 py-5 sm:px-8 lg:col-span-7 lg:border-r lg:border-[#111111]">
                <p className="font-mono text-[11px] tracking-[0.2em] text-[#52525B] uppercase">
                  JURNAL DUA KEPALA
                </p>
                <p className="font-archivo mt-1 text-3xl font-black tracking-tight text-[#111111] uppercase sm:text-5xl">
                  {data.partnerOne}{" "}
                  <span className="font-serif-editorial font-normal italic text-[#BE123C]">
                    &amp;
                  </span>{" "}
                  {data.partnerTwo}
                </p>
              </div>

              <div className="border-t border-[#111111] bg-[#F6F5F1] px-4 py-4 sm:px-8 lg:col-span-5 lg:border-t-0 lg:py-5">
                <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.18em] text-[#52525B] uppercase">
                  <span>DURASI TAYANG BERSAMA</span>
                  <span className="text-[#BE123C]">LIVE</span>
                </div>
                <div className="mt-2.5 grid grid-cols-4 border border-[#111111] bg-[#FFFFFF]">
                  {counterUnits.map((unit, idx) => (
                    <div
                      key={unit.label}
                      className={cn(
                        "px-2 py-2 text-center",
                        idx < counterUnits.length - 1 && "border-r border-[#111111]/20"
                      )}
                    >
                      <div className="font-mono tabular-nums text-lg font-bold tracking-tight text-[#111111] sm:text-xl">
                        {unit.value}
                      </div>
                      <div className="font-mono text-[9px] tracking-[0.16em] text-[#52525B] uppercase">
                        {unit.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Asymmetric Cover Grid */}
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
              {/* Cover Copy */}
              <motion.div
                initial={sectionInitial}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: "some" }}
                transition={{ duration: 0.45 }}
                className="flex flex-col justify-between lg:col-span-7"
              >
                <div className="flex items-center gap-2 border-b border-[#111111] pb-3 font-mono text-[11px] font-medium tracking-[0.18em] text-[#BE123C] uppercase">
                  <span>LAPORAN SAMPUL</span>
                  <span aria-hidden="true" className="text-[#111111]/30">
                    /
                  </span>
                  <span className="text-[#111111]">
                    {data.partnerOne} UNTUK {data.partnerTwo}
                  </span>
                </div>

                <h1 className="font-serif-editorial mt-6 text-4xl leading-[1.03] font-semibold italic tracking-tight text-[#111111] sm:text-6xl">
                  {data.heroHeadline}
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#3F3F46] sm:text-lg">
                  {data.openingNote}
                </p>

                <div className="mt-8 grid grid-cols-1 gap-4 border-t border-[#111111] pt-5 sm:grid-cols-2">
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.18em] text-[#52525B] uppercase">
                      SOUNDTRACK SAMPUL
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-[#111111]">
                      <MusicNotes size={16} weight="bold" className="shrink-0 text-[#BE123C]" />
                      <span>
                        {data.songDedication.title} - {data.songDedication.artist}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="font-mono text-[10px] tracking-[0.18em] text-[#52525B] uppercase">
                      ARAHAN REDAKSI
                    </p>
                    <p className="mt-1.5 text-sm text-[#3F3F46]">
                      Klik foto sampul atau spread galeri untuk membaca catatan tiap momen.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Cover Portrait */}
              {coverMemory && (
                <motion.div
                  initial={sectionInitial}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: "some" }}
                  transition={{ duration: 0.45 }}
                  className="lg:col-span-5"
                >
                  <button
                    type="button"
                    onClick={() => openLightbox(0)}
                    aria-label={`Buka foto sampul: ${coverMemory.caption}`}
                    className="group block w-full border border-[#111111] bg-[#F6F5F1] text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BE123C]"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden border-b border-[#111111] bg-[#F6F5F1]">
                      <img
                        src={coverMemory.imageUrl}
                        alt={coverMemory.caption}
                        loading="eager"
                        className="absolute inset-0 block h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    </div>
                    <div className="flex items-start justify-between gap-4 px-4 py-3">
                      <p className="text-xs leading-relaxed text-[#111111]">
                        {coverMemory.caption}
                      </p>
                      <span className="shrink-0 font-mono text-[10px] tracking-widest text-[#BE123C] uppercase">
                        {coverMemory.dateLabel}
                      </span>
                    </div>
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </header>

        <main>
          {/* 2. Artikel Utama: Kronologi Kita (data.milestones) */}
          {milestones.length > 0 && (
            <motion.section
              aria-labelledby="kronologi-heading"
              initial={sectionInitial}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: "some" }}
              transition={{ duration: 0.45 }}
              className="border-b border-[#111111] bg-[#F6F5F1]"
            >
              <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
                  {/* Left: Drop-cap Lead */}
                  <div className="lg:col-span-5">
                    <p className="font-mono text-[11px] font-semibold tracking-[0.2em] text-[#BE123C] uppercase">
                      ARTIKEL UTAMA
                    </p>
                    <h2
                      id="kronologi-heading"
                      className="font-archivo mt-2 text-3xl font-bold tracking-tight text-[#111111] uppercase sm:text-4xl"
                    >
                      Kronologi Kita
                    </h2>
                    <div className="mt-6 border-t border-[#111111] pt-5">
                      <p className="text-base leading-relaxed text-[#27272A]">
                        {leadDropCap && (
                          <span className="font-serif-editorial float-left mr-3 mt-1 text-6xl leading-[0.8] font-semibold italic text-[#BE123C]">
                            {leadDropCap}
                          </span>
                        )}
                        {leadRest}
                      </p>
                    </div>
                  </div>

                  {/* Right: Numbered Story Chapters */}
                  <div className="lg:col-span-7">
                    <ol className="divide-y divide-[#111111] border-y border-[#111111] bg-[#FFFFFF]">
                      {milestones.map((item, idx) => (
                        <li
                          key={`${item.dateLabel}-${item.title}-${idx}`}
                          className="grid grid-cols-1 gap-3 px-5 py-5 sm:grid-cols-12 sm:gap-5 sm:px-6"
                        >
                          <div className="flex items-baseline justify-between gap-2 sm:col-span-4 sm:block">
                            <span className="font-mono text-xs font-bold tracking-widest text-[#BE123C]">
                              {padTwo(idx + 1)}
                            </span>
                            <p className="font-mono mt-1 text-[11px] tracking-wider text-[#52525B] uppercase">
                              {item.dateLabel}
                            </p>
                          </div>
                          <div className="sm:col-span-8">
                            <h3 className="font-serif-editorial text-2xl font-semibold text-[#111111]">
                              {item.title}
                            </h3>
                            <p className="mt-1.5 text-sm leading-relaxed text-[#3F3F46]">
                              {item.description}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* 3. Spread Foto Eksklusif (data.memories) */}
          {data.memories.length > 0 && (
            <motion.section
              aria-labelledby="spread-foto-heading"
              initial={sectionInitial}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: "some" }}
              transition={{ duration: 0.45 }}
              className="border-b border-[#111111] bg-[#FFFFFF]"
            >
              <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
                <div className="flex flex-col justify-between gap-3 border-b border-[#111111] pb-4 sm:flex-row sm:items-end">
                  <div>
                    <p className="font-mono text-[11px] font-semibold tracking-[0.2em] text-[#BE123C] uppercase">
                      RUBRIK VISUAL
                    </p>
                    <h2
                      id="spread-foto-heading"
                      className="font-archivo mt-1 text-3xl font-bold tracking-tight text-[#111111] uppercase sm:text-4xl"
                    >
                      Spread Foto Eksklusif
                    </h2>
                  </div>
                  <p className="font-mono text-xs tracking-wider text-[#52525B] uppercase">
                    ARSIP {padTwo(data.memories.length)} BINGKAI PILIHAN
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-12">
                  {/* Top Lead Landscape */}
                  {spreadLead && (
                    <button
                      type="button"
                      onClick={() => openLightbox(0)}
                      className="group flex flex-col border border-[#111111] bg-[#F6F5F1] text-left md:col-span-7 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BE123C]"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-[#111111] bg-[#F6F5F1]">
                        <img
                          src={spreadLead.imageUrl}
                          alt={spreadLead.caption}
                          loading="eager"
                          className="absolute inset-0 block h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      </div>
                      <div className="flex items-start justify-between gap-4 p-4">
                        <p className="text-sm leading-snug font-medium text-[#111111]">
                          {spreadLead.caption}
                        </p>
                        <span className="shrink-0 font-mono text-[11px] tracking-wider text-[#BE123C] uppercase">
                          01 / {spreadLead.dateLabel}
                        </span>
                      </div>
                    </button>
                  )}

                  {/* Top Side Landscape */}
                  {spreadSide && (
                    <button
                      type="button"
                      onClick={() => openLightbox(1)}
                      className="group flex flex-col border border-[#111111] bg-[#F6F5F1] text-left md:col-span-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BE123C]"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-[#111111] bg-[#F6F5F1]">
                        <img
                          src={spreadSide.imageUrl}
                          alt={spreadSide.caption}
                          loading="eager"
                          className="absolute inset-0 block h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between gap-2 p-4">
                        <p className="text-sm leading-snug font-medium text-[#111111]">
                          {spreadSide.caption}
                        </p>
                        <span className="font-mono text-[11px] tracking-wider text-[#BE123C] uppercase">
                          02 / {spreadSide.dateLabel}
                        </span>
                      </div>
                    </button>
                  )}

                  {/* Bottom Row 4 Portraits */}
                  {spreadPortraits.map((memory, idx) => {
                    const memoryIdx = idx + 2;
                    return (
                      <button
                        key={`${memory.imageUrl}-${memoryIdx}`}
                        type="button"
                        onClick={() => openLightbox(memoryIdx)}
                        className="group flex flex-col border border-[#111111] bg-[#FFFFFF] text-left md:col-span-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BE123C]"
                      >
                        <div className="relative aspect-[3/4] w-full overflow-hidden border-b border-[#111111] bg-[#F6F5F1]">
                          <img
                            src={memory.imageUrl}
                            alt={memory.caption}
                            loading="eager"
                            className="absolute inset-0 block h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                          />
                        </div>
                        <div className="flex flex-1 flex-col justify-between gap-2 p-3.5">
                          <p className="text-xs leading-relaxed text-[#111111]">
                            {memory.caption}
                          </p>
                          <span className="font-mono text-[10px] tracking-wider text-[#52525B] uppercase">
                            {padTwo(memoryIdx + 1)} / {memory.dateLabel}
                          </span>
                        </div>
                      </button>
                    );
                  })}

                  {/* Extra photos if more than 6 */}
                  {extraMemories.map((memory, idx) => {
                    const memoryIdx = idx + 6;
                    return (
                      <button
                        key={`${memory.imageUrl}-${memoryIdx}`}
                        type="button"
                        onClick={() => openLightbox(memoryIdx)}
                        className="group flex flex-col border border-[#111111] bg-[#FFFFFF] text-left md:col-span-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BE123C]"
                      >
                        <div className="relative aspect-[3/4] w-full overflow-hidden border-b border-[#111111] bg-[#F6F5F1]">
                          <img
                            src={memory.imageUrl}
                            alt={memory.caption}
                            loading="eager"
                            className="absolute inset-0 block h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                          />
                        </div>
                        <div className="flex flex-1 flex-col justify-between gap-2 p-3.5">
                          <p className="text-xs leading-relaxed text-[#111111]">
                            {memory.caption}
                          </p>
                          <span className="font-mono text-[10px] tracking-wider text-[#52525B] uppercase">
                            {padTwo(memoryIdx + 1)} / {memory.dateLabel}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.section>
          )}

          {/* 4. Fakta Lapangan + Catatan Redaksi + Interactive Tombol Kangen */}
          <motion.section
            aria-labelledby="fakta-catatan-heading"
            initial={sectionInitial}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: "some" }}
            transition={{ duration: 0.45 }}
            className="border-b border-[#111111] bg-[#F6F5F1]"
          >
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
                {/* Left: 2x2 Hairline Ledger Grid (littleThings) */}
                <div className="lg:col-span-6">
                  <p className="font-mono text-[11px] font-semibold tracking-[0.2em] text-[#BE123C] uppercase">
                    DATA REDAKSI
                  </p>
                  <h2
                    id="fakta-catatan-heading"
                    className="font-archivo mt-1 text-3xl font-bold tracking-tight text-[#111111] uppercase"
                  >
                    Fakta Lapangan
                  </h2>
                  <p className="mt-2 text-sm text-[#52525B]">
                    Detail keseharian yang diam-diam selalu aku catat di luar kepala.
                  </p>

                  {littleThings.length > 0 && (
                    <div className="mt-6 grid grid-cols-1 border-t border-l border-[#111111] bg-[#FFFFFF] sm:grid-cols-2">
                      {littleThings.map((item, idx) => (
                        <div
                          key={`${item.label}-${idx}`}
                          className="border-r border-b border-[#111111] p-5"
                        >
                          <span className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#BE123C] uppercase">
                            CATATAN {padTwo(idx + 1)}
                          </span>
                          <h3 className="font-serif-editorial mt-2 text-xl font-semibold text-[#111111]">
                            {item.label}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-[#3F3F46]">
                            {item.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Numbered loveReasons + Interactive Tombol Kangen */}
                <div className="flex flex-col justify-between lg:col-span-6">
                  <div>
                    <p className="font-mono text-[11px] font-semibold tracking-[0.2em] text-[#BE123C] uppercase">
                      KOLOM OPINI
                    </p>
                    <h2 className="font-archivo mt-1 text-3xl font-bold tracking-tight text-[#111111] uppercase">
                      Catatan Redaksi
                    </h2>

                    <ol className="mt-6 divide-y divide-[#111111]/20 border-y border-[#111111] bg-[#FFFFFF]">
                      {data.loveReasons.map((reason, idx) => (
                        <li
                          key={`${idx}-${reason.slice(0, 16)}`}
                          className="flex items-start gap-4 px-5 py-4"
                        >
                          <span className="font-mono shrink-0 pt-0.5 text-xs font-bold tracking-widest text-[#BE123C]">
                            {padTwo(idx + 1)}
                          </span>
                          <p className="text-sm leading-relaxed text-[#18181B]">
                            {reason}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Interactive Tombol Kangen */}
                  <div className="mt-6 border border-[#111111] bg-[#FFFFFF] p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-mono text-[10px] tracking-[0.18em] text-[#52525B] uppercase">
                          KANAL INTERAKTIF
                        </p>
                        <p className="mt-1 text-sm font-medium text-[#111111]">
                          Lagi kepikiran {data.partnerOne} atau {data.partnerTwo}?
                        </p>
                      </div>

                      <div className="relative flex flex-col items-start sm:items-end">
                        <motion.button
                          type="button"
                          onClick={handleSendKangen}
                          whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
                          className="inline-flex items-center gap-2.5 border border-[#111111] bg-[#BE123C] px-4 py-2.5 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-[#9F1239]"
                        >
                          <motion.span
                            key={kangenPulseKey}
                            initial={prefersReducedMotion ? false : { scale: 1.35 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 450, damping: 16 }}
                            className="inline-flex"
                          >
                            <Heart size={15} weight="fill" />
                          </motion.span>
                          <span>Kirim Sinyal Kangen Hari Ini</span>
                        </motion.button>

                        <AnimatePresence mode="wait">
                          {kangenCount > 0 && (
                            <motion.span
                              key={kangenCount}
                              initial={
                                prefersReducedMotion
                                  ? false
                                  : { opacity: 1, y: 6, scale: 0.95 }
                              }
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ type: "spring", stiffness: 420, damping: 20 }}
                              className="mt-2 font-mono text-[11px] font-semibold text-[#BE123C]"
                            >
                              Terkirim {kangenCount}x hari ini!
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* 5. Rubrik Kupon Gunting (data.coupons) */}
          {coupons.length > 0 && (
            <motion.section
              aria-labelledby="kupon-heading"
              initial={sectionInitial}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: "some" }}
              transition={{ duration: 0.45 }}
              className="border-b border-[#111111] bg-[#FFFFFF]"
            >
              <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
                <div className="flex flex-col justify-between gap-3 border-b border-[#111111] pb-4 sm:flex-row sm:items-end">
                  <div>
                    <p className="font-mono text-[11px] font-semibold tracking-[0.2em] text-[#BE123C] uppercase">
                      LAMPIRAN PEMBACA
                    </p>
                    <h2
                      id="kupon-heading"
                      className="font-archivo mt-1 text-3xl font-bold tracking-tight text-[#111111] uppercase sm:text-4xl"
                    >
                      Rubrik Kupon Gunting
                    </h2>
                  </div>
                  <p className="font-mono text-xs tracking-wider text-[#52525B] uppercase">
                    KLIK KUPON UNTUK STEMPEL KLAIM
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                  {coupons.map((coupon, idx) => {
                    const isClaimed = Boolean(claimedCoupons[idx]);
                    return (
                      <button
                        key={`${coupon.title}-${idx}`}
                        type="button"
                        onClick={() => toggleCouponClaim(idx)}
                        aria-pressed={isClaimed}
                        className={cn(
                          "group relative flex flex-col justify-between border-2 border-dashed p-6 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BE123C]",
                          isClaimed
                            ? "border-[#111111]/45 bg-[#F6F5F1]"
                            : "border-[#111111] bg-[#FFFFFF] hover:bg-[#F6F5F1]"
                        )}
                      >
                        <div>
                          <div className="flex items-center justify-between border-b border-[#111111]/20 pb-3">
                            <span className="font-mono text-[11px] font-bold tracking-widest text-[#111111] uppercase">
                              KUPON #{padTwo(idx + 1)}
                            </span>
                            <Scissors
                              size={18}
                              weight="regular"
                              className="text-[#111111] transition-transform group-hover:translate-x-0.5"
                            />
                          </div>

                          <h3 className="font-serif-editorial mt-4 text-2xl font-semibold leading-snug text-[#111111]">
                            {coupon.title}
                          </h3>
                          <p className="mt-2.5 text-sm leading-relaxed text-[#3F3F46]">
                            {coupon.note}
                          </p>
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-[#111111]/20 pt-3 font-mono text-[11px] uppercase">
                          <span className="text-[#52525B]">
                            BERLAKU UNTUK {data.partnerTwo}
                          </span>
                          <span className="inline-flex items-center gap-1 font-bold text-[#111111]">
                            {isClaimed && <Check size={13} weight="bold" className="text-[#BE123C]" />}
                            {isClaimed ? "DIKLAIM" : "GUNTING"}
                          </span>
                        </div>

                        {isClaimed && (
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute top-3.5 right-12 -rotate-3 border-2 border-[#BE123C] bg-[#FFFFFF] px-2 py-0.5 font-mono text-[10px] font-extrabold tracking-[0.18em] text-[#BE123C] uppercase"
                          >
                            TERPAKAI
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.section>
          )}

          {/* 6. Surat Pemimpin Redaksi (data.closingLetter) */}
          <motion.section
            aria-labelledby="surat-redaksi-heading"
            initial={sectionInitial}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: "some" }}
            transition={{ duration: 0.45 }}
            className="bg-[#F6F5F1]"
          >
            <div className="mx-auto max-w-4xl px-4 py-14 sm:px-8 sm:py-20">
              <div className="border border-[#111111] bg-[#FFFFFF] p-7 sm:p-12">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#111111] pb-4">
                  <div className="flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.18em] text-[#BE123C] uppercase">
                    <EnvelopeOpen size={15} weight="bold" />
                    <span>SURAT PEMIMPIN REDAKSI</span>
                  </div>
                  <span className="font-mono text-[11px] tracking-widest text-[#52525B] uppercase">
                    HALAMAN PENUTUP
                  </span>
                </div>

                <h2
                  id="surat-redaksi-heading"
                  className="font-serif-editorial mt-6 text-3xl font-semibold italic text-[#111111] sm:text-4xl"
                >
                  Untuk {data.partnerTwo}, di meja baca paling tenang.
                </h2>

                <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-[#27272A] sm:text-lg sm:leading-relaxed">
                  {data.closingLetter}
                </p>

                <div className="mt-10 flex flex-col justify-between gap-4 border-t border-[#111111] pt-6 sm:flex-row sm:items-end">
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.18em] text-[#52525B] uppercase">
                      TERTANDA
                    </p>
                    <p className="font-serif-editorial mt-1 text-3xl font-semibold italic text-[#BE123C]">
                      {data.partnerOne}
                    </p>
                  </div>
                  <p className="font-mono text-[11px] tracking-wider text-[#52525B] uppercase">
                    DICETAK DIGITAL SEJAK {formattedAnniversary}
                  </p>
                </div>
              </div>
            </div>
          </motion.section>
        </main>

        <footer className="border-t border-[#111111] bg-[#FFFFFF] py-6 text-center font-mono text-[11px] tracking-wider text-[#52525B] uppercase">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-[#BE123C]"
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

      {/* Editorial Lightbox */}
      <AnimatePresence>
        {activeLightboxMemory && lightboxIndex !== null && (
          <motion.div
            key="magazine-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label="Detail foto editorial"
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/85 p-4"
          >
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-3xl border border-[#111111] bg-[#FFFFFF] p-4 sm:p-6"
            >
              <div className="mb-4 flex items-center justify-between border-b border-[#111111] pb-3">
                <span className="font-mono tabular-nums text-xs font-semibold tracking-wider text-[#111111] uppercase">
                  {padTwo(lightboxIndex + 1)} / {padTwo(totalMemories)} -{" "}
                  <span className="text-[#BE123C]">
                    {activeLightboxMemory.dateLabel}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={closeLightbox}
                  aria-label="Tutup foto"
                  className="inline-flex h-8 w-8 items-center justify-center border border-[#111111] text-[#111111] transition-colors hover:bg-[#F6F5F1]"
                >
                  <X size={16} weight="bold" />
                </button>
              </div>

              <div className="flex max-h-[65dvh] items-center justify-center border border-[#111111]/20 bg-[#F6F5F1]">
                <img
                  src={activeLightboxMemory.imageUrl}
                  alt={activeLightboxMemory.caption}
                  loading="eager"
                  className="max-h-[65dvh] w-full object-contain"
                />
              </div>

              <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <p className="font-serif-editorial text-2xl italic text-[#111111]">
                  {activeLightboxMemory.caption}
                </p>

                {totalMemories > 1 && (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={goPrevPhoto}
                      aria-label="Foto sebelumnya"
                      className="inline-flex items-center gap-1.5 border border-[#111111] bg-[#FFFFFF] px-3.5 py-2 font-mono text-xs font-semibold text-[#111111] uppercase transition-colors hover:bg-[#F6F5F1]"
                    >
                      <CaretLeft size={14} weight="bold" />
                      <span>Prev</span>
                    </button>
                    <button
                      type="button"
                      onClick={goNextPhoto}
                      aria-label="Foto berikutnya"
                      className="inline-flex items-center gap-1.5 border border-[#111111] bg-[#BE123C] px-3.5 py-2 font-mono text-xs font-semibold text-white uppercase transition-colors hover:bg-[#9F1239]"
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

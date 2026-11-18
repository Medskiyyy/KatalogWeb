"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowUp,
  CaretLeft,
  CaretRight,
  CassetteTape,
  CheckSquare,
  CornersOut,
  GameController,
  Lightning,
  Play,
  Square,
  Television,
  Trophy,
  X,
} from "@phosphor-icons/react";
import { MusicPlayer } from "@/components/MusicPlayer";
import type { UltahSiteConfig } from "@/lib/schema";
import { playSfx } from "@/lib/sfx";
import { cn } from "@/lib/utils";

interface StatBarConfig {
  id: string;
  label: string;
  baseValue: number;
  barColor: string;
}

const PLAYER_STATS: StatBarConfig[] = [
  {
    id: "hoki-kerjaan",
    label: "Hoki Kerjaan",
    baseValue: 75,
    barColor: "bg-[#10B981]",
  },
  {
    id: "stamina-begadang",
    label: "Stamina Begadang",
    baseValue: 70,
    barColor: "bg-[#F59E0B]",
  },
  {
    id: "skill-ngebanyol",
    label: "Skill Ngebanyol",
    baseValue: 78,
    barColor: "bg-[#10B981]",
  },
  {
    id: "saldo-tabungan",
    label: "Saldo Tabungan",
    baseValue: 72,
    barColor: "bg-[#F59E0B]",
  },
];

const LEADERBOARD_SCORES = [
  "9.999 PTS",
  "9.450 PTS",
  "8.920 PTS",
  "8.480 PTS",
  "7.960 PTS",
  "7.510 PTS",
];

const XP_PER_QUEST = 250;

export function UltahRetroTemplate({
  site,
  embedded = false,
}: {
  site: UltahSiteConfig;
  embedded?: boolean;
}) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const { data } = site;

  const [isOpened, setIsOpened] = useState(embedded);
  const [isBuffed, setIsBuffed] = useState(false);
  const [activeChannel, setActiveChannel] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [checkedQuests, setCheckedQuests] = useState<number[]>([]);

  const memories = data.memories;
  const friendWishes = data.friendWishes;
  const wishChecklist = data.wishChecklist ?? [];
  const cartridgeCoverSrc = data.cakeImageUrl || "/demo/ultah-retro-hero.webp";

  const safeChannelIndex =
    memories.length > 0 ? Math.min(activeChannel, memories.length - 1) : 0;
  const activeMemory = memories[safeChannelIndex];
  const activeLightboxMemory =
    lightboxIndex !== null ? memories[lightboxIndex] ?? null : null;

  const totalXp = wishChecklist.length * XP_PER_QUEST;
  const earnedXp = checkedQuests.length * XP_PER_QUEST;
  const xpPercent =
    wishChecklist.length > 0
      ? Math.round((checkedQuests.length / wishChecklist.length) * 100)
      : 0;

  useEffect(() => {
    const urls = new Set<string>([cartridgeCoverSrc]);
    memories.forEach((memory) => {
      urls.add(memory.imageUrl);
    });
    urls.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, [cartridgeCoverSrc, memories]);

  const handlePressStart = () => {
    playSfx("quiz-ding");
    setIsOpened(true);
  };

  const handleActivateBuff = () => {
    playSfx("party-cheer");
    setIsBuffed(true);
  };

  const handleSelectChannel = useCallback(
    (index: number) => {
      if (memories.length === 0) return;
      const normalized =
        ((index % memories.length) + memories.length) % memories.length;
      playSfx("camera-shutter");
      setActiveChannel(normalized);
    },
    [memories.length]
  );

  const handlePrevChannel = useCallback(() => {
    handleSelectChannel(safeChannelIndex - 1);
  }, [handleSelectChannel, safeChannelIndex]);

  const handleNextChannel = useCallback(() => {
    handleSelectChannel(safeChannelIndex + 1);
  }, [handleSelectChannel, safeChannelIndex]);

  const openLightbox = (index: number) => {
    playSfx("camera-shutter");
    setLightboxIndex(index);
  };

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const showPrevLightbox = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null || memories.length === 0) return prev;
      playSfx("camera-shutter");
      return (prev - 1 + memories.length) % memories.length;
    });
  }, [memories.length]);

  const showNextLightbox = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null || memories.length === 0) return prev;
      playSfx("camera-shutter");
      return (prev + 1) % memories.length;
    });
  }, [memories.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
      } else if (event.key === "ArrowLeft") {
        showPrevLightbox();
      } else if (event.key === "ArrowRight") {
        showNextLightbox();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex, closeLightbox, showPrevLightbox, showNextLightbox]);

  const toggleQuest = (index: number) => {
    playSfx("quiz-ding");
    setCheckedQuests((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index]
    );
  };

  const formatChannelNumber = (index: number) =>
    String(index + 1).padStart(2, "0");

  return (
    <div
      className={cn(
        "relative min-h-screen overflow-x-clip bg-[#F4F1EA] text-[#18181B]",
        embedded && "min-h-[760px]"
      )}
    >
      {/* Background Music Controller */}
      <MusicPlayer
        track={site.musicTrack}
        autoPlayTrigger={isOpened}
        className={cn(
          "border-2 border-[#18181B] bg-[#F4F1EA] font-mono text-[#18181B] shadow-[3px_3px_0_#18181B]",
          embedded && "!absolute"
        )}
      />

      {/* Retro Cartridge Boot Screen Gate (!embedded) */}
      <AnimatePresence>
        {!embedded && !isOpened && (
          <motion.div
            key="retro-boot-gate"
            initial={{ opacity: 1 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0, transition: { duration: 0.15 } }
                : {
                    opacity: 0,
                    y: -20,
                    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
                  }
            }
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#F4F1EA] px-4 py-8"
          >
            <div className="w-full max-w-lg border-2 border-[#18181B] bg-[#FFFFFF] shadow-[8px_8px_0_#18181B]">
              {/* Cartridge Top Grip Bar */}
              <div className="flex items-center justify-between border-b-2 border-[#18181B] bg-[#18181B] px-4 py-2.5 font-mono text-xs font-bold tracking-widest text-[#F4F1EA] uppercase">
                <span className="inline-flex items-center gap-2">
                  <GameController size={16} weight="fill" aria-hidden="true" />
                  <span>CARTRIDGE // 1996-ED</span>
                </span>
                <span className="text-[#F59E0B]">1P INSERT COIN</span>
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between border-b-2 border-dashed border-[#18181B]/30 pb-3 font-mono text-xs font-bold text-[#18181B]/75 uppercase">
                  <span>{data.birthDateLabel}</span>
                  <span>FROM: {data.senderName}</span>
                </div>

                <div className="mt-5 grid grid-cols-[92px_1fr] items-center gap-4 border-2 border-[#18181B] bg-[#F4F1EA] p-3 sm:grid-cols-[112px_1fr]">
                  <div className="aspect-square overflow-hidden border-2 border-[#18181B] bg-[#18181B]">
                    <img
                      src={cartridgeCoverSrc}
                      alt={`Cover cartridge ${data.celebrantName}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <p className="font-mono text-[11px] font-bold tracking-wider text-[#10B981] uppercase">
                      SYSTEM BOOT OK
                    </p>
                    <h1 className="font-archivo text-lg leading-tight font-extrabold tracking-tight text-[#18181B] uppercase sm:text-xl">
                      PLAYER READY: {data.celebrantName.toUpperCase()} - LEVEL{" "}
                      {data.turningAge}
                    </h1>
                    <p className="font-mono text-xs text-[#18181B]/75">
                      Save slot terisi: {memories.length} video tape &amp;{" "}
                      {friendWishes.length} squad log.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="font-mono text-xs font-bold text-[#18181B]/70">
                    <p>AUDIO: {data.playlistSong?.title ?? "ARCADE BGM"}</p>
                    <p>STATUS: SIAP DIMAINKAN</p>
                  </div>

                  <button
                    type="button"
                    onClick={handlePressStart}
                    className="inline-flex cursor-pointer items-center justify-center gap-2.5 border-2 border-[#18181B] bg-[#10B981] px-6 py-3.5 font-archivo text-sm font-extrabold tracking-wider text-[#18181B] uppercase shadow-[4px_4px_0_#18181B] transition-transform hover:bg-[#34D399] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#18181B]"
                  >
                    <Play size={18} weight="fill" aria-hidden="true" />
                    <span>PRESS START</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Retro Console Shell */}
      <main id="hero-profile">
        {/* Top Arcade Status Bar */}
        <header className="border-b-2 border-[#18181B] bg-[#18181B] text-[#F4F1EA]">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 font-mono text-xs font-bold tracking-wider uppercase sm:px-8">
            <div className="flex items-center gap-2.5">
              <GameController
                size={18}
                weight="fill"
                className="text-[#10B981]"
                aria-hidden="true"
              />
              <span>
                PLAYER: {data.celebrantName} {"//"} LVL {data.turningAge}
              </span>
            </div>
            <div className="flex items-center gap-4 text-[#F59E0B]">
              <span>{data.birthDateLabel}</span>
              <span className="hidden sm:inline">BY {data.senderName}</span>
            </div>
          </div>
        </header>

        {/* Section 1: Hero - Player Profile & Interactive RPG Stat Sheet */}
        <section className="border-b-2 border-[#18181B] bg-[#F4F1EA] py-10 sm:py-14">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-8 lg:grid-cols-12 lg:items-start">
            {/* Left Column: Cartridge Artwork + Level Header + Hero Wish */}
            <div className="space-y-5 lg:col-span-6">
              <div className="border-2 border-[#18181B] bg-[#FFFFFF] shadow-[4px_4px_0_#18181B]">
                <div className="flex items-center justify-between border-b-2 border-[#18181B] bg-[#F59E0B] px-4 py-2 font-mono text-xs font-bold tracking-wider text-[#18181B] uppercase">
                  <span>CARTRIDGE ARTWORK</span>
                  <span>EDITION LV.{data.turningAge}</span>
                </div>

                <div className="grid gap-5 p-4 sm:grid-cols-[200px_1fr] sm:items-center sm:p-5">
                  <div className="aspect-square overflow-hidden border-2 border-[#18181B] bg-[#18181B]">
                    <img
                      src={cartridgeCoverSrc}
                      alt={`Ilustrasi retro ulang tahun ${data.celebrantName}`}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="space-y-3">
                    <p className="font-mono text-xs font-bold tracking-wider text-[#10B981] uppercase">
                      STAGE CLEAR // {data.birthDateLabel}
                    </p>
                    <h1 className="font-archivo text-3xl leading-[1.05] font-extrabold tracking-tight text-[#18181B] uppercase sm:text-4xl">
                      {data.celebrantName}, Level {data.turningAge} Unlocked!
                    </h1>
                    <p className="font-mono text-xs font-bold text-[#18181B]/75 uppercase">
                      Kirimannya: {data.senderName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-2 border-[#18181B] bg-[#FFFFFF] p-5 shadow-[4px_4px_0_#18181B] sm:p-6">
                <p className="font-mono text-xs font-bold tracking-wider text-[#18181B]/65 uppercase">
                  MISSION BRIEFING // DOA UTAMA
                </p>
                <p className="mt-2.5 text-base leading-relaxed font-medium text-[#18181B] sm:text-lg">
                  {data.heroWish}
                </p>
              </div>
            </div>

            {/* Right Column: RPG Stat Sheet + Aktifkan Buff Doa */}
            <div className="border-2 border-[#18181B] bg-[#FFFFFF] shadow-[4px_4px_0_#18181B] lg:col-span-6">
              <div className="flex items-center justify-between border-b-2 border-[#18181B] bg-[#18181B] px-4 py-3 font-mono text-xs font-bold tracking-wider text-[#F4F1EA] uppercase">
                <span className="inline-flex items-center gap-2">
                  <Lightning
                    size={16}
                    weight="fill"
                    className="text-[#F59E0B]"
                    aria-hidden="true"
                  />
                  <span>RPG STAT SHEET // LV.{data.turningAge}</span>
                </span>
                <span
                  className={cn(
                    "px-2 py-0.5 text-[11px]",
                    isBuffed
                      ? "bg-[#10B981] text-[#18181B]"
                      : "bg-[#F59E0B] text-[#18181B]"
                  )}
                >
                  {isBuffed ? "MAX BUFF ON" : "BASE STATS"}
                </span>
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                <div className="flex items-baseline justify-between gap-4 border-b-2 border-dashed border-[#18181B]/25 pb-3">
                  <div>
                    <h2 className="font-archivo text-xl font-extrabold tracking-tight text-[#18181B] uppercase sm:text-2xl">
                      Status Karakter
                    </h2>
                    <p className="mt-0.5 font-mono text-xs text-[#18181B]/70">
                      Statistik tahunan siap di-boost biar makin gacor.
                    </p>
                  </div>
                  <span className="font-mono text-sm font-bold text-[#18181B] tabular-nums">
                    {isBuffed ? "400 / 400" : "295 / 400"}
                  </span>
                </div>

                <div className="space-y-4">
                  {PLAYER_STATS.map((stat) => {
                    const currentValue = isBuffed ? 100 : stat.baseValue;
                    return (
                      <div key={stat.id} className="space-y-1.5">
                        <div className="flex items-center justify-between font-mono text-xs font-bold uppercase sm:text-sm">
                          <span className="text-[#18181B]">{stat.label}</span>
                          <span
                            className={cn(
                              "tabular-nums",
                              isBuffed ? "text-[#10B981]" : "text-[#18181B]"
                            )}
                          >
                            {isBuffed ? "100% MAX" : `${currentValue}%`}
                          </span>
                        </div>

                        <div className="h-5 w-full overflow-hidden border-2 border-[#18181B] bg-[#F4F1EA] p-0.5">
                          <motion.div
                            initial={false}
                            animate={{ width: `${currentValue}%` }}
                            transition={
                              prefersReducedMotion
                                ? { duration: 0.1 }
                                : {
                                    type: "spring",
                                    stiffness: 140,
                                    damping: 16,
                                  }
                            }
                            className={cn(
                              "h-full border-r-2 border-[#18181B]",
                              isBuffed ? "bg-[#10B981]" : stat.barColor
                            )}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleActivateBuff}
                    disabled={isBuffed}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-center gap-2.5 border-2 border-[#18181B] px-5 py-3.5 font-archivo text-sm font-extrabold tracking-wide uppercase shadow-[4px_4px_0_#18181B] transition-transform sm:text-base",
                      isBuffed
                        ? "cursor-default bg-[#10B981] text-[#18181B]"
                        : "bg-[#F59E0B] text-[#18181B] hover:bg-[#fbbf24] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#18181B]"
                    )}
                  >
                    <Lightning size={18} weight="fill" aria-hidden="true" />
                    <span>
                      {isBuffed
                        ? "Buff Doa Aktif (Semua Stat 100% MAX!)"
                        : "Aktifkan Buff Doa (+25% Stats)"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Interactive CRT TV Channel-Switcher Album (CH-01 .. CH-05) */}
        <section className="border-b-2 border-[#18181B] bg-[#18181B] py-12 text-[#F4F1EA] sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-8">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1.5">
                <p className="font-mono text-xs font-bold tracking-widest text-[#F59E0B] uppercase">
                  VIDEO TAPE ARCHIVE // CH-01 - CH-
                  {formatChannelNumber(Math.max(0, memories.length - 1))}
                </p>
                <h2 className="font-archivo text-2xl font-extrabold tracking-tight text-[#F4F1EA] uppercase sm:text-4xl">
                  Album TV Tabung Kenangan
                </h2>
              </div>
              <p className="font-mono text-xs text-[#F4F1EA]/75 sm:text-sm">
                Pencet tombol channel buat gonta-ganti rekaman foto squad.
              </p>
            </div>

            {activeMemory && (
              <div className="border-2 border-[#F4F1EA] bg-[#27272A] p-4 shadow-[6px_6px_0_#10B981] sm:p-6">
                <div className="grid gap-6 lg:grid-cols-12">
                  {/* CRT Monitor Screen */}
                  <div className="border-2 border-[#18181B] bg-[#18181B] lg:col-span-8">
                    {/* Monitor Header Bar (channel badge INSIDE header bar, not floating over photo) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#18181B] bg-[#F4F1EA] px-3.5 py-2 font-mono text-xs font-bold text-[#18181B] uppercase">
                      <span className="inline-flex items-center gap-2">
                        <Television
                          size={16}
                          weight="fill"
                          aria-hidden="true"
                        />
                        <span>
                          CH-{formatChannelNumber(safeChannelIndex)} /{" "}
                          {formatChannelNumber(memories.length - 1)}
                        </span>
                      </span>
                      <span className="text-[#10B981]">VIDEO-IN // NTSC</span>
                    </div>

                    {/* CRT Bezel Image Frame */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#09090B]">
                      <img
                        src={activeMemory.imageUrl}
                        alt={activeMemory.caption}
                        className="h-full w-full object-cover"
                      />
                      {/* Subtle CRT Scanlines */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-20"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(0deg, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 1px, transparent 1px, transparent 4px)",
                        }}
                      />
                    </div>

                    {/* Caption Ticker Bar */}
                    <div className="flex flex-col justify-between gap-3 border-t-2 border-[#18181B] bg-[#F4F1EA] p-4 text-[#18181B] sm:flex-row sm:items-center">
                      <p className="font-mono text-xs leading-relaxed font-bold sm:text-sm">
                        {activeMemory.caption}
                      </p>
                      <button
                        type="button"
                        onClick={() => openLightbox(safeChannelIndex)}
                        className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 border-2 border-[#18181B] bg-[#F59E0B] px-3.5 py-2 font-mono text-xs font-bold text-[#18181B] uppercase shadow-[3px_3px_0_#18181B] transition-transform hover:bg-[#fbbf24] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_#18181B]"
                      >
                        <CornersOut
                          size={15}
                          weight="bold"
                          aria-hidden="true"
                        />
                        <span>Perbesar</span>
                      </button>
                    </div>
                  </div>

                  {/* CRT Control Panel: CH- / CH+ & Direct Channel Buttons */}
                  <div className="flex flex-col justify-between gap-5 border-2 border-[#18181B] bg-[#F4F1EA] p-4 text-[#18181B] shadow-[4px_4px_0_#18181B] sm:p-5 lg:col-span-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b-2 border-[#18181B] pb-2.5 font-mono text-xs font-bold uppercase">
                        <span>TUNER CONTROL</span>
                        <span className="text-[#10B981]">SIGNAL 100%</span>
                      </div>

                      {/* CH- / CH+ Rocker */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={handlePrevChannel}
                          aria-label="Channel sebelumnya"
                          className="inline-flex cursor-pointer items-center justify-center gap-1.5 border-2 border-[#18181B] bg-[#FFFFFF] px-3 py-3 font-archivo text-sm font-extrabold text-[#18181B] uppercase shadow-[4px_4px_0_#18181B] transition-transform hover:bg-[#F59E0B] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#18181B]"
                        >
                          <CaretLeft
                            size={16}
                            weight="bold"
                            aria-hidden="true"
                          />
                          <span>CH -</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleNextChannel}
                          aria-label="Channel berikutnya"
                          className="inline-flex cursor-pointer items-center justify-center gap-1.5 border-2 border-[#18181B] bg-[#10B981] px-3 py-3 font-archivo text-sm font-extrabold text-[#18181B] uppercase shadow-[4px_4px_0_#18181B] transition-transform hover:bg-[#34D399] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#18181B]"
                        >
                          <span>CH +</span>
                          <CaretRight
                            size={16}
                            weight="bold"
                            aria-hidden="true"
                          />
                        </button>
                      </div>

                      {/* Direct Numbered Channel Buttons 01..05 */}
                      <div className="space-y-2">
                        <p className="font-mono text-[11px] font-bold tracking-wider text-[#18181B]/70 uppercase">
                          PILIH CHANNEL LANGSUNG
                        </p>
                        <div className="grid grid-cols-5 gap-2">
                          {memories.map((memory, idx) => {
                            const isActive = idx === safeChannelIndex;
                            return (
                              <button
                                key={`${memory.imageUrl}-${idx}`}
                                type="button"
                                onClick={() => handleSelectChannel(idx)}
                                aria-label={`Pilih channel ${formatChannelNumber(idx)}`}
                                aria-pressed={isActive}
                                className={cn(
                                  "cursor-pointer border-2 border-[#18181B] py-2.5 font-mono text-xs font-bold tabular-nums transition-transform active:translate-x-[1px] active:translate-y-[1px]",
                                  isActive
                                    ? "bg-[#18181B] text-[#F59E0B] shadow-none"
                                    : "bg-[#FFFFFF] text-[#18181B] shadow-[2px_2px_0_#18181B] hover:bg-[#F59E0B]/30"
                                )}
                              >
                                {formatChannelNumber(idx)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Speaker Grille Visual Detail */}
                    <div className="space-y-2 border-t-2 border-dashed border-[#18181B]/30 pt-4">
                      <div className="flex items-center justify-between font-mono text-[11px] font-bold text-[#18181B]/75 uppercase">
                        <span>TAPE DECK</span>
                        <span>
                          {safeChannelIndex + 1} / {memories.length} LOADED
                        </span>
                      </div>
                      <div
                        aria-hidden="true"
                        className="grid grid-cols-8 gap-1.5"
                      >
                        {Array.from({ length: 16 }).map((_, slotIdx) => (
                          <span
                            key={slotIdx}
                            className="h-1.5 border border-[#18181B]/40 bg-[#18181B]/20"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Quest Log Level (wishChecklist) & Squad Leaderboard Wishes (friendWishes) */}
        <section className="border-b-2 border-[#18181B] bg-[#F4F1EA] py-12 sm:py-16">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-8 lg:grid-cols-12 lg:items-start">
            {/* Quest Log Level */}
            {wishChecklist.length > 0 && (
              <div className="space-y-5 lg:col-span-5">
                <div className="space-y-1.5">
                  <p className="font-mono text-xs font-bold tracking-wider text-[#10B981] uppercase">
                    QUEST LOG // LEVEL {data.turningAge}
                  </p>
                  <h2 className="font-archivo text-2xl font-extrabold tracking-tight text-[#18181B] uppercase sm:text-3xl">
                    Misi Tahun Baru
                  </h2>
                </div>

                {/* XP Progress Counter Box */}
                <div className="border-2 border-[#18181B] bg-[#FFFFFF] p-4 shadow-[4px_4px_0_#18181B]">
                  <div className="flex items-center justify-between font-mono text-xs font-bold uppercase">
                    <span>XP PROGRESS</span>
                    <span className="text-[#10B981] tabular-nums">
                      {earnedXp.toLocaleString("id-ID")} /{" "}
                      {totalXp.toLocaleString("id-ID")} XP
                    </span>
                  </div>
                  <div className="mt-2.5 h-4 w-full overflow-hidden border-2 border-[#18181B] bg-[#F4F1EA] p-0.5">
                    <motion.div
                      initial={false}
                      animate={{ width: `${xpPercent}%` }}
                      transition={
                        prefersReducedMotion
                          ? { duration: 0.1 }
                          : { type: "spring", stiffness: 160, damping: 18 }
                      }
                      className="h-full bg-[#10B981]"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between font-mono text-[11px] font-bold text-[#18181B]/70 uppercase">
                    <span>
                      {checkedQuests.length} / {wishChecklist.length} QUEST CLEAR
                    </span>
                    <span>+{XP_PER_QUEST} XP / QUEST</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {wishChecklist.map((quest, idx) => {
                    const isChecked = checkedQuests.includes(idx);
                    return (
                      <button
                        key={`${quest}-${idx}`}
                        type="button"
                        onClick={() => toggleQuest(idx)}
                        aria-pressed={isChecked}
                        className={cn(
                          "flex w-full cursor-pointer items-start gap-3.5 border-2 border-[#18181B] p-4 text-left shadow-[4px_4px_0_#18181B] transition-colors",
                          isChecked
                            ? "bg-[#10B981]/20"
                            : "bg-[#FFFFFF] hover:bg-[#F59E0B]/15"
                        )}
                      >
                        <span className="mt-0.5 shrink-0 text-[#18181B]">
                          {isChecked ? (
                            <CheckSquare
                              size={20}
                              weight="fill"
                              className="text-[#10B981]"
                              aria-hidden="true"
                            />
                          ) : (
                            <Square
                              size={20}
                              weight="bold"
                              aria-hidden="true"
                            />
                          )}
                        </span>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2 font-mono text-[11px] font-bold text-[#18181B]/65 uppercase">
                            <span>QUEST #{formatChannelNumber(idx)}</span>
                            <span>
                              {isChecked ? "CLEARED" : `+${XP_PER_QUEST} XP`}
                            </span>
                          </div>
                          <p
                            className={cn(
                              "text-sm leading-snug font-bold text-[#18181B] sm:text-base",
                              isChecked && "line-through opacity-75"
                            )}
                          >
                            {quest}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Squad Leaderboard Wishes */}
            <div
              className={cn(
                "space-y-5",
                wishChecklist.length > 0 ? "lg:col-span-7" : "lg:col-span-12"
              )}
            >
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="space-y-1.5">
                  <p className="font-mono text-xs font-bold tracking-wider text-[#F59E0B] uppercase">
                    HIGH SCORE // SQUAD WISHES
                  </p>
                  <h2 className="font-archivo text-2xl font-extrabold tracking-tight text-[#18181B] uppercase sm:text-3xl">
                    Papan Skor Ucapan Squad
                  </h2>
                </div>
                <div className="inline-flex items-center gap-1.5 border-2 border-[#18181B] bg-[#18181B] px-3 py-1.5 font-mono text-xs font-bold text-[#F59E0B] uppercase">
                  <Trophy size={15} weight="fill" aria-hidden="true" />
                  <span>TOP {friendWishes.length} PLAYERS</span>
                </div>
              </div>

              <div className="space-y-4">
                {friendWishes.map((wish, idx) => {
                  const scoreLabel =
                    LEADERBOARD_SCORES[idx] ??
                    `${Math.max(5000, 9999 - idx * 450).toLocaleString("id-ID")} PTS`;
                  const isTopRank = idx === 0;
                  return (
                    <article
                      key={`${wish.from}-${idx}`}
                      className="border-2 border-[#18181B] bg-[#FFFFFF] shadow-[4px_4px_0_#18181B]"
                    >
                      <div
                        className={cn(
                          "flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#18181B] px-4 py-2.5 font-mono text-xs font-bold uppercase",
                          isTopRank
                            ? "bg-[#F59E0B] text-[#18181B]"
                            : "bg-[#F4F1EA] text-[#18181B]"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="border-2 border-[#18181B] bg-[#18181B] px-2 py-0.5 text-[#F4F1EA] tabular-nums">
                            #{formatChannelNumber(idx)}
                          </span>
                          <span className="font-archivo text-sm font-extrabold">
                            {wish.from}
                          </span>
                          <span className="text-[#18181B]/75">
                            ({wish.role})
                          </span>
                        </div>
                        <span className="font-mono font-bold text-[#18181B] tabular-nums">
                          {scoreLabel}
                        </span>
                      </div>

                      <p className="p-4 text-sm leading-relaxed font-medium text-[#18181B] sm:p-5 sm:text-base">
                        &ldquo;{wish.message}&rdquo;
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Mixtape Cassette Strip & Closing Arcade Banner */}
        <section className="bg-[#F59E0B] py-12">
          <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-8">
            {data.playlistSong && (
              <div className="flex flex-col items-start justify-between gap-4 border-2 border-[#18181B] bg-[#F4F1EA] p-5 shadow-[4px_4px_0_#18181B] sm:flex-row sm:items-center sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-[#18181B] bg-[#10B981] text-[#18181B]">
                    <CassetteTape size={26} weight="fill" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-mono text-xs font-bold tracking-wider text-[#18181B]/70 uppercase">
                      SIDE A // MIXTAPE SOUNDTRACK
                    </p>
                    <p className="mt-0.5 font-archivo text-lg font-extrabold tracking-tight text-[#18181B]">
                      {data.playlistSong.title} - {data.playlistSong.artist}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-[#18181B]/80">
                  Play musiknya lewat tombol pojok kanan bawah
                </span>
              </div>
            )}

            <div className="flex flex-col items-start justify-between gap-6 border-2 border-[#18181B] bg-[#18181B] p-6 text-[#F4F1EA] shadow-[4px_4px_0_#10B981] sm:flex-row sm:items-center sm:p-8">
              <div className="space-y-2">
                <p className="font-mono text-xs font-bold tracking-widest text-[#10B981] uppercase">
                  GAME CLEAR // CONTINUE LEVEL {data.turningAge}
                </p>
                <h2 className="font-archivo text-2xl font-extrabold tracking-tight sm:text-4xl">
                  Gas terus di umur {data.turningAge}, {data.celebrantName}!
                </h2>
                <p className="max-w-2xl font-mono text-xs text-[#F4F1EA]/80 sm:text-sm">
                  Kado digital ini disusun oleh {data.senderName} spesial buat{" "}
                  {data.birthDateLabel}.
                </p>
              </div>

              <a
                href="#hero-profile"
                className="inline-flex shrink-0 items-center gap-2 border-2 border-[#18181B] bg-[#10B981] px-5 py-3 font-archivo text-sm font-extrabold text-[#18181B] uppercase shadow-[4px_4px_0_#F4F1EA] transition-transform hover:bg-[#34D399] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#F4F1EA]"
              >
                <ArrowUp size={18} weight="bold" aria-hidden="true" />
                <span>Balik ke Atas</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Subtle Footer */}
      <footer className="border-t-2 border-[#18181B] bg-[#F4F1EA] py-7">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 text-center sm:px-8">
          <Link
            href="/"
            className="font-mono text-xs font-bold text-[#18181B]/75 underline decoration-2 underline-offset-4 transition-colors hover:text-[#10B981]"
          >
            Dibuat dengan KatalogWeb
          </Link>
        </div>
      </footer>

      {/* Animated Lightbox Modal */}
      <AnimatePresence>
        {activeLightboxMemory && lightboxIndex !== null && (
          <motion.div
            key="retro-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label={`Channel ${formatChannelNumber(lightboxIndex)} dari ${memories.length}`}
            className={cn(
              "inset-0 z-50 flex items-center justify-center bg-[#18181B]/85 p-4 sm:p-6",
              embedded ? "absolute" : "fixed"
            )}
          >
            <motion.div
              initial={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 0, scale: 0.94, y: 10 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.96, y: 8 }
              }
              transition={{ duration: 0.18 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-3xl overflow-hidden border-2 border-[#18181B] bg-[#F4F1EA] shadow-[6px_6px_0_#10B981]"
            >
              <div className="flex items-center justify-between gap-3 border-b-2 border-[#18181B] bg-[#F59E0B] px-4 py-3">
                <span className="font-mono text-xs font-bold tracking-wider text-[#18181B] uppercase tabular-nums sm:text-sm">
                  CH-{formatChannelNumber(lightboxIndex)} /{" "}
                  {formatChannelNumber(memories.length - 1)}
                </span>
                <button
                  type="button"
                  onClick={closeLightbox}
                  className="inline-flex cursor-pointer items-center gap-1.5 border-2 border-[#18181B] bg-[#FFFFFF] px-3 py-1 font-mono text-xs font-bold text-[#18181B] uppercase shadow-[2px_2px_0_#18181B] hover:bg-[#18181B] hover:text-[#F4F1EA]"
                >
                  <X size={14} weight="bold" aria-hidden="true" />
                  <span>Tutup</span>
                </button>
              </div>

              <div className="relative bg-[#18181B]">
                <img
                  src={activeLightboxMemory.imageUrl}
                  alt={activeLightboxMemory.caption}
                  className="max-h-[68dvh] w-full object-contain"
                />
              </div>

              <div className="flex flex-col gap-4 border-t-2 border-[#18181B] bg-[#F4F1EA] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="font-mono text-xs leading-snug font-bold text-[#18181B] sm:text-sm">
                  {activeLightboxMemory.caption}
                </p>

                {memories.length > 1 && (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={showPrevLightbox}
                      className="inline-flex cursor-pointer items-center gap-1 border-2 border-[#18181B] bg-[#FFFFFF] px-3 py-1.5 font-mono text-xs font-bold text-[#18181B] uppercase shadow-[2px_2px_0_#18181B] hover:bg-[#F59E0B]"
                    >
                      <CaretLeft size={14} weight="bold" aria-hidden="true" />
                      <span>CH -</span>
                    </button>
                    <button
                      type="button"
                      onClick={showNextLightbox}
                      className="inline-flex cursor-pointer items-center gap-1 border-2 border-[#18181B] bg-[#10B981] px-3 py-1.5 font-mono text-xs font-bold text-[#18181B] uppercase shadow-[2px_2px_0_#18181B] hover:bg-[#34D399]"
                    >
                      <span>CH +</span>
                      <CaretRight size={14} weight="bold" aria-hidden="true" />
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

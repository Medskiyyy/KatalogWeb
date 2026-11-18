"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react";
import {
  ArrowCounterClockwise,
  Camera,
  CaretLeft,
  CaretRight,
  Check,
  EnvelopeOpen,
  EnvelopeSimple,
  MusicNote,
  Quotes,
  X,
} from "@phosphor-icons/react";
import { MusicPlayer } from "@/components/MusicPlayer";
import type { UltahSiteConfig } from "@/lib/schema";
import { playSfx } from "@/lib/sfx";
import { cn } from "@/lib/utils";

function padTwo(value: number): string {
  return String(value).padStart(2, "0");
}

export function UltahEditorialTemplate({
  site,
  embedded = false,
}: {
  site: UltahSiteConfig;
  embedded?: boolean;
}) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const { data } = site;

  const [isOpened, setIsOpened] = useState(embedded);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [checkedReflections, setCheckedReflections] = useState<
    Record<number, boolean>
  >({});
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { scrollYProgress } = useScroll();
  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 30,
    restDelta: 0.001,
  });

  const memories = data.memories;
  const friendWishes = data.friendWishes;
  const wishChecklist = data.wishChecklist ?? [];
  const heroPortraitSrc =
    data.cakeImageUrl ||
    memories[0]?.imageUrl ||
    "/demo/ultah-editorial-hero.webp";

  const totalMemories = memories.length;
  const flippedCount = friendWishes.filter(
    (_, idx) => Boolean(flippedCards[idx])
  ).length;
  const allCardsFlipped =
    friendWishes.length > 0 && flippedCount === friendWishes.length;
  const checkedCount = wishChecklist.filter(
    (_, idx) => Boolean(checkedReflections[idx])
  ).length;

  useEffect(() => {
    const urls = new Set<string>();
    if (heroPortraitSrc) urls.add(heroPortraitSrc);
    memories.forEach((memory) => {
      if (memory.imageUrl) urls.add(memory.imageUrl);
    });
    urls.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, [heroPortraitSrc, memories]);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const goPrevPhoto = useCallback(() => {
    if (totalMemories <= 1) return;
    playSfx("camera-shutter");
    setLightboxIndex((prev) =>
      prev === null ? 0 : (prev - 1 + totalMemories) % totalMemories
    );
  }, [totalMemories]);

  const goNextPhoto = useCallback(() => {
    if (totalMemories <= 1) return;
    playSfx("camera-shutter");
    setLightboxIndex((prev) =>
      prev === null ? 0 : (prev + 1) % totalMemories
    );
  }, [totalMemories]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
      } else if (event.key === "ArrowLeft") {
        goPrevPhoto();
      } else if (event.key === "ArrowRight") {
        goNextPhoto();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeLightbox, goNextPhoto, goPrevPhoto, lightboxIndex]);

  const handleOpenJournal = () => {
    playSfx("paper-flip");
    setIsOpened(true);
  };

  const handleToggleCard = (index: number) => {
    playSfx("paper-flip");
    setFlippedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleFlipAllCards = () => {
    playSfx("paper-flip");
    if (allCardsFlipped) {
      setFlippedCards({});
      return;
    }
    const nextState: Record<number, boolean> = {};
    friendWishes.forEach((_, idx) => {
      nextState[idx] = true;
    });
    setFlippedCards(nextState);
  };

  const handleToggleReflection = (index: number) => {
    playSfx("quiz-ding");
    setCheckedReflections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleOpenLightbox = (index: number) => {
    playSfx("camera-shutter");
    setLightboxIndex(index);
  };

  const sectionInitial =
    prefersReducedMotion || embedded ? false : { opacity: 1, y: 14 };
  const activeLightboxMemory =
    lightboxIndex !== null ? (memories[lightboxIndex] ?? null) : null;

  return (
    <div
      className={cn(
        "relative w-full bg-[#FFFFFF] font-jakarta text-[#1C1917] selection:bg-[#FDF2F8] selection:text-[#9D174D]",
        embedded
          ? isOpened
            ? "min-h-[760px]"
            : "h-[760px] overflow-hidden"
          : isOpened
            ? "min-h-[100dvh]"
            : "h-[100dvh] overflow-hidden"
      )}
    >
      {/* Top Berry Reading Progress Bar */}
      {isOpened && (
        <motion.div
          aria-hidden="true"
          style={{
            scaleX: prefersReducedMotion ? scrollYProgress : smoothScrollProgress,
          }}
          className="pointer-events-none fixed top-0 right-0 left-0 z-40 h-[3px] origin-left bg-[#9D174D]"
        />
      )}

      {/* Silk-Ribbon Envelope Cover */}
      <AnimatePresence>
        {!isOpened && (
          <motion.div
            key="editorial-envelope-cover"
            initial={{ opacity: 1 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0, transition: { duration: 0.15 } }
                : {
                    opacity: 0,
                    y: -20,
                    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                  }
            }
            className={cn(
              "inset-0 z-30 flex items-center justify-center overflow-y-auto bg-[#FDF2F8] px-4 py-8",
              embedded ? "absolute" : "fixed"
            )}
          >
            <div className="relative w-full max-w-xl border border-[#9D174D]/45 bg-[#FFFFFF] p-7 shadow-[0_24px_60px_-28px_rgba(157,23,77,0.24)] sm:p-12">
              {/* Subtle Silk-Ribbon Cross Lines */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-1/2 h-[1px] -translate-y-1/2 bg-[#9D174D]/12"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-1/2 w-[1px] -translate-x-1/2 bg-[#9D174D]/12"
              />

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="flex w-full items-center justify-between border-b border-[#9D174D]/20 pb-3 text-[11px] font-medium tracking-[0.2em] text-[#78716C] uppercase">
                  <span>Jurnal Ulang Tahun</span>
                  <span className="text-[#9D174D]">
                    Edisi ke-{padTwo(data.turningAge)}
                  </span>
                </div>

                {/* Crimson Wax / Silk Seal */}
                <div className="mt-8 flex h-14 w-14 items-center justify-center rounded-full border border-[#9D174D] bg-[#FDF2F8] text-[#9D174D]">
                  <EnvelopeSimple size={24} weight="regular" />
                </div>

                <p className="mt-6 text-xs font-medium tracking-[0.2em] text-[#78716C] uppercase">
                  {data.birthDateLabel}
                </p>

                <h1 className="font-serif-editorial mt-3 text-4xl leading-[1.08] font-medium italic text-[#1C1917] sm:text-5xl">
                  Untuk {data.celebrantName}
                </h1>

                <p className="mt-4 max-w-md text-sm leading-relaxed text-[#78716C] sm:text-[15px]">
                  Sebuah catatan tenang berisi doa, potret kenangan, dan
                  harapan baik di usia yang ke-{data.turningAge}. Disusun oleh{" "}
                  <span className="font-medium text-[#1C1917]">
                    {data.senderName}
                  </span>
                  .
                </p>

                <button
                  type="button"
                  onClick={handleOpenJournal}
                  className="mt-8 inline-flex items-center gap-2.5 border border-[#9D174D] bg-[#9D174D] px-7 py-3.5 text-xs font-semibold tracking-[0.16em] text-[#FFFFFF] uppercase transition-colors hover:bg-[#831843] active:scale-[0.99]"
                >
                  <EnvelopeOpen size={16} weight="regular" />
                  <span>Buka Jurnal Ucapan</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Editorial Journal */}
      <div className="relative">
        {/* Top Masthead Strip */}
        <header className="border-b border-[#1C1917]/10 bg-[#FFFFFF]">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 text-[11px] font-medium tracking-[0.2em] text-[#78716C] uppercase sm:px-8">
            <span className="text-[#9D174D]">
              Jurnal Sweet Birthday - {data.celebrantName}
            </span>
            <span>{data.birthDateLabel}</span>
          </div>
        </header>

        <main>
          {/* 1. Asymmetric Editorial Hero */}
          <motion.section
            aria-labelledby="editorial-hero-heading"
            initial={sectionInitial}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: "some" }}
            transition={{ duration: 0.45 }}
            className="border-b border-[#1C1917]/10 bg-[#FFFFFF]"
          >
            <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-12 lg:gap-14 lg:py-20">
              {/* Left Column: Letter & Ledger */}
              <div className="lg:col-span-7">
                <p className="text-xs font-semibold tracking-[0.22em] text-[#9D174D] uppercase">
                  Surat Pembuka Usia Baru
                </p>

                <h1
                  id="editorial-hero-heading"
                  className="font-serif-editorial mt-4 text-4xl leading-[1.06] font-medium italic text-[#1C1917] sm:text-5xl lg:text-6xl"
                >
                  Selamat Ulang Tahun ke-{data.turningAge}, {data.celebrantName}
                  .
                </h1>

                <div className="mt-8 border-l-2 border-[#9D174D]/55 pl-5 sm:pl-6">
                  <p className="text-base leading-relaxed text-[#1C1917]/90 sm:text-lg sm:leading-relaxed">
                    {data.heroWish}
                  </p>
                </div>

                {/* Minimalist Age Milestone Ledger */}
                <div className="mt-10 border-t border-b border-[#1C1917]/12 bg-[#FDF2F8]/55">
                  <div className="grid grid-cols-1 divide-y divide-[#1C1917]/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    <div className="px-4 py-4">
                      <p className="text-[10px] font-semibold tracking-[0.18em] text-[#78716C] uppercase">
                        Bab Usia
                      </p>
                      <p className="font-serif-editorial mt-1 text-2xl font-medium text-[#9D174D]">
                        {data.turningAge} Tahun Perjalanan
                      </p>
                    </div>
                    <div className="px-4 py-4">
                      <p className="text-[10px] font-semibold tracking-[0.18em] text-[#78716C] uppercase">
                        Hari Perayaan
                      </p>
                      <p className="mt-1.5 text-sm font-medium text-[#1C1917]">
                        {data.birthDateLabel}
                      </p>
                    </div>
                    <div className="px-4 py-4">
                      <p className="text-[10px] font-semibold tracking-[0.18em] text-[#78716C] uppercase">
                        Dari
                      </p>
                      <p className="mt-1.5 text-sm font-medium text-[#1C1917]">
                        {data.senderName}
                      </p>
                    </div>
                  </div>
                </div>

                {data.playlistSong && (
                  <div className="mt-5 flex items-center gap-2.5 text-xs text-[#78716C]">
                    <MusicNote
                      size={15}
                      weight="regular"
                      className="shrink-0 text-[#9D174D]"
                    />
                    <span>
                      Alunan pengiring:{" "}
                      <span className="font-medium text-[#1C1917]">
                        {data.playlistSong.title}
                      </span>{" "}
                      - {data.playlistSong.artist}
                    </span>
                  </div>
                )}
              </div>

              {/* Right Column: Framed Portrait Still-Life */}
              <div className="lg:col-span-5">
                <figure className="border border-[#9D174D]/25 bg-[#FDF2F8] p-4 sm:p-5">
                  <div className="aspect-[3/4] w-full overflow-hidden border border-[#1C1917]/10 bg-[#FFFFFF]">
                    <img
                      src={heroPortraitSrc}
                      alt={`Potret perayaan ulang tahun ke-${data.turningAge} ${data.celebrantName}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <figcaption className="mt-3.5 flex items-center justify-between gap-3 text-xs text-[#78716C]">
                    <span className="font-serif-editorial text-base italic text-[#1C1917]">
                      Arsip Ulang Tahun {data.celebrantName}
                    </span>
                    <span className="tabular-nums tracking-[0.15em] uppercase">
                      No. {padTwo(data.turningAge)}
                    </span>
                  </figcaption>
                </figure>
              </div>
            </div>
          </motion.section>

          {/* 2. Interactive 3D Flip Kartu Doa & Harapan */}
          <motion.section
            aria-labelledby="kartu-doa-heading"
            initial={sectionInitial}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: "some" }}
            transition={{ duration: 0.45 }}
            className="border-b border-[#1C1917]/10 bg-[#FDF2F8]/60"
          >
            <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
              <div className="flex flex-col justify-between gap-6 border-b border-[#9D174D]/20 pb-8 md:flex-row md:items-end">
                <div>
                  <p className="text-xs font-semibold tracking-[0.22em] text-[#9D174D] uppercase">
                    Titipan Kata Hangat
                  </p>
                  <h2
                    id="kartu-doa-heading"
                    className="font-serif-editorial mt-2 text-3xl font-medium italic text-[#1C1917] sm:text-4xl"
                  >
                    Kartu Doa &amp; Harapan
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#78716C]">
                    Setiap amplop kecil menyimpan pesan tulus. Ketuk kartu satu
                    per satu untuk membalik dan membaca isinya.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="tabular-nums text-xs font-medium text-[#78716C]">
                    {flippedCount} / {friendWishes.length} terbuka
                  </span>
                  <button
                    type="button"
                    onClick={handleFlipAllCards}
                    className="inline-flex items-center gap-2 border border-[#9D174D] bg-[#FFFFFF] px-4 py-2.5 text-xs font-semibold tracking-[0.12em] text-[#9D174D] uppercase transition-colors hover:bg-[#9D174D] hover:text-[#FFFFFF]"
                  >
                    {allCardsFlipped ? (
                      <>
                        <ArrowCounterClockwise size={14} weight="bold" />
                        <span>Tutup Semua Kartu</span>
                      </>
                    ) : (
                      <>
                        <EnvelopeOpen size={14} weight="regular" />
                        <span>Buka Semua Kartu</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
                {friendWishes.map((wish, idx) => {
                  const isFlipped = Boolean(flippedCards[idx]);
                  return (
                    <div
                      key={`${wish.from}-${idx}`}
                      style={{ perspective: "1200px" }}
                      className="w-full"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleCard(idx)}
                        aria-pressed={isFlipped}
                        aria-label={
                          isFlipped
                            ? `Tutup kartu doa dari ${wish.from}`
                            : `Buka kartu doa dari ${wish.from}`
                        }
                        className="group block w-full cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9D174D]"
                      >
                        <motion.div
                          animate={{ rotateY: isFlipped ? 180 : 0 }}
                          transition={
                            prefersReducedMotion
                              ? { duration: 0.1 }
                              : { type: "spring", stiffness: 210, damping: 24 }
                          }
                          style={{ transformStyle: "preserve-3d" }}
                          className="grid w-full"
                        >
                          {/* Front Cover Face */}
                          <div
                            style={{
                              backfaceVisibility: "hidden",
                              WebkitBackfaceVisibility: "hidden",
                              transform: "rotateY(0deg)",
                            }}
                            className="col-start-1 row-start-1 flex min-h-[260px] flex-col justify-between border border-[#9D174D]/30 bg-[#FFFFFF] p-7 transition-colors group-hover:border-[#9D174D]/70 sm:p-8"
                          >
                            <div className="flex items-center justify-between border-b border-[#9D174D]/15 pb-3">
                              <span className="tabular-nums text-[11px] font-semibold tracking-[0.2em] text-[#9D174D] uppercase">
                                Kartu {padTwo(idx + 1)}
                              </span>
                              <EnvelopeSimple
                                size={18}
                                weight="regular"
                                className="text-[#9D174D]"
                              />
                            </div>

                            <div className="my-6">
                              <p className="font-serif-editorial text-2xl leading-snug font-medium text-[#1C1917] sm:text-[26px]">
                                Titipan Doa dari {wish.from} - {wish.role} -
                                Ketuk buat baca
                              </p>
                            </div>

                            <div className="flex items-center justify-between text-xs text-[#78716C]">
                              <span className="border-b border-[#9D174D]/35 pb-0.5 font-medium text-[#9D174D]">
                                Buka kartu ucapan
                              </span>
                              <span>{wish.role}</span>
                            </div>
                          </div>

                          {/* Back Quote Face */}
                          <div
                            style={{
                              backfaceVisibility: "hidden",
                              WebkitBackfaceVisibility: "hidden",
                              transform: "rotateY(180deg)",
                            }}
                            className="col-start-1 row-start-1 flex min-h-[260px] flex-col justify-between border border-[#9D174D] bg-[#FDF2F8] p-7 shadow-[0_18px_40px_-24px_rgba(157,23,77,0.28)] sm:p-8"
                          >
                            <div className="flex items-center justify-between border-b border-[#9D174D]/20 pb-3">
                              <Quotes
                                size={20}
                                weight="fill"
                                className="text-[#9D174D]"
                              />
                              <span className="text-[11px] font-medium tracking-[0.16em] text-[#78716C] uppercase">
                                {wish.role}
                              </span>
                            </div>

                            <p className="my-5 text-[15px] leading-relaxed text-[#1C1917] sm:text-base sm:leading-relaxed">
                              &ldquo;{wish.message}&rdquo;
                            </p>

                            <div className="flex items-center justify-between border-t border-[#9D174D]/20 pt-3">
                              <span className="font-serif-editorial text-xl font-medium italic text-[#9D174D]">
                                {wish.from}
                              </span>
                              <span className="text-[11px] text-[#78716C]">
                                Ketuk untuk tutup
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.section>

          {/* 3. Asymmetric Museum Gallery */}
          <motion.section
            aria-labelledby="galeri-kenangan-heading"
            initial={sectionInitial}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: "some" }}
            transition={{ duration: 0.45 }}
            className="border-b border-[#1C1917]/10 bg-[#FFFFFF]"
          >
            <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
              <div className="flex flex-col justify-between gap-4 border-b border-[#1C1917]/10 pb-8 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-semibold tracking-[0.22em] text-[#9D174D] uppercase">
                    Galeri Kenangan
                  </p>
                  <h2
                    id="galeri-kenangan-heading"
                    className="font-serif-editorial mt-2 text-3xl font-medium italic text-[#1C1917] sm:text-4xl"
                  >
                    Potret yang Tersimpan
                  </h2>
                </div>
                <p className="flex items-center gap-2 text-xs text-[#78716C]">
                  <Camera size={15} weight="regular" className="text-[#9D174D]" />
                  <span>Ketuk foto untuk memperbesar di layar penuh</span>
                </p>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-7">
                {memories.map((memory, idx) => {
                  const spanClass =
                    idx === 0
                      ? "md:col-span-7"
                      : idx === 1
                        ? "md:col-span-5"
                        : idx % 2 === 0
                          ? "md:col-span-5"
                          : "md:col-span-7";
                  const aspectClass =
                    idx === 0
                      ? "aspect-[4/3]"
                      : idx === 1
                        ? "aspect-[4/5] md:aspect-[4/4]"
                        : "aspect-[4/3]";

                  return (
                    <figure
                      key={`${memory.imageUrl}-${idx}`}
                      className={cn(
                        "flex flex-col border border-[#1C1917]/12 bg-[#FFFFFF] p-3.5 transition-colors hover:border-[#9D174D]/50 sm:p-4",
                        spanClass
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenLightbox(idx)}
                        aria-label={`Lihat foto: ${memory.caption}`}
                        className={cn(
                          "group relative w-full overflow-hidden bg-[#FDF2F8] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9D174D]",
                          aspectClass
                        )}
                      >
                        <img
                          src={memory.imageUrl}
                          alt={memory.caption}
                          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                        />
                      </button>

                      <figcaption className="mt-3.5 flex items-baseline justify-between gap-4 border-t border-[#1C1917]/8 pt-3">
                        <span className="text-sm leading-relaxed text-[#1C1917]">
                          {memory.caption}
                        </span>
                        <span className="shrink-0 tabular-nums text-[11px] font-medium tracking-[0.15em] text-[#78716C] uppercase">
                          Arsip {padTwo(idx + 1)}
                        </span>
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
            </div>
          </motion.section>

          {/* 4. Interactive Refleksi & Resolusi Pribadi */}
          {wishChecklist.length > 0 && (
            <motion.section
              aria-labelledby="refleksi-heading"
              initial={sectionInitial}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: "some" }}
              transition={{ duration: 0.45 }}
              className="border-b border-[#1C1917]/10 bg-[#FDF2F8]/45"
            >
              <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
                <div className="flex flex-col justify-between gap-4 border-b border-[#9D174D]/20 pb-6 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.22em] text-[#9D174D] uppercase">
                      Catatan Tahun Baru
                    </p>
                    <h2
                      id="refleksi-heading"
                      className="font-serif-editorial mt-2 text-3xl font-medium italic text-[#1C1917] sm:text-4xl"
                    >
                      Refleksi &amp; Resolusi Pribadi
                    </h2>
                  </div>

                  <span className="tabular-nums text-xs font-medium text-[#78716C]">
                    {checkedCount} dari {wishChecklist.length} refleksi ditandai
                  </span>
                </div>

                <div className="mt-8 divide-y divide-[#9D174D]/15 border-t border-b border-[#9D174D]/15 bg-[#FFFFFF]">
                  {wishChecklist.map((item, idx) => {
                    const isChecked = Boolean(checkedReflections[idx]);
                    return (
                      <div key={`${item}-${idx}`} className="px-5 py-4 sm:px-7 sm:py-5">
                        <button
                          type="button"
                          onClick={() => handleToggleReflection(idx)}
                          aria-pressed={isChecked}
                          className="flex w-full items-start gap-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9D174D]"
                        >
                          <span
                            className={cn(
                              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border transition-colors",
                              isChecked
                                ? "border-[#9D174D] bg-[#9D174D] text-[#FFFFFF]"
                                : "border-[#1C1917]/30 bg-[#FFFFFF] text-transparent"
                            )}
                          >
                            <Check size={12} weight="bold" />
                          </span>

                          <div className="flex-1">
                            <span
                              className={cn(
                                "relative inline-block text-base leading-relaxed transition-colors sm:text-[17px]",
                                isChecked
                                  ? "font-medium text-[#9D174D]"
                                  : "text-[#1C1917]"
                              )}
                            >
                              {item}
                              <motion.span
                                aria-hidden="true"
                                initial={false}
                                animate={{ scaleX: isChecked ? 1 : 0 }}
                                transition={
                                  prefersReducedMotion
                                    ? { duration: 0.1 }
                                    : {
                                        duration: 0.28,
                                        ease: [0.22, 1, 0.36, 1],
                                      }
                                }
                                className="absolute right-0 -bottom-0.5 left-0 h-[1.5px] origin-left bg-[#9D174D]/70"
                              />
                            </span>

                            <AnimatePresence initial={false}>
                              {isChecked && (
                                <motion.p
                                  initial={
                                    prefersReducedMotion
                                      ? { opacity: 1 }
                                      : { opacity: 0, height: 0 }
                                  }
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={
                                    prefersReducedMotion
                                      ? { opacity: 0 }
                                      : { opacity: 0, height: 0 }
                                  }
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden pt-2 text-xs text-[#78716C]"
                                >
                                  Ditandai sebagai pengingat pribadi di usia
                                  ke-{data.turningAge}.
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>

                          <span className="shrink-0 tabular-nums text-[11px] font-medium text-[#78716C]">
                            {padTwo(idx + 1)}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.section>
          )}
        </main>

        {/* Quiet Editorial Footer */}
        <footer className="bg-[#FFFFFF] px-5 py-10 text-center sm:px-8">
          <div className="mx-auto max-w-2xl">
            <p className="font-serif-editorial text-2xl italic text-[#1C1917]">
              Selamat bertumbuh dengan tenang, {data.celebrantName}.
            </p>
            <p className="mt-2 text-xs tracking-[0.16em] text-[#78716C] uppercase">
              {data.senderName} - {data.birthDateLabel}
            </p>
            <div className="mt-6 border-t border-[#1C1917]/10 pt-5">
              <Link
                href="/"
                className="inline-flex items-center text-[11px] font-medium tracking-[0.16em] text-[#78716C] uppercase transition-colors hover:text-[#9D174D]"
              >
                Dibuat dengan KatalogWeb
              </Link>
            </div>
          </div>
        </footer>
      </div>

      <MusicPlayer
        track={site.musicTrack}
        autoPlayTrigger={isOpened}
        className={embedded ? "!absolute" : ""}
      />

      {/* Lightbox */}
      <AnimatePresence>
        {activeLightboxMemory && lightboxIndex !== null && (
          <motion.div
            key="editorial-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label="Detail foto kenangan"
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/85 p-4"
          >
            <motion.div
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.97 }
              }
              animate={{ opacity: 1, scale: 1 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.97 }
              }
              transition={{ duration: 0.18 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-3xl border border-[#9D174D]/35 bg-[#FFFFFF] p-4 sm:p-6"
            >
              <div className="mb-4 flex items-center justify-between border-b border-[#1C1917]/12 pb-3">
                <span className="tabular-nums text-xs font-semibold tracking-[0.16em] text-[#9D174D] uppercase">
                  Arsip {padTwo(lightboxIndex + 1)} / {padTwo(totalMemories)}
                </span>
                <button
                  type="button"
                  onClick={closeLightbox}
                  aria-label="Tutup foto"
                  className="inline-flex h-8 w-8 items-center justify-center border border-[#1C1917]/20 text-[#1C1917] transition-colors hover:border-[#9D174D] hover:text-[#9D174D]"
                >
                  <X size={16} weight="bold" />
                </button>
              </div>

              <div className="flex max-h-[65dvh] items-center justify-center border border-[#1C1917]/10 bg-[#FDF2F8]/50">
                <img
                  src={activeLightboxMemory.imageUrl}
                  alt={activeLightboxMemory.caption}
                  className="max-h-[65dvh] w-full object-contain"
                />
              </div>

              <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <p className="font-serif-editorial text-xl italic text-[#1C1917] sm:text-2xl">
                  {activeLightboxMemory.caption}
                </p>

                {totalMemories > 1 && (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={goPrevPhoto}
                      aria-label="Foto sebelumnya"
                      className="inline-flex items-center gap-1.5 border border-[#1C1917]/20 bg-[#FFFFFF] px-3.5 py-2 text-xs font-semibold tracking-[0.1em] text-[#1C1917] uppercase transition-colors hover:border-[#9D174D] hover:text-[#9D174D]"
                    >
                      <CaretLeft size={14} weight="bold" />
                      <span>Prev</span>
                    </button>
                    <button
                      type="button"
                      onClick={goNextPhoto}
                      aria-label="Foto berikutnya"
                      className="inline-flex items-center gap-1.5 border border-[#9D174D] bg-[#9D174D] px-3.5 py-2 text-xs font-semibold tracking-[0.1em] text-[#FFFFFF] uppercase transition-colors hover:bg-[#831843]"
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

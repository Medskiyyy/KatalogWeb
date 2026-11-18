"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowCounterClockwise,
  ArrowUp,
  Balloon,
  Camera,
  CaretLeft,
  CaretRight,
  Check,
  CheckCircle,
  Circle,
  Confetti,
  Hourglass,
  Lock,
  LockOpen,
  MusicNotes,
  Plus,
  Quotes,
  X,
} from "@phosphor-icons/react";
import { MusicPlayer } from "@/components/MusicPlayer";
import type { UltahSiteConfig } from "@/lib/schema";
import { playSfx } from "@/lib/sfx";
import { cn } from "@/lib/utils";

interface BalloonTheme {
  id: string;
  label: string;
  fill: string;
  highlight: string;
  shade: string;
  accentBorder: string;
  accentBg: string;
  accentText: string;
}

const BALLOON_THEMES: BalloonTheme[] = [
  {
    id: "sky",
    label: "Balon Biru Langit",
    fill: "#38BDF8",
    highlight: "#BAE6FD",
    shade: "#0284C7",
    accentBorder: "border-[#2563EB]/30",
    accentBg: "bg-[#EFF6FF]",
    accentText: "text-[#2563EB]",
  },
  {
    id: "coral",
    label: "Balon Coral Rose",
    fill: "#FB7185",
    highlight: "#FECDD3",
    shade: "#E11D48",
    accentBorder: "border-[#F43F5E]/30",
    accentBg: "bg-[#FFF1F2]",
    accentText: "text-[#F43F5E]",
  },
  {
    id: "amber",
    label: "Balon Sunshine",
    fill: "#FBBF24",
    highlight: "#FDE68A",
    shade: "#D97706",
    accentBorder: "border-[#F59E0B]/35",
    accentBg: "bg-[#FFFBEB]",
    accentText: "text-[#D97706]",
  },
  {
    id: "mint",
    label: "Balon Mint Segar",
    fill: "#34D399",
    highlight: "#A7F3D0",
    shade: "#059669",
    accentBorder: "border-[#10B981]/30",
    accentBg: "bg-[#ECFDF5]",
    accentText: "text-[#059669]",
  },
  {
    id: "indigo",
    label: "Balon Indigo Cerah",
    fill: "#818CF8",
    highlight: "#C7D2FE",
    shade: "#4F46E5",
    accentBorder: "border-[#6366F1]/30",
    accentBg: "bg-[#EEF2FF]",
    accentText: "text-[#4F46E5]",
  },
];

const POLAROID_TILTS = [
  "-rotate-2",
  "rotate-1",
  "-rotate-1",
  "rotate-2",
  "-rotate-1",
];

const CLOTHESPIN_COLORS = [
  "bg-[#2563EB]",
  "bg-[#F43F5E]",
  "bg-[#F59E0B]",
  "bg-[#10B981]",
  "bg-[#6366F1]",
];

const WISH_TAPE_COLORS = [
  "bg-[#2563EB]",
  "bg-[#F43F5E]",
  "bg-[#F59E0B]",
  "bg-[#10B981]",
  "bg-[#6366F1]",
];

function buildRoastFacts(name: string, age: number) {
  return [
    {
      title: "Status 'OTW' Legendaris",
      fact: `Fakta resmi: kalau ${name} bilang 'udah di jalan', kemungkinan besar masih pilih baju atau baru nyari kunci.`,
    },
    {
      title: "Kolektor Tab Browser",
      fact: `Di usia ${age}, ${name} masih setia buka puluhan tab sekaligus tapi ujungnya lupa tadi mau nyari apa.`,
    },
    {
      title: "Duta Jajan Dadakan",
      fact: `Bilangnya lagi hemat buat masa depan, tapi begitu ada yang ngajak ngopi sore, ${name} selalu paling depan.`,
    },
    {
      title: "Paling Rame di Tongkrongan",
      fact: `Tanpa kehadiran ${name}, grup chat mendadak sepi dan obrolan nongkrong kurang satu suara tawa paling khas.`,
    },
    {
      title: `Mode Dewasa Usia ${age}`,
      fact: `Resmi masuk umur ${age} artinya makin jago ngatur hidup, walau kadang tetap butuh pelukan dan camilan manis.`,
    },
  ];
}

function PastelBalloonSvg({
  fill,
  highlight,
  shade,
  className,
}: {
  fill: string;
  highlight: string;
  shade: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 155"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M50 104 Q44 120 52 134 Q57 143 48 153"
        stroke="#94A3B8"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <polygon points="45,104 55,104 50,96" fill={shade} />
      <ellipse cx="50" cy="50" rx="36" ry="46" fill={fill} />
      <ellipse
        cx="36"
        cy="34"
        rx="10"
        ry="17"
        transform="rotate(-18 36 34)"
        fill={highlight}
        opacity="0.72"
      />
      <circle cx="30" cy="56" r="3.5" fill={highlight} opacity="0.65" />
    </svg>
  );
}

export function UltahBalonTemplate({
  site,
  embedded = false,
}: {
  site: UltahSiteConfig;
  embedded?: boolean;
}) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const { data } = site;

  const [isOpened, setIsOpened] = useState(embedded);
  const [poppedIndices, setPoppedIndices] = useState<number[]>([]);
  const [checkedWishes, setCheckedWishes] = useState<number[]>([]);
  const [secretWishInput, setSecretWishInput] = useState("");
  const [savedSecretWish, setSavedSecretWish] = useState<string | null>(null);
  const [isCapsuleLocked, setIsCapsuleLocked] = useState(false);
  const [capsuleSealKey, setCapsuleSealKey] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const cheerTimerRef = useRef<number | null>(null);

  const memories = data.memories;
  const friendWishes = data.friendWishes;
  const wishChecklist = data.wishChecklist ?? [];
  const heroPhotoUrl = data.cakeImageUrl || "/demo/ultah-balon-hero.webp";
  const roastFacts = buildRoastFacts(data.celebrantName, data.turningAge);
  const allBalloonsPopped = poppedIndices.length === BALLOON_THEMES.length;

  useEffect(() => {
    data.memories.forEach((memory) => {
      const img = new window.Image();
      img.src = memory.imageUrl;
    });
  }, [data.memories]);

  useEffect(() => {
    return () => {
      if (cheerTimerRef.current !== null) {
        window.clearTimeout(cheerTimerRef.current);
      }
    };
  }, []);

  const handleOpenParty = useCallback(() => {
    playSfx("party-cheer");
    setIsOpened(true);
  }, []);

  const handlePopBalloon = useCallback(
    (index: number) => {
      if (poppedIndices.includes(index)) return;
      const next = [...poppedIndices, index];
      setPoppedIndices(next);
      playSfx("chat-pop");

      if (next.length === BALLOON_THEMES.length) {
        if (cheerTimerRef.current !== null) {
          window.clearTimeout(cheerTimerRef.current);
        }
        cheerTimerRef.current = window.setTimeout(() => {
          playSfx("party-cheer");
        }, 180);
      }
    },
    [poppedIndices]
  );

  const handleResetBalloons = useCallback(() => {
    if (cheerTimerRef.current !== null) {
      window.clearTimeout(cheerTimerRef.current);
      cheerTimerRef.current = null;
    }
    playSfx("paper-flip");
    setPoppedIndices([]);
  }, []);

  const toggleWishItem = useCallback(
    (index: number) => {
      if (isCapsuleLocked) return;
      playSfx("chat-pop");
      setCheckedWishes((prev) =>
        prev.includes(index)
          ? prev.filter((item) => item !== index)
          : [...prev, index]
      );
    },
    [isCapsuleLocked]
  );

  const handleSaveSecretWish = useCallback(() => {
    if (isCapsuleLocked) return;
    const trimmed = secretWishInput.trim();
    if (!trimmed) return;
    playSfx("paper-flip");
    setSavedSecretWish(trimmed);
    setSecretWishInput("");
  }, [isCapsuleLocked, secretWishInput]);

  const handleToggleCapsuleLock = useCallback(() => {
    if (!isCapsuleLocked) {
      const pending = secretWishInput.trim();
      if (pending) {
        setSavedSecretWish(pending);
        setSecretWishInput("");
      }
      playSfx("stamp-claim");
      setIsCapsuleLocked(true);
      setCapsuleSealKey((prev) => prev + 1);
      return;
    }

    playSfx("paper-flip");
    setIsCapsuleLocked(false);
  }, [isCapsuleLocked, secretWishInput]);

  const openLightbox = useCallback((index: number) => {
    playSfx("camera-shutter");
    setLightboxIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const showPrevPhoto = useCallback(() => {
    if (memories.length === 0) return;
    playSfx("camera-shutter");
    setLightboxIndex((prev) =>
      prev === null ? 0 : (prev - 1 + memories.length) % memories.length
    );
  }, [memories.length]);

  const showNextPhoto = useCallback(() => {
    if (memories.length === 0) return;
    playSfx("camera-shutter");
    setLightboxIndex((prev) => (prev === null ? 0 : (prev + 1) % memories.length));
  }, [memories.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
      } else if (event.key === "ArrowLeft") {
        showPrevPhoto();
      } else if (event.key === "ArrowRight") {
        showNextPhoto();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeLightbox, lightboxIndex, showNextPhoto, showPrevPhoto]);

  const age = data.turningAge;
  const ageCounters = [
    {
      value: age.toLocaleString("id-ID"),
      label: "Tahun Usia",
      accent: "border-t-[#2563EB]",
      valueColor: "text-[#2563EB]",
    },
    {
      value: (age * 12).toLocaleString("id-ID"),
      label: "Bulan Cerita",
      accent: "border-t-[#F43F5E]",
      valueColor: "text-[#F43F5E]",
    },
    {
      value: (age * 365).toLocaleString("id-ID"),
      label: "Hari Seru",
      accent: "border-t-[#F59E0B]",
      valueColor: "text-[#D97706]",
    },
    {
      value: (age * 8760).toLocaleString("id-ID"),
      label: "Jam Berkesan",
      accent: "border-t-[#10B981]",
      valueColor: "text-[#059669]",
    },
  ];

  const activeLightboxMemory =
    lightboxIndex !== null ? memories[lightboxIndex] ?? null : null;

  return (
    <div
      className={cn(
        "relative w-full bg-[#F8FAFC] font-jakarta text-[#0F172A] selection:bg-[#2563EB] selection:text-white",
        embedded
          ? isOpened
            ? "min-h-[760px]"
            : "h-[760px] overflow-hidden"
          : isOpened
            ? "min-h-[100dvh]"
            : "h-[100dvh] overflow-hidden"
      )}
    >
      {/* Opening Party Cover Gate (!embedded) */}
      <AnimatePresence>
        {!isOpened && (
          <motion.div
            key="ultah-balon-cover"
            initial={{ opacity: 1 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0, transition: { duration: 0.15 } }
                : {
                    opacity: 0,
                    y: -24,
                    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                  }
            }
            className={cn(
              "inset-0 z-30 flex items-center justify-center overflow-y-auto bg-[#F8FAFC] px-4 py-8",
              embedded ? "absolute" : "fixed"
            )}
            style={{
              backgroundImage:
                "radial-gradient(circle at 18% 20%, rgba(56, 189, 248, 0.22), transparent 45%), radial-gradient(circle at 82% 24%, rgba(244, 63, 94, 0.16), transparent 42%), radial-gradient(circle at 50% 85%, rgba(245, 158, 11, 0.16), transparent 46%)",
            }}
          >
            {/* Floating Pastel Balloons Around Cover Card */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden"
            >
              <motion.div
                animate={
                  prefersReducedMotion ? undefined : { y: [0, -14, 0], rotate: [-3, 3, -3] }
                }
                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-6 left-4 w-20 opacity-85 sm:top-12 sm:left-14 sm:w-28"
              >
                <PastelBalloonSvg fill="#38BDF8" highlight="#BAE6FD" shade="#0284C7" />
              </motion.div>

              <motion.div
                animate={
                  prefersReducedMotion ? undefined : { y: [0, -18, 0], rotate: [3, -3, 3] }
                }
                transition={{
                  duration: 4.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.4,
                }}
                className="absolute top-8 right-5 w-20 opacity-85 sm:top-14 sm:right-16 sm:w-28"
              >
                <PastelBalloonSvg fill="#FB7185" highlight="#FECDD3" shade="#E11D48" />
              </motion.div>

              <motion.div
                animate={
                  prefersReducedMotion ? undefined : { y: [0, -12, 0], rotate: [-2, 4, -2] }
                }
                transition={{
                  duration: 5.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.8,
                }}
                className="absolute bottom-6 left-10 hidden w-24 opacity-80 md:block"
              >
                <PastelBalloonSvg fill="#FBBF24" highlight="#FDE68A" shade="#D97706" />
              </motion.div>

              <motion.div
                animate={
                  prefersReducedMotion ? undefined : { y: [0, -15, 0], rotate: [2, -4, 2] }
                }
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2,
                }}
                className="absolute right-12 bottom-8 hidden w-24 opacity-80 md:block"
              >
                <PastelBalloonSvg fill="#818CF8" highlight="#C7D2FE" shade="#4F46E5" />
              </motion.div>
            </div>

            {/* Cover Celebration Card */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 1, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="relative z-10 my-auto w-full max-w-lg rounded-3xl border border-[#E2E8F0] bg-white p-7 text-center shadow-[0_24px_60px_-15px_rgba(37,99,235,0.18)] sm:p-10"
            >
              <div className="mx-auto mb-5 flex items-center justify-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
                  <Balloon size={24} weight="fill" aria-hidden="true" />
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF1F2] text-[#F43F5E]">
                  <Confetti size={24} weight="fill" aria-hidden="true" />
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFFBEB] text-[#F59E0B]">
                  <Hourglass size={24} weight="fill" aria-hidden="true" />
                </span>
              </div>

              <p className="text-xs font-bold tracking-[0.18em] text-[#2563EB] uppercase">
                Pesta Balon &amp; Kapsul Waktu
              </p>

              <h1 className="font-archivo mt-3 text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
                Selamat Ulang Tahun ke-{data.turningAge}, {data.celebrantName}!
              </h1>

              <p className="mt-3 text-sm leading-relaxed text-[#475569] sm:text-base">
                Ada kejutan pesta balon, kapsul waktu 5 tahun lagi, dan papan ucapan spesial dari{" "}
                <span className="font-semibold text-[#0F172A]">{data.senderName}</span>{" "}
                untuk tanggal {data.birthDateLabel}.
              </p>

              <button
                type="button"
                onClick={handleOpenParty}
                className="mt-7 inline-flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-[#2563EB] px-6 py-4 text-sm font-bold text-white shadow-[0_12px_28px_-8px_rgba(37,99,235,0.55)] transition-all hover:bg-[#1D4ED8] active:scale-[0.98] sm:w-auto sm:px-8 sm:text-base"
              >
                <Confetti size={20} weight="fill" aria-hidden="true" />
                <span>Mulai Pesta &amp; Buka Kejutan</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main>
        {/* Section 1: Hero Split + Tilted Celebration Photo + Age Counters */}
        <section
          id="hero-top"
          className="relative overflow-hidden border-b border-[#E2E8F0] bg-[#F8FAFC] pt-14 pb-16 sm:pt-20 sm:pb-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 15%, rgba(56, 189, 248, 0.16), transparent 42%), radial-gradient(circle at 88% 20%, rgba(244, 63, 94, 0.12), transparent 38%), radial-gradient(circle at 70% 90%, rgba(245, 158, 11, 0.12), transparent 40%)",
          }}
        >
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-5 sm:px-8 lg:grid-cols-12">
            {/* Left Copy & Age Counters */}
            <div className="space-y-6 lg:col-span-7">
              <div className="border-l-4 border-[#2563EB] pl-4">
                <p className="text-xs font-bold tracking-[0.16em] text-[#2563EB] uppercase">
                  {data.birthDateLabel} / Pesta Ulang Tahun
                </p>
                <h1 className="font-archivo mt-2 text-4xl leading-[1.08] font-extrabold tracking-tight text-[#0F172A] sm:text-5xl lg:text-[3.35rem]">
                  Happy {data.turningAge}th Birthday, {data.celebrantName}!
                </h1>
              </div>

              <p className="max-w-2xl text-base leading-relaxed text-[#334155] sm:text-lg">
                {data.heroWish}
              </p>

              <p className="text-sm font-semibold text-[#F43F5E]">
                Dirayakan khusus oleh {data.senderName}
              </p>

              {/* Age Counters */}
              <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4 sm:gap-4">
                {ageCounters.map((stat) => (
                  <div
                    key={stat.label}
                    className={cn(
                      "rounded-2xl border border-[#E2E8F0] border-t-4 bg-white p-4 shadow-sm",
                      stat.accent
                    )}
                  >
                    <p
                      className={cn(
                        "font-archivo text-2xl font-extrabold tracking-tight tabular-nums sm:text-3xl",
                        stat.valueColor
                      )}
                    >
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[#64748B]">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Tilted Celebration Photo */}
            <div className="relative mx-auto w-full max-w-md lg:col-span-5">
              <div
                aria-hidden="true"
                className="absolute -inset-3 -rotate-3 rounded-3xl bg-[#38BDF8]/20"
              />
              <div
                aria-hidden="true"
                className="absolute -inset-1 rotate-6 rounded-3xl bg-[#F43F5E]/15"
              />

              <figure className="relative rotate-2 rounded-3xl border border-[#E2E8F0] bg-white p-3 pb-5 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.18)] transition-transform duration-300 hover:rotate-0">
                <div className="relative aspect-[4/4.3] overflow-hidden rounded-2xl bg-[#EFF6FF]">
                  <img
                    src={heroPhotoUrl}
                    alt={`Foto perayaan ulang tahun ke-${data.turningAge} ${data.celebrantName}`}
                    loading="eager"
                    className="h-full w-full object-cover"
                  />
                </div>
                <figcaption className="mt-4 flex items-center justify-between gap-3 px-1">
                  <span className="font-handwriting text-2xl font-bold text-[#0F172A]">
                    Babak Baru Usia {data.turningAge}
                  </span>
                  <span className="text-xs font-bold tracking-wider text-[#2563EB] uppercase tabular-nums">
                    {data.birthDateLabel}
                  </span>
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* Section 2: Interactive "Pecahin 5 Balon Kejutan" Mini-Game */}
        <section className="border-b border-[#E2E8F0] bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div className="border-l-4 border-[#F43F5E] pl-4">
                <p className="text-xs font-bold tracking-[0.16em] text-[#F43F5E] uppercase">
                  Mini-Game Kejutan
                </p>
                <h2 className="font-archivo mt-1 text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
                  Pecahin 5 Balon Kejutan
                </h2>
                <p className="mt-2 max-w-xl text-sm text-[#475569] sm:text-base">
                  Klik satu per satu balon pastel di bawah untuk membuka fakta seru dan roast manis tentang {data.celebrantName}.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="font-archivo text-sm font-bold text-[#0F172A] tabular-nums">
                  {poppedIndices.length} / {BALLOON_THEMES.length} Balon Pecah
                </span>
                <button
                  type="button"
                  onClick={handleResetBalloons}
                  disabled={poppedIndices.length === 0}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-4 py-2.5 text-xs font-bold text-[#0F172A] transition-colors hover:bg-[#EFF6FF] hover:text-[#2563EB] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <ArrowCounterClockwise size={15} weight="bold" aria-hidden="true" />
                  <span>Tiup Ulang Semua Balon</span>
                </button>
              </div>
            </div>

            {allBalloonsPopped && (
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 1, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 flex flex-col items-start justify-between gap-3 rounded-2xl border border-[#F59E0B]/40 bg-[#FFFBEB] p-5 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F59E0B] text-white">
                    <Confetti size={20} weight="fill" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-archivo text-base font-extrabold text-[#0F172A]">
                      Semua 5 balon berhasil dipecahkan!
                    </p>
                    <p className="text-sm text-[#475569]">
                      Selamat datang di usia {data.turningAge}, {data.celebrantName}. Lanjut isi kapsul waktu di bawah ya.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {BALLOON_THEMES.map((balloon, idx) => {
                const isPopped = poppedIndices.includes(idx);
                const roast = roastFacts[idx];

                return (
                  <div
                    key={balloon.id}
                    className="relative flex min-h-[260px] flex-col"
                  >
                    <AnimatePresence mode="wait">
                      {!isPopped ? (
                        <motion.button
                          key={`unpopped-${balloon.id}`}
                          type="button"
                          onClick={() => handlePopBalloon(idx)}
                          aria-label={`Pecahkan ${balloon.label} nomor ${idx + 1}`}
                          initial={prefersReducedMotion ? false : { opacity: 1, scale: 0.94 }}
                          animate={
                            prefersReducedMotion
                              ? { opacity: 1, scale: 1 }
                              : {
                                  opacity: 1,
                                  scale: 1,
                                  y: [0, -8, 0],
                                }
                          }
                          exit={
                            prefersReducedMotion
                              ? { opacity: 0, transition: { duration: 0.1 } }
                              : {
                                  scale: [1, 1.24, 0.2],
                                  opacity: 0,
                                  transition: { duration: 0.22 },
                                }
                          }
                          transition={
                            prefersReducedMotion
                              ? { duration: 0.1 }
                              : {
                                  y: {
                                    duration: 2.8 + idx * 0.35,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: idx * 0.2,
                                  },
                                  scale: { type: "spring", stiffness: 320, damping: 20 },
                                }
                          }
                          whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
                          whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
                          className="group flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 text-center transition-colors hover:border-[#2563EB]/40 hover:bg-white hover:shadow-md"
                        >
                          <div className="w-24 sm:w-28">
                            <PastelBalloonSvg
                              fill={balloon.fill}
                              highlight={balloon.highlight}
                              shade={balloon.shade}
                              className="h-auto w-full drop-shadow-sm transition-transform group-hover:scale-105"
                            />
                          </div>
                          <span className="mt-2 font-archivo text-sm font-extrabold text-[#0F172A]">
                            Balon #{idx + 1}
                          </span>
                          <span className="mt-0.5 text-xs font-medium text-[#64748B]">
                            Klik buat pecahin
                          </span>
                        </motion.button>
                      ) : (
                        <motion.article
                          key={`popped-${balloon.id}`}
                          initial={
                            prefersReducedMotion
                              ? { opacity: 1 }
                              : { opacity: 1, scale: 0.82 }
                          }
                          animate={{ opacity: 1, scale: 1 }}
                          transition={
                            prefersReducedMotion
                              ? { duration: 0.1 }
                              : { type: "spring", stiffness: 340, damping: 18 }
                          }
                          className={cn(
                            "flex h-full flex-col justify-between rounded-3xl border p-5 shadow-sm",
                            balloon.accentBorder,
                            balloon.accentBg
                          )}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={cn(
                                  "font-archivo text-xs font-extrabold tracking-wider uppercase tabular-nums",
                                  balloon.accentText
                                )}
                              >
                                Fakta #{idx + 1}
                              </span>
                              <Confetti
                                size={18}
                                weight="fill"
                                className={balloon.accentText}
                                aria-hidden="true"
                              />
                            </div>
                            <h3 className="font-archivo mt-3 text-base font-extrabold leading-snug text-[#0F172A]">
                              {roast.title}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-[#334155]">
                              {roast.fact}
                            </p>
                          </div>

                          <p className="mt-4 border-t border-[#0F172A]/10 pt-2.5 text-[11px] font-bold tracking-wider text-[#64748B] uppercase">
                            Balon Terpecahkan
                          </p>
                        </motion.article>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 3: Interactive "Kapsul Waktu Usia X+5" (wishChecklist) */}
        <section className="border-b border-[#E2E8F0] bg-[#F8FAFC] py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-5 sm:px-8">
            <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div className="border-l-4 border-[#2563EB] pl-4">
                <p className="text-xs font-bold tracking-[0.16em] text-[#2563EB] uppercase">
                  Arsip Harapan Masa Depan
                </p>
                <h2 className="font-archivo mt-1 text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
                  Kapsul Waktu Usia {data.turningAge + 5}
                </h2>
                <p className="mt-2 text-sm text-[#475569] sm:text-base">
                  Centang target yang paling kamu semogakan, tambah satu catatan rahasia, lalu kunci kapsulnya untuk 5 tahun mendatang.
                </p>
              </div>

              <span className="font-archivo text-sm font-bold text-[#0F172A] tabular-nums">
                {checkedWishes.length} / {wishChecklist.length} Terpilih
              </span>
            </div>

            <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-8">
              {/* Capsule Seal Banner when Locked */}
              <AnimatePresence>
                {isCapsuleLocked && (
                  <motion.div
                    key={`capsule-seal-${capsuleSealKey}`}
                    initial={
                      prefersReducedMotion
                        ? { opacity: 1 }
                        : { opacity: 1, scale: 0.92, y: -6 }
                    }
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={
                      prefersReducedMotion
                        ? { duration: 0.1 }
                        : { type: "spring", stiffness: 320, damping: 20 }
                    }
                    className="mb-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-[#2563EB]/30 bg-[#EFF6FF] p-4 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white">
                        <Lock size={20} weight="fill" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="font-archivo text-sm font-extrabold text-[#0F172A] sm:text-base">
                          Kapsul Waktu Terkunci untuk {data.celebrantName} Usia {data.turningAge + 5}
                        </p>
                        <p className="text-xs text-[#475569] sm:text-sm">
                          Semua harapan dan catatan rahasiamu sudah tersegel aman sampai 5 tahun lagi.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Checklist Wishes */}
              {wishChecklist.length > 0 && (
                <div className="space-y-3">
                  {wishChecklist.map((wish, idx) => {
                    const isChecked = checkedWishes.includes(idx);
                    return (
                      <button
                        key={`${wish}-${idx}`}
                        type="button"
                        onClick={() => toggleWishItem(idx)}
                        disabled={isCapsuleLocked}
                        className={cn(
                          "flex w-full items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left transition-colors",
                          isCapsuleLocked
                            ? "cursor-not-allowed opacity-85"
                            : "cursor-pointer",
                          isChecked
                            ? "border-[#2563EB]/40 bg-[#EFF6FF]"
                            : "border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white"
                        )}
                      >
                        <span
                          className={cn(
                            "shrink-0",
                            isChecked ? "text-[#2563EB]" : "text-[#94A3B8]"
                          )}
                        >
                          {isChecked ? (
                            <CheckCircle size={22} weight="fill" aria-hidden="true" />
                          ) : (
                            <Circle size={22} weight="bold" aria-hidden="true" />
                          )}
                        </span>
                        <span
                          className={cn(
                            "flex-1 text-sm font-semibold leading-snug sm:text-base",
                            isChecked ? "text-[#0F172A]" : "text-[#334155]"
                          )}
                        >
                          {wish}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Secret Wish Note Input & Display */}
              <div className="mt-6 border-t border-dashed border-[#CBD5E1] pt-6">
                <label
                  htmlFor="secret-wish-note"
                  className="block font-archivo text-sm font-extrabold text-[#0F172A]"
                >
                  Catatan Rahasia untuk {data.celebrantName} di Usia {data.turningAge + 5}
                </label>

                {savedSecretWish && (
                  <div className="mt-3 flex items-start gap-3 rounded-2xl border border-[#F59E0B]/40 bg-[#FFFBEB] p-4">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F59E0B] text-white">
                      <Check size={14} weight="bold" aria-hidden="true" />
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-bold tracking-wider text-[#D97706] uppercase">
                        Pesan Rahasia Tersimpan
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#0F172A] sm:text-base">
                        &ldquo;{savedSecretWish}&rdquo;
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
                  <input
                    id="secret-wish-note"
                    type="text"
                    value={secretWishInput}
                    onChange={(event) => setSecretWishInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleSaveSecretWish();
                      }
                    }}
                    disabled={isCapsuleLocked}
                    maxLength={180}
                    placeholder={
                      savedSecretWish
                        ? "Ganti catatan rahasia sebelum kapsul dikunci..."
                        : `Tulis 1 harapan rahasia buat dirimu umur ${data.turningAge + 5}...`
                    }
                    className="flex-1 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={handleSaveSecretWish}
                    disabled={isCapsuleLocked || !secretWishInput.trim()}
                    className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white px-4 py-3 text-sm font-bold text-[#0F172A] transition-colors hover:bg-[#EFF6FF] hover:text-[#2563EB] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <Plus size={16} weight="bold" aria-hidden="true" />
                    <span>Simpan Pesan</span>
                  </button>
                </div>
              </div>

              {/* Lock Toggle CTA */}
              <div className="mt-6 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                <p className="text-xs text-[#64748B]">
                  {isCapsuleLocked
                    ? "Segel kapsul aktif. Klik tombol di samping jika ingin membuka ulang."
                    : "Sudah beres pilih harapan? Segel kapsulnya sekarang."}
                </p>

                <button
                  type="button"
                  onClick={handleToggleCapsuleLock}
                  className={cn(
                    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold transition-all active:scale-[0.98]",
                    isCapsuleLocked
                      ? "border border-[#CBD5E1] bg-[#F8FAFC] text-[#0F172A] hover:bg-[#EFF6FF]"
                      : "bg-[#2563EB] text-white shadow-[0_12px_24px_-8px_rgba(37,99,235,0.5)] hover:bg-[#1D4ED8]"
                  )}
                >
                  {isCapsuleLocked ? (
                    <>
                      <LockOpen size={18} weight="bold" aria-hidden="true" />
                      <span>Buka Segel Kapsul</span>
                    </>
                  ) : (
                    <>
                      <Lock size={18} weight="fill" aria-hidden="true" />
                      <span>Kunci Kapsul Sampai 5 Tahun Lagi</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Clothespin Garland Polaroid Gallery + Camera-Shutter Lightbox */}
        <section className="border-b border-[#E2E8F0] bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mb-10 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div className="border-l-4 border-[#F59E0B] pl-4">
                <p className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.16em] text-[#D97706] uppercase">
                  <Camera size={15} weight="fill" aria-hidden="true" />
                  <span>Gantungan Foto Kenangan</span>
                </p>
                <h2 className="font-archivo mt-1 text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
                  Galeri Polaroid Ulang Tahun {data.celebrantName}
                </h2>
              </div>
              <p className="text-sm font-medium text-[#64748B]">
                Klik polaroid mana saja untuk memperbesar foto.
              </p>
            </div>

            {/* Garland Cord Visual */}
            <div aria-hidden="true" className="relative mb-2 hidden sm:block">
              <svg
                viewBox="0 0 1200 44"
                preserveAspectRatio="none"
                className="h-9 w-full"
              >
                <path
                  d="M0 8 Q300 42 600 18 Q900 -4 1200 18"
                  stroke="#CBD5E1"
                  strokeWidth="3"
                  strokeDasharray="8 6"
                  fill="none"
                />
              </svg>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {memories.map((memory, index) => {
                const tiltClass = POLAROID_TILTS[index % POLAROID_TILTS.length];
                const pinColor = CLOTHESPIN_COLORS[index % CLOTHESPIN_COLORS.length];

                return (
                  <figure
                    key={`${memory.imageUrl}-${index}`}
                    className={cn(
                      "group relative pt-4 transition-transform duration-300 hover:rotate-0",
                      tiltClass
                    )}
                  >
                    {/* Clothespin Clip */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute top-0 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center"
                    >
                      <span
                        className={cn(
                          "h-7 w-4 rounded-t-sm rounded-b-[3px] border border-[#0F172A]/20 shadow-sm",
                          pinColor
                        )}
                      />
                      <span className="-mt-2 h-1.5 w-5 rounded-full bg-[#0F172A]/25" />
                    </div>

                    <div className="rounded-xl border border-[#E2E8F0] bg-white p-3.5 pb-5 shadow-[0_14px_30px_-10px_rgba(15,23,42,0.14)] transition-shadow group-hover:shadow-[0_20px_38px_-10px_rgba(37,99,235,0.2)]">
                      <button
                        type="button"
                        onClick={() => openLightbox(index)}
                        aria-label={`Buka foto kenangan ${index + 1}: ${memory.caption}`}
                        className="relative block aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-lg bg-[#F1F5F9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
                      >
                        <img
                          src={memory.imageUrl}
                          alt={memory.caption}
                          loading="eager"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                        />
                      </button>

                      <figcaption className="mt-3.5 flex items-start gap-2.5 px-1">
                        <span className="font-archivo pt-1 text-xs font-extrabold text-[#F43F5E] tabular-nums">
                          #{String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="font-handwriting text-xl leading-snug font-bold text-[#0F172A]">
                          {memory.caption}
                        </span>
                      </figcaption>
                    </div>
                  </figure>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 5: Papan Ucapan Bestie (friendWishes) */}
        <section className="border-b border-[#E2E8F0] bg-[#F8FAFC] py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mb-10 border-l-4 border-[#F43F5E] pl-4">
              <p className="text-xs font-bold tracking-[0.16em] text-[#F43F5E] uppercase">
                Papan Ucapan Bestie
              </p>
              <h2 className="font-archivo mt-1 text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
                Doa &amp; Pesan Hangat dari Orang Terdekat
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {friendWishes.map((wish, index) => {
                const tapeClass = WISH_TAPE_COLORS[index % WISH_TAPE_COLORS.length];

                return (
                  <motion.article
                    key={`${wish.from}-${index}`}
                    initial={
                      prefersReducedMotion || embedded
                        ? false
                        : { opacity: 1, y: 12 }
                    }
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: "some" }}
                    transition={
                      prefersReducedMotion
                        ? { duration: 0.1 }
                        : {
                            type: "spring",
                            stiffness: 240,
                            damping: 22,
                            delay: (index % 3) * 0.06,
                          }
                    }
                    className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm"
                  >
                    <div
                      aria-hidden="true"
                      className={cn("absolute top-0 right-0 left-0 h-1.5", tapeClass)}
                    />

                    <div className="pt-2">
                      <div className="mb-3 flex items-center justify-between">
                        <Quotes
                          size={22}
                          weight="fill"
                          className="text-[#2563EB]/75"
                          aria-hidden="true"
                        />
                        <span className="font-archivo text-xs font-bold text-[#94A3B8] tabular-nums">
                          #{String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-[#334155] sm:text-base">
                        {wish.message}
                      </p>
                    </div>

                    <div className="mt-5 border-t border-dashed border-[#E2E8F0] pt-3.5">
                      <p className="font-archivo text-sm font-extrabold text-[#0F172A]">
                        {wish.from}
                      </p>
                      <p className="text-xs font-semibold text-[#64748B]">
                        {wish.role}
                      </p>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 6: Playlist Dedication & Closing Celebration Strip */}
        <section className="bg-white py-14">
          <div className="mx-auto max-w-6xl space-y-6 px-5 sm:px-8">
            {data.playlistSong && (
              <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 sm:flex-row sm:items-center sm:p-6">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
                    <MusicNotes size={24} weight="fill" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-bold tracking-[0.14em] text-[#2563EB] uppercase">
                      Lagu Pengiring Pesta
                    </p>
                    <p className="font-archivo mt-0.5 text-lg font-extrabold text-[#0F172A]">
                      {data.playlistSong.title} - {data.playlistSong.artist}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-[#64748B]">
                  Atur musik latar lewat tombol di pojok kanan bawah
                </span>
              </div>
            )}

            <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-[#2563EB] p-7 text-white shadow-[0_20px_50px_-15px_rgba(37,99,235,0.5)] sm:flex-row sm:items-center sm:p-10">
              <div className="space-y-2">
                <p className="text-xs font-bold tracking-[0.16em] text-[#FDE68A] uppercase">
                  Selamat Merayakan Usia {data.turningAge}
                </p>
                <h2 className="font-archivo text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Terus tumbuh, ketawa lepas, dan nikmati tiap momen barumu, {data.celebrantName}!
                </h2>
                <p className="text-sm text-white/85 sm:text-base">
                  Kejutan pesta balon dari {data.senderName} pada {data.birthDateLabel}.
                </p>
              </div>

              <a
                href="#hero-top"
                className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[#2563EB] shadow-sm transition-transform hover:bg-[#EFF6FF] active:scale-[0.98]"
              >
                <ArrowUp size={16} weight="bold" aria-hidden="true" />
                <span>Balik ke Atas</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] bg-[#F8FAFC] py-7">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-5 text-center sm:px-8">
          <Link
            href="/"
            className="text-xs font-semibold text-[#64748B] underline decoration-[#CBD5E1] underline-offset-4 transition-colors hover:text-[#2563EB]"
          >
            Dibuat dengan KatalogWeb
          </Link>
        </div>
      </footer>

      <MusicPlayer
        track={site.musicTrack}
        autoPlayTrigger={isOpened}
        className={cn(
          embedded ? "!absolute" : "",
          "border-[#CBD5E1] bg-white/95 font-jakarta text-xs font-bold text-[#0F172A] shadow-lg hover:bg-[#EFF6FF]"
        )}
      />

      {/* Polaroid Lightbox Modal */}
      <AnimatePresence>
        {activeLightboxMemory && lightboxIndex !== null && (
          <motion.div
            key="ultah-balon-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label={`Foto kenangan ${lightboxIndex + 1} dari ${memories.length}`}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/80 p-4 backdrop-blur-xs sm:p-6"
          >
            <motion.div
              initial={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 0, scale: 0.94, y: 12 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.96, y: 8 }
              }
              transition={{ duration: 0.18 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-3xl overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3.5">
                <span className="font-archivo text-xs font-extrabold tracking-wider text-[#2563EB] uppercase tabular-nums sm:text-sm">
                  Foto {lightboxIndex + 1} / {memories.length}
                </span>
                <button
                  type="button"
                  onClick={closeLightbox}
                  aria-label="Tutup pratinjau foto"
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-bold text-[#0F172A] transition-colors hover:bg-[#FFF1F2] hover:text-[#F43F5E]"
                >
                  <X size={14} weight="bold" aria-hidden="true" />
                  <span>Tutup</span>
                </button>
              </div>

              <div className="relative bg-[#0F172A]">
                <img
                  src={activeLightboxMemory.imageUrl}
                  alt={activeLightboxMemory.caption}
                  className="max-h-[68dvh] w-full object-contain"
                />
              </div>

              <div className="flex flex-col gap-4 border-t border-[#E2E8F0] bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="font-handwriting text-2xl leading-snug font-bold text-[#0F172A]">
                  {activeLightboxMemory.caption}
                </p>

                {memories.length > 1 && (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={showPrevPhoto}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3.5 py-2 text-xs font-bold text-[#0F172A] transition-colors hover:bg-[#EFF6FF] hover:text-[#2563EB]"
                    >
                      <CaretLeft size={14} weight="bold" aria-hidden="true" />
                      <span>Sebelumnya</span>
                    </button>
                    <button
                      type="button"
                      onClick={showNextPhoto}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-xl bg-[#2563EB] px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#1D4ED8]"
                    >
                      <span>Berikutnya</span>
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

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  ArrowRight,
  Backspace,
  BookOpen,
  CaretLeft,
  CaretRight,
  Check,
  EnvelopeOpen,
  Heart,
  Lock,
  MusicNotes,
  Quotes,
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

interface QuizQuestionItem {
  question: string;
  options: string[];
  correctIndex: number;
  reaction: string;
}

interface KangenParticle {
  id: number;
  x: number;
  rotate: number;
  scale: number;
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

const KANGEN_DISPATCHES = [
  "Sinyal diterima langsung!",
  "Satu paket rindu meluncur ke meja seberang...",
  "Meja redaksi ikut tersenyum hari ini.",
  "Pesan kilat tercatat di arsip utama!",
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

  const [isUnlocked, setIsUnlocked] = useState(embedded);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);

  const [elapsed, setElapsed] = useState<ElapsedDuration | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [kangenCount, setKangenCount] = useState(0);
  const [kangenPulseKey, setKangenPulseKey] = useState(0);
  const [kangenParticles, setKangenParticles] = useState<KangenParticle[]>([]);
  const kangenParticleIdRef = useRef(0);
  const [checkedBucketItems, setCheckedBucketItems] = useState<Record<number, boolean>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

  const { scrollYProgress } = useScroll();
  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 32,
    restDelta: 0.001,
  });

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
    playSfx("paper-flip");
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

  const handleSelectChapter = (idx: number) => {
    setActiveChapterIndex(idx);
    playSfx("paper-flip");
  };

  const toggleBucketItem = (index: number) => {
    const nextChecked = !checkedBucketItems[index];
    playSfx(nextChecked ? "quiz-ding" : "paper-flip");
    setCheckedBucketItems((prev) => ({
      ...prev,
      [index]: nextChecked,
    }));
  };

  const handleSendKangen = () => {
    playSfx("chat-pop");
    setKangenCount((prev) => prev + 1);
    setKangenPulseKey((prev) => prev + 1);

    if (!prefersReducedMotion) {
      const offsets = [-26, -8, 10, 26];
      const rotations = [-18, -6, 8, 16];
      const scales = [0.9, 1.15, 0.95, 1.05];
      const nextBatch: KangenParticle[] = offsets.map((x, idx) => {
        kangenParticleIdRef.current += 1;
        return {
          id: kangenParticleIdRef.current,
          x,
          rotate: rotations[idx] ?? 0,
          scale: scales[idx] ?? 1,
        };
      });
      setKangenParticles((prev) => [...prev.slice(-12), ...nextBatch]);
    }
  };

  const removeKangenParticle = useCallback((id: number) => {
    setKangenParticles((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const coverMemory = data.memories[0];
  const coverDetailMemory = data.memories[1] ?? data.memories[0];
  const coverDetailIndex = data.memories[1] ? 1 : 0;

  const spreadLead = data.memories[0];
  const spreadSide = data.memories[1];
  const spreadPortraits = data.memories.slice(2, 6);
  const extraMemories = data.memories.slice(6);

  const milestones = data.milestones ?? [];
  const littleThings = data.littleThings ?? [];

  const bucketListItems = useMemo(
    () => [
      {
        season: "MUSIM LIBURAN",
        title: "Liburan singkat ke kota sejuk naik kereta pagi",
        detail: `Berangkat berdua tanpa jadwal padat, cukup modal ransel kecil dan kamera buat ${data.partnerOne} & ${data.partnerTwo}.`,
      },
      {
        season: "AKHIR PEKAN",
        title: "Coba masak satu menu favorit bareng hari Minggu",
        detail: "Belanja bahan pagi-pagi dan eksperimen resep baru di dapur sambil putar lagu santai.",
      },
      {
        season: "GALERI & KOPI",
        title: "Nonton pameran lukisan dan minum kopi sore",
        detail: "Lanjut keliling ruang seni terbaru lalu diskusi soal karya paling unik di kedai kopi terdekat.",
      },
      {
        season: "ARSIP CETAK",
        title: "Cetak album foto tahunan edisi cetak fisik",
        detail: "Pilih bingkai foto terbaik sepanjang tahun untuk disimpan rapi dalam album kertas asli.",
      },
      {
        season: "TAMAN KOTA",
        title: "Piknik pagi di taman kota bawa bekal sendiri",
        detail: "Gelar tikar di bawah pohon rindang, bawa termos kopi, dan baca buku bareng sampai siang.",
      },
      {
        season: "EDISI TAHUNAN",
        title: "Merayakan anniversary berikutnya tanpa kerjaan mendadak",
        detail: "Tandai kalender lebih awal supaya satu hari penuh benar-benar bebas dari notifikasi kerja.",
      },
    ],
    [data.partnerOne, data.partnerTwo]
  );

  const checkedBucketCount = bucketListItems.reduce(
    (count, _, idx) => (checkedBucketItems[idx] ? count + 1 : count),
    0
  );
  const allBucketCompleted = checkedBucketCount === bucketListItems.length;

  const formattedAnniversary = formatAnniversaryDate(data.anniversaryDate);
  const issueVolume = buildIssueVolume(data.anniversaryDate);
  const activeLightboxMemory =
    lightboxIndex !== null ? data.memories[lightboxIndex] ?? null : null;

  const fallbackQuizQuestions = useMemo<QuizQuestionItem[]>(
    () => [
      {
        question: `Kapan tanggal edisi pertama kisah ${data.partnerOne} dan ${data.partnerTwo} resmi dimulai?`,
        options: [
          formattedAnniversary,
          "1 Januari 2023",
          "14 Februari 2025",
          "30 November 2022",
        ],
        correctIndex: 0,
        reaction: `Tepat sekali! ${formattedAnniversary} selalu menjadi halaman pembuka favorit di edisi kita.`,
      },
      {
        question: "Lagu mana yang dipilih redaksi sebagai soundtrack sampul edisi ini?",
        options: [
          "Lagu pop akustik tanpa judul",
          `${data.songDedication.title} - ${data.songDedication.artist}`,
          "Simfoni instrumental klasik",
          "Lagu jazz tengah malam",
        ],
        correctIndex: 1,
        reaction: `Benar! ${data.songDedication.title} dari ${data.songDedication.artist} paling pas menemani waktu baca.`,
      },
      {
        question: "Kebiasaan kecil mana yang paling menggambarkan agenda santai kita?",
        options: [
          "Datang ke kafe mepet jam tutup tanpa ngobrol",
          "Menghapus semua foto candid yang sedikit buram",
          "Menyimpan cerita kecil harian dan ngobrol lama di tempat nyaman",
          "Membatalkan rencana akhir pekan setiap bulan",
        ],
        correctIndex: 2,
        reaction: "Hafal luar kepala! Hal-hal sederhana itu justru yang bikin setiap bab terasa hidup.",
      },
    ],
    [
      data.partnerOne,
      data.partnerTwo,
      data.songDedication.artist,
      data.songDedication.title,
      formattedAnniversary,
    ]
  );

  const quizQuestions: QuizQuestionItem[] =
    data.quizQuestions && data.quizQuestions.length > 0
      ? data.quizQuestions
      : fallbackQuizQuestions;

  const quizScore = quizQuestions.reduce((acc, q, idx) => {
    const selected = quizAnswers[idx];
    return selected === q.correctIndex ? acc + 1 : acc;
  }, 0);

  const answeredQuizCount = Object.keys(quizAnswers).length;

  const handleSelectQuizOption = (questionIdx: number, optionIdx: number) => {
    if (quizAnswers[questionIdx] !== undefined) return;
    const question = quizQuestions[questionIdx];
    if (!question) return;
    setQuizAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }));
    if (optionIdx === question.correctIndex) {
      playSfx("quiz-ding");
    } else {
      playSfx("paper-flip");
    }
  };

  const handleResetQuiz = () => {
    playSfx("paper-flip");
    setQuizAnswers({});
  };

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

  const pullQuoteText =
    data.loveReasons[0] ??
    "Bukan tentang seberapa megah rencananya, melainkan bagaimana hari biasa terasa ringan saat dijalani berdua.";

  const activeKangenDispatch =
    kangenCount > 0
      ? KANGEN_DISPATCHES[(kangenCount - 1) % KANGEN_DISPATCHES.length]
      : "";

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
          : isUnlocked
            ? "min-h-[100dvh]"
            : "h-[100dvh] overflow-hidden"
      )}
    >
      {/* Top Ruby Reading Progress Bar */}
      {isUnlocked && (
        <motion.div
          aria-hidden="true"
          style={{
            scaleX: prefersReducedMotion ? scrollYProgress : smoothScrollProgress,
          }}
          className="pointer-events-none fixed top-0 right-0 left-0 z-40 h-[3px] origin-left bg-[#BE123C]"
        />
      )}

      {/* Editorial Issue Cover Gate (shown until unlocked when not embedded) */}
      <AnimatePresence>
        {!isUnlocked && (
          <motion.div
            key="magazine-entry-gate"
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
              "inset-0 z-30 flex items-center justify-center overflow-y-auto bg-[#F6F5F1] px-4 py-8",
              embedded ? "absolute" : "fixed"
            )}
          >
            {hasPin ? (
              <motion.div
                key={shakeCount}
                initial={prefersReducedMotion ? false : { opacity: 1, y: 8 }}
                animate={
                  pinError && !prefersReducedMotion
                    ? { opacity: 1, y: 0, x: [0, -8, 8, -6, 6, -3, 3, 0] }
                    : { opacity: 1, y: 0, x: 0 }
                }
                transition={{ duration: 0.35 }}
                className="my-auto w-full max-w-md border border-[#111111] bg-[#FFFFFF] p-6 sm:p-8"
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
            ) : (
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 1, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="my-auto w-full max-w-2xl border border-[#111111] bg-[#FFFFFF] shadow-[6px_6px_0px_#111111]"
              >
                {/* Issue Volume Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#111111] bg-[#F6F5F1] px-5 py-3 font-mono text-[11px] font-semibold tracking-[0.16em] text-[#111111] uppercase">
                  <span className="text-[#BE123C]">EDISI KHUSUS ANNIVERSARY</span>
                  <span>{issueVolume}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12">
                  {/* Cover Portrait Preview */}
                  {coverMemory && (
                    <div className="border-b border-[#111111] bg-[#F6F5F1] p-4 md:col-span-5 md:border-r md:border-b-0">
                      <div className="relative aspect-[3/4] w-full overflow-hidden border border-[#111111] bg-[#FFFFFF]">
                        <img
                          src={coverMemory.imageUrl}
                          alt={coverMemory.caption}
                          loading="eager"
                          className="absolute inset-0 block h-full w-full object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5 border border-[#111111] bg-[#FFFFFF] px-2 py-0.5 font-mono text-[9px] font-bold tracking-[0.16em] text-[#BE123C] uppercase">
                          SAMPUL UTAMA
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cover Masthead & Unlock CTA */}
                  <div
                    className={cn(
                      "flex flex-col justify-between p-6 sm:p-8",
                      coverMemory ? "md:col-span-7" : "md:col-span-12"
                    )}
                  >
                    <div>
                      <p className="font-mono text-[10px] tracking-[0.2em] text-[#52525B] uppercase">
                        JURNAL DUA KEPALA / TERBIT {formattedAnniversary}
                      </p>
                      <h2 className="font-archivo mt-2 text-3xl font-black tracking-tight text-[#111111] uppercase sm:text-4xl">
                        {data.partnerOne}{" "}
                        <span className="font-serif-editorial font-normal italic text-[#BE123C]">
                          &amp;
                        </span>{" "}
                        {data.partnerTwo}
                      </h2>
                      <p className="font-serif-editorial mt-4 text-xl leading-snug italic text-[#27272A]">
                        {data.heroHeadline}
                      </p>
                      <div className="mt-4 flex items-center gap-2 border-t border-[#111111]/15 pt-4 font-mono text-[11px] text-[#52525B]">
                        <MusicNotes size={14} weight="bold" className="shrink-0 text-[#BE123C]" />
                        <span>
                          Soundtrack: {data.songDedication.title} - {data.songDedication.artist}
                        </span>
                      </div>
                    </div>

                    <div className="mt-8">
                      <button
                        type="button"
                        onClick={unlockIssue}
                        className="inline-flex w-full items-center justify-center gap-2.5 border border-[#111111] bg-[#BE123C] px-5 py-3.5 font-mono text-xs font-bold tracking-[0.14em] text-white uppercase transition-colors hover:bg-[#9F1239] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BE123C]"
                      >
                        <span>Buka Edisi Khusus Anniversary</span>
                        <ArrowRight size={15} weight="bold" />
                      </button>
                      <p className="mt-2.5 text-center font-mono text-[10px] tracking-wider text-[#52525B] uppercase">
                        KLIK UNTUK MEMBUKA HALAMAN DAN MEMUTAR MUSIK LATAR
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
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

              {/* Layered Asymmetric Cover Portrait */}
              {coverMemory && (
                <motion.div
                  initial={sectionInitial}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: "some" }}
                  transition={{ duration: 0.45 }}
                  className="relative pb-6 sm:pl-6 lg:col-span-5"
                >
                  {/* Sharp Ruby Redactor Stamp Mark (flat square border) */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-3 right-3 z-20 border-2 border-[#BE123C] bg-[#FFFFFF] px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.18em] text-[#BE123C] uppercase"
                  >
                    TERBIT / EDISI KHUSUS
                  </div>

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
                    <div className="flex items-start justify-between gap-4 px-4 py-3 sm:pl-10">
                      <p className="text-xs leading-relaxed text-[#111111]">
                        {coverMemory.caption}
                      </p>
                      <span className="shrink-0 font-mono text-[10px] tracking-widest text-[#BE123C] uppercase">
                        {coverMemory.dateLabel}
                      </span>
                    </div>
                  </button>

                  {/* Overlapping Detail Snapshot tucked at bottom-left edge */}
                  {coverDetailMemory && (
                    <motion.button
                      type="button"
                      onClick={() => openLightbox(coverDetailIndex)}
                      aria-label={`Lihat detail momen: ${coverDetailMemory.caption}`}
                      animate={
                        prefersReducedMotion ? undefined : { y: [0, -5, 0] }
                      }
                      whileHover={
                        prefersReducedMotion
                          ? undefined
                          : { y: -6, scale: 1.02 }
                      }
                      transition={{
                        y: {
                          duration: 4.6,
                          repeat: Infinity,
                          ease: "easeInOut",
                        },
                        scale: {
                          type: "spring",
                          stiffness: 380,
                          damping: 22,
                        },
                      }}
                      className="absolute bottom-0 left-0 z-10 w-36 border border-[#111111] bg-[#FFFFFF] p-1.5 text-left shadow-[4px_4px_0px_#111111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BE123C] sm:w-44"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden border border-[#111111]/20 bg-[#F6F5F1]">
                        <img
                          src={coverDetailMemory.imageUrl}
                          alt={coverDetailMemory.caption}
                          loading="eager"
                          className="absolute inset-0 block h-full w-full object-cover"
                        />
                      </div>
                      <div className="mt-1.5 flex items-center justify-between gap-1 px-0.5 font-mono text-[9px] font-bold tracking-wider uppercase">
                        <span className="text-[#BE123C]">ARSIP 02</span>
                        <span className="truncate text-[#52525B]">
                          {coverDetailMemory.dateLabel}
                        </span>
                      </div>
                    </motion.button>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </header>

        <main>
          {/* 2. Artikel Utama: Kronologi Kita (Interactive Chapter Reader) */}
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
                    <p className="mt-6 border-t border-[#111111]/20 pt-3 font-mono text-[10px] tracking-[0.16em] text-[#52525B] uppercase">
                      KLIK BAB DI SAMPING UNTUK MENANDAI BACAAN AKTIF
                    </p>
                  </div>

                  {/* Right: Selectable Numbered Story Chapters */}
                  <div className="lg:col-span-7">
                    <ol className="divide-y divide-[#111111] border-y border-[#111111] bg-[#FFFFFF]">
                      {milestones.map((item, idx) => {
                        const isActive = activeChapterIndex === idx;
                        return (
                          <li key={`${item.dateLabel}-${item.title}-${idx}`}>
                            <button
                              type="button"
                              onClick={() => handleSelectChapter(idx)}
                              aria-current={isActive ? "step" : undefined}
                              className={cn(
                                "grid w-full grid-cols-1 gap-3 border-l-4 px-5 py-5 text-left transition-colors duration-200 sm:grid-cols-12 sm:gap-5 sm:px-6 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#BE123C]",
                                isActive
                                  ? "border-[#BE123C] bg-[#FFF1F2]/60"
                                  : "border-transparent bg-[#FFFFFF] hover:bg-[#F6F5F1]/70"
                              )}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2 sm:col-span-4 sm:block">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-bold tracking-widest text-[#BE123C]">
                                    {padTwo(idx + 1)}
                                  </span>
                                  {isActive && (
                                    <motion.span
                                      layoutId={
                                        prefersReducedMotion
                                          ? undefined
                                          : "active-chapter-status"
                                      }
                                      transition={{
                                        type: "spring",
                                        stiffness: 420,
                                        damping: 30,
                                      }}
                                      className="inline-flex items-center gap-1 border border-[#BE123C] bg-[#FFFFFF] px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-[0.14em] text-[#BE123C] uppercase"
                                    >
                                      <BookOpen size={10} weight="bold" />
                                      <span>SEDANG DIBACA</span>
                                    </motion.span>
                                  )}
                                </div>
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
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* 2b. Warm Ruby Editorial Pull-Quote Spread */}
          <motion.section
            aria-label="Kutipan Redaksi dan Lagu Dedikasi"
            initial={sectionInitial}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: "some" }}
            transition={{ duration: 0.45 }}
            className="border-b border-[#111111] bg-[#FFF1F2]"
          >
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
              <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-8">
                  <div className="flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.2em] text-[#BE123C] uppercase">
                    <Quotes size={16} weight="fill" />
                    <span>KUTIPAN SAMPUL REDAKSI</span>
                  </div>
                  <blockquote className="font-serif-editorial mt-4 text-3xl leading-[1.2] font-semibold italic text-[#111111] sm:text-4xl">
                    &ldquo;{pullQuoteText}&rdquo;
                  </blockquote>
                  <p className="mt-4 font-mono text-xs tracking-[0.16em] text-[#52525B] uppercase">
                    CATATAN {data.partnerOne} UNTUK {data.partnerTwo}
                  </p>
                </div>

                <div className="border border-[#111111] bg-[#FFFFFF] p-6 lg:col-span-4">
                  <div className="flex items-center justify-between border-b border-[#111111]/20 pb-3 font-mono text-[10px] font-semibold tracking-[0.18em] text-[#BE123C] uppercase">
                    <span>LAGU DEDIKASI EDISI</span>
                    <MusicNotes size={15} weight="bold" />
                  </div>
                  <p className="font-serif-editorial mt-4 text-2xl font-semibold text-[#111111]">
                    {data.songDedication.title}
                  </p>
                  <p className="mt-1 font-mono text-xs tracking-wider text-[#52525B] uppercase">
                    {data.songDedication.artist}
                  </p>
                  <p className="mt-4 border-t border-[#111111]/15 pt-3 text-xs leading-relaxed text-[#3F3F46]">
                    Lagu yang diputar ulang saat menyusun halaman demi halaman edisi khusus ini.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

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
                  {/* Top Lead Landscape - Fixed Height Baseline */}
                  {spreadLead && (
                    <button
                      type="button"
                      onClick={() => openLightbox(0)}
                      className="group flex flex-col border border-[#111111] bg-[#F6F5F1] text-left md:col-span-7 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BE123C]"
                    >
                      <div className="relative h-64 w-full overflow-hidden border-b border-[#111111] bg-[#F6F5F1] sm:h-72 md:h-[360px]">
                        <img
                          src={spreadLead.imageUrl}
                          alt={spreadLead.caption}
                          loading="eager"
                          className="absolute inset-0 block h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between gap-2 p-4">
                        <p className="text-sm leading-snug font-medium text-[#111111]">
                          {spreadLead.caption}
                        </p>
                        <span className="font-mono text-[11px] tracking-wider text-[#BE123C] uppercase">
                          01 / {spreadLead.dateLabel}
                        </span>
                      </div>
                    </button>
                  )}

                  {/* Top Side Landscape - Matching Fixed Height Baseline */}
                  {spreadSide && (
                    <button
                      type="button"
                      onClick={() => openLightbox(1)}
                      className="group flex flex-col border border-[#111111] bg-[#F6F5F1] text-left md:col-span-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BE123C]"
                    >
                      <div className="relative h-64 w-full overflow-hidden border-b border-[#111111] bg-[#F6F5F1] sm:h-72 md:h-[360px]">
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

          {/* 4. Fakta Lapangan + Catatan Redaksi + Upgraded Tombol Kangen */}
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

                  {/* Upgraded Interactive Tombol Kangen */}
                  <div className="mt-6 border border-[#111111] bg-[#FFFFFF] p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-mono text-[10px] tracking-[0.18em] text-[#52525B] uppercase">
                          KANAL INTERAKTIF
                        </p>
                        <p className="mt-1 text-sm font-medium text-[#111111]">
                          Lagi kepikiran {data.partnerOne} atau {data.partnerTwo}?
                        </p>
                        {activeKangenDispatch && (
                          <p className="mt-1 font-mono text-[11px] font-medium text-[#BE123C]">
                            {activeKangenDispatch}
                          </p>
                        )}
                      </div>

                      <div className="relative flex flex-col items-start sm:items-end">
                        <div className="relative inline-flex">
                          {/* Floating Animated Ruby Heart Particles */}
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -top-2 left-1/2 z-20"
                          >
                            <AnimatePresence>
                              {kangenParticles.map((particle) => (
                                <motion.span
                                  key={particle.id}
                                  initial={{
                                    opacity: 1,
                                    y: 0,
                                    x: 0,
                                    scale: 0.75,
                                    rotate: 0,
                                  }}
                                  animate={{
                                    opacity: 0,
                                    y: -58,
                                    x: particle.x,
                                    scale: particle.scale,
                                    rotate: particle.rotate,
                                  }}
                                  exit={{ opacity: 0 }}
                                  transition={{
                                    duration: 0.85,
                                    ease: [0.22, 1, 0.36, 1],
                                  }}
                                  onAnimationComplete={() =>
                                    removeKangenParticle(particle.id)
                                  }
                                  className="absolute -translate-x-1/2 text-[#BE123C]"
                                >
                                  <Heart size={15} weight="fill" />
                                </motion.span>
                              ))}
                            </AnimatePresence>
                          </div>

                          <motion.button
                            type="button"
                            onClick={handleSendKangen}
                            whileTap={
                              prefersReducedMotion ? undefined : { scale: 0.96 }
                            }
                            className="inline-flex items-center gap-2.5 border border-[#111111] bg-[#BE123C] px-4 py-2.5 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-[#9F1239]"
                          >
                            <motion.span
                              key={kangenPulseKey}
                              initial={
                                prefersReducedMotion
                                  ? false
                                  : { scale: 1.35 }
                              }
                              animate={{ scale: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 450,
                                damping: 16,
                              }}
                              className="inline-flex"
                            >
                              <Heart size={15} weight="fill" />
                            </motion.span>
                            <span>Kirim Sinyal Kangen Hari Ini</span>
                          </motion.button>
                        </div>

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
                              transition={{
                                type: "spring",
                                stiffness: 420,
                                damping: 20,
                              }}
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

          {/* 5. New Section: Kuis Redaksi */}
          <motion.section
            aria-labelledby="kuis-redaksi-heading"
            initial={sectionInitial}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: "some" }}
            transition={{ duration: 0.45 }}
            className="border-b border-[#111111] bg-[#FFF1F2]"
          >
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
              <div className="flex flex-col justify-between gap-4 border-b border-[#111111] pb-5 sm:flex-row sm:items-end">
                <div>
                  <p className="font-mono text-[11px] font-semibold tracking-[0.2em] text-[#BE123C] uppercase">
                    EDISI INTERAKTIF
                  </p>
                  <h2
                    id="kuis-redaksi-heading"
                    className="font-archivo mt-1 text-3xl font-bold tracking-tight text-[#111111] uppercase sm:text-4xl"
                  >
                    Kuis Redaksi: Seberapa Hafal Tentang Kita?
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="border border-[#111111] bg-[#FFFFFF] px-3.5 py-2 font-mono text-xs font-bold tracking-wider text-[#111111] uppercase">
                    SKOR:{" "}
                    <span className="text-[#BE123C]">
                      {quizScore} / {quizQuestions.length} Tepat
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetQuiz}
                    disabled={answeredQuizCount === 0}
                    className={cn(
                      "inline-flex items-center gap-1.5 border border-[#111111] px-3.5 py-2 font-mono text-xs font-semibold uppercase transition-colors",
                      answeredQuizCount === 0
                        ? "cursor-not-allowed border-[#111111]/30 bg-[#F6F5F1] text-[#71717A]"
                        : "bg-[#FFFFFF] text-[#111111] hover:bg-[#111111] hover:text-white"
                    )}
                  >
                    <ArrowCounterClockwise size={14} weight="bold" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              <div className="mt-8 space-y-6">
                {quizQuestions.map((q, qIdx) => {
                  const selectedIdx = quizAnswers[qIdx];
                  const isAnswered = selectedIdx !== undefined;
                  const isCorrectAnswer = selectedIdx === q.correctIndex;

                  return (
                    <div
                      key={`${qIdx}-${q.question.slice(0, 20)}`}
                      className="border border-[#111111] bg-[#FFFFFF] p-6"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#111111]/15 pb-3">
                        <span className="font-mono text-[11px] font-bold tracking-[0.18em] text-[#BE123C] uppercase">
                          PERTANYAAN {padTwo(qIdx + 1)}
                        </span>
                        {isAnswered && (
                          <span
                            className={cn(
                              "border px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase",
                              isCorrectAnswer
                                ? "border-emerald-700 bg-emerald-50 text-emerald-800"
                                : "border-[#BE123C] bg-[#FFF1F2] text-[#BE123C]"
                            )}
                          >
                            {isCorrectAnswer ? "JAWABAN TEPAT" : "KURANG TEPAT"}
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif-editorial mt-4 text-xl font-semibold leading-snug text-[#111111] sm:text-2xl">
                        {q.question}
                      </h3>

                      <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {q.options.map((option, optIdx) => {
                          const isSelected = selectedIdx === optIdx;
                          const isCorrectOption = optIdx === q.correctIndex;
                          const letter = String.fromCharCode(65 + optIdx);

                          let optionStyle =
                            "border-[#111111]/30 bg-[#F6F5F1] text-[#111111] hover:border-[#111111] hover:bg-[#FFFFFF]";
                          if (isAnswered) {
                            if (isSelected && isCorrectOption) {
                              optionStyle =
                                "border-emerald-700 bg-emerald-50 text-emerald-950";
                            } else if (isSelected && !isCorrectOption) {
                              optionStyle =
                                "border-[#BE123C] bg-[#FFF1F2] text-[#9F1239]";
                            } else if (!isSelected && isCorrectOption) {
                              optionStyle =
                                "border-emerald-700/60 bg-emerald-50/50 text-emerald-900";
                            } else {
                              optionStyle =
                                "border-[#111111]/15 bg-[#F6F5F1]/60 text-[#71717A]";
                            }
                          }

                          return (
                            <button
                              key={`${qIdx}-${optIdx}`}
                              type="button"
                              disabled={isAnswered}
                              onClick={() => handleSelectQuizOption(qIdx, optIdx)}
                              className={cn(
                                "flex items-start gap-3 border px-4 py-3 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BE123C]",
                                optionStyle,
                                isAnswered && "cursor-default"
                              )}
                            >
                              <span className="font-mono mt-0.5 shrink-0 text-xs font-bold">
                                {letter}.
                              </span>
                              <span className="flex-1 leading-snug">{option}</span>
                              {isAnswered && isCorrectOption && (
                                <Check
                                  size={16}
                                  weight="bold"
                                  className="mt-0.5 shrink-0 text-emerald-700"
                                />
                              )}
                              {isAnswered && isSelected && !isCorrectOption && (
                                <X
                                  size={16}
                                  weight="bold"
                                  className="mt-0.5 shrink-0 text-[#BE123C]"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {isAnswered && (
                        <div
                          className={cn(
                            "mt-4 border-l-4 px-4 py-3 text-sm leading-relaxed",
                            isCorrectAnswer
                              ? "border-emerald-700 bg-emerald-50/70 text-emerald-950"
                              : "border-[#BE123C] bg-[#FFF1F2] text-[#111111]"
                          )}
                        >
                          {q.reaction}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.section>

          {/* 6. Resolusi & Bucket List Edisi Berikutnya */}
          <motion.section
            aria-labelledby="resolusi-heading"
            initial={sectionInitial}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: "some" }}
            transition={{ duration: 0.45 }}
            className="border-b border-[#111111] bg-[#FFFFFF]"
          >
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
              <div className="flex flex-col justify-between gap-4 border-b border-[#111111] pb-4 sm:flex-row sm:items-end">
                <div>
                  <p className="font-mono text-[11px] font-semibold tracking-[0.2em] text-[#BE123C] uppercase">
                    ARAHAN MASA DEPAN
                  </p>
                  <h2
                    id="resolusi-heading"
                    className="font-archivo mt-1 text-3xl font-bold tracking-tight text-[#111111] uppercase sm:text-4xl"
                  >
                    Resolusi &amp; Bucket List Kita
                  </h2>
                </div>

                <div className="border border-[#111111] bg-[#F6F5F1] px-3.5 py-2 font-mono text-xs font-bold tracking-wider text-[#111111] uppercase">
                  PROGRES:{" "}
                  <span className="text-[#BE123C]">
                    {checkedBucketCount} / {bucketListItems.length} Rencana Tercapai
                  </span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 border-t border-l border-[#111111] bg-[#FFFFFF] sm:grid-cols-2">
                {bucketListItems.map((item, idx) => {
                  const isChecked = Boolean(checkedBucketItems[idx]);
                  return (
                    <button
                      key={`${item.season}-${idx}`}
                      type="button"
                      onClick={() => toggleBucketItem(idx)}
                      aria-pressed={isChecked}
                      className={cn(
                        "group flex items-start gap-4 border-r border-b border-[#111111] p-6 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#BE123C]",
                        isChecked
                          ? "bg-[#F6F5F1]"
                          : "bg-[#FFFFFF] hover:bg-[#FFF1F2]/40"
                      )}
                    >
                      <motion.span
                        animate={
                          prefersReducedMotion
                            ? undefined
                            : { scale: isChecked ? [1, 1.15, 1] : 1 }
                        }
                        transition={{
                          type: "tween",
                          duration: 0.28,
                          ease: "easeOut",
                        }}
                        className={cn(
                          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border transition-colors",
                          isChecked
                            ? "border-[#BE123C] bg-[#BE123C] text-white"
                            : "border-[#111111] bg-[#FFFFFF] text-transparent group-hover:border-[#BE123C]"
                        )}
                      >
                        <Check size={14} weight="bold" />
                      </motion.span>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#BE123C] uppercase">
                            {padTwo(idx + 1)} / {item.season}
                          </span>
                          <span
                            className={cn(
                              "border px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase transition-colors",
                              isChecked
                                ? "border-[#111111]/25 bg-[#FFFFFF] text-[#71717A] line-through"
                                : "border-[#111111]/30 bg-[#F6F5F1] text-[#111111]"
                            )}
                          >
                            {isChecked ? "TERCAPAI" : "TERJADWAL"}
                          </span>
                        </div>

                        <h3
                          className={cn(
                            "font-serif-editorial mt-2 text-2xl font-semibold leading-snug transition-colors",
                            isChecked
                              ? "text-[#71717A] line-through"
                              : "text-[#111111]"
                          )}
                        >
                          {item.title}
                        </h3>
                        <p
                          className={cn(
                            "mt-2 text-sm leading-relaxed transition-colors",
                            isChecked ? "text-[#71717A]" : "text-[#3F3F46]"
                          )}
                        >
                          {item.detail}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {allBucketCompleted && (
                  <motion.div
                    initial={
                      prefersReducedMotion ? false : { opacity: 1, y: 8 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ type: "spring", stiffness: 360, damping: 26 }}
                    className="mt-6 flex flex-col justify-between gap-3 border border-[#BE123C] bg-[#FFF1F2] px-6 py-4 sm:flex-row sm:items-center"
                  >
                    <div>
                      <p className="font-mono text-xs font-bold tracking-[0.16em] text-[#BE123C] uppercase">
                        Semua Edisi Tercapai!
                      </p>
                      <p className="mt-1 text-sm text-[#111111]">
                        Seluruh daftar rencana {data.partnerOne} dan {data.partnerTwo} sudah tercentang. Saatnya menulis daftar petualangan baru untuk volume berikutnya.
                      </p>
                    </div>
                    <span className="shrink-0 border border-[#BE123C] bg-[#FFFFFF] px-3 py-1 font-mono text-[11px] font-bold tracking-widest text-[#BE123C] uppercase">
                      {checkedBucketCount} / {bucketListItems.length} SELESAI
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>

          {/* 7. Surat Pemimpin Redaksi (data.closingLetter) */}
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

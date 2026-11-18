"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowCounterClockwise,
  Backspace,
  Camera,
  CaretLeft,
  CaretRight,
  ChatCircleDots,
  Check,
  CheckCircle,
  Checks,
  Heart,
  Lock,
  Microphone,
  MusicNotes,
  Pause,
  Play,
  PushPin,
  Question,
  Star,
  Ticket,
  X,
  XCircle,
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

const VOICE_NOTE_DURATION_SEC = 6;
const VOICE_NOTE_BAR_HEIGHTS = [
  32, 68, 48, 86, 54, 92, 44, 78, 62, 88, 50, 74, 40, 64,
];
const VOICE_NOTE_NOTES = [293.66, 369.99, 440.0, 523.25, 440.0, 369.99, 329.63, 440.0];
const VOICE_NOTE_CAPTIONS = [
  "Kalau lagi capek sama kerjaan...",
  "ingat ya, HP kamu selalu punya satu chat",
  "yang siap dengerin cerita receh kamu.",
];

function buildFallbackChatThreads(partnerOne: string, partnerTwo: string) {
  return [
    {
      topic: "Awal Modus",
      messages: [
        {
          sender: "one" as const,
          text: `${partnerTwo}, maaf banget barusan daftar titipan nyasar ke chat kamu haha.`,
          time: "20.11",
        },
        {
          sender: "two" as const,
          text: `Hahaha aman kok ${partnerOne}, kirain mau nitip makan malem sekalian.`,
          time: "20.13",
        },
        {
          sender: "one" as const,
          text: "Boleh sih kalau kamu sekalian lewat, tapi btw udah makan belum?",
          time: "20.14",
        },
        {
          sender: "two" as const,
          text: "Nah ketahuan modusnya, dari chat nyasar langsung belok nanya makan.",
          time: "20.16",
        },
      ],
    },
    {
      topic: "Debat Makan",
      messages: [
        {
          sender: "one" as const,
          text: "Aku udah di depan gang ya. Malam ini mau makan di mana?",
          time: "18.42",
        },
        {
          sender: "two" as const,
          text: "Terserah kamu aja, aku ngikut yang penting enak.",
          time: "18.43",
        },
        {
          sender: "one" as const,
          text: "Pecel lele tenda biru yang sambelnya dipisah mau?",
          time: "18.44",
        },
        {
          sender: "two" as const,
          text: "Jangan gorengan dulu deh, lagi pengen yang berkuah hangat.",
          time: "18.45",
        },
      ],
    },
    {
      topic: "Tengah Malam",
      messages: [
        {
          sender: "two" as const,
          text: "Belum tidur kan? Di luar gerimis terus aku mendadak laper.",
          time: "23.38",
        },
        {
          sender: "one" as const,
          text: "Belum, baru mau ngecas HP. Mau aku beliin mi tektek lewat depan?",
          time: "23.39",
        },
        {
          sender: "two" as const,
          text: "Nggak usah keluar udah malem, cuma pengen cerita sebelum tidur aja.",
          time: "23.41",
        },
      ],
    },
  ];
}

const FALLBACK_QUIZ_QUESTIONS = [
  {
    question: "Kalau bilang 'terserah' pas ditanya mau makan apa, ujungnya paling sering milih apa?",
    options: ["Salad dingin", "Mie kuah hangat atau pecel lele", "Roti tawar"],
    correctIndex: 1,
    reaction: "Akurat 100 persen, jawaban 'terserah' hampir selalu berujung ke kuah hangat.",
  },
  {
    question: "Bagian mana yang paling dicari duluan pas masuk kafe bareng?",
    options: ["Pojokan deket colokan HP", "Meja paling depan", "Kursi tanpa sandaran"],
    correctIndex: 0,
    reaction: "Baterai HP aman berarti sesi ngobrol bisa jalan terus tanpa drama.",
  },
  {
    question: "Topik andalan pas teleponan malam sebelum tidur biasanya bahas apa?",
    options: ["Laporan pajak", "Hal receh seharian dan rencana jajan", "Berita cuaca luar negeri"],
    correctIndex: 1,
    reaction: "Nggak pernah kehabisan bahan cerita receh tiap malam.",
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

function getInitials(name: string): string {
  const cleaned = name.trim();
  if (!cleaned) return "?";
  return cleaned[0].toUpperCase();
}

export function BucinChatTemplate({
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
  const [claimedCoupons, setClaimedCoupons] = useState<Record<number, boolean>>({});

  const chatThreads = useMemo(() => {
    if (data.chatThreads && data.chatThreads.length > 0) {
      return data.chatThreads;
    }
    return buildFallbackChatThreads(data.partnerOne, data.partnerTwo);
  }, [data.chatThreads, data.partnerOne, data.partnerTwo]);

  const quizQuestions = useMemo(() => {
    if (data.quizQuestions && data.quizQuestions.length > 0) {
      return data.quizQuestions;
    }
    return FALLBACK_QUIZ_QUESTIONS;
  }, [data.quizQuestions]);

  const [activeThreadIndex, setActiveThreadIndex] = useState(0);
  const safeThreadIndex =
    activeThreadIndex < chatThreads.length ? activeThreadIndex : 0;
  const activeThread = chatThreads[safeThreadIndex];

  const [visibleMessagesCount, setVisibleMessagesCount] = useState<number>(
    activeThread.messages.length
  );
  const [isReplaying, setIsReplaying] = useState(false);
  const replayIntervalRef = useRef<number | null>(null);

  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [voiceElapsedSec, setVoiceElapsedSec] = useState(0);
  const voiceCtxRef = useRef<AudioContext | null>(null);
  const voiceProgressTimerRef = useRef<number | null>(null);
  const voiceNoteTimerRef = useRef<number | null>(null);
  const voiceStepRef = useRef(0);

  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

  // Elapsed duration live timer (rAF first tick avoids synchronous setState in useEffect)
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

  // PIN keypad handlers
  const unlockChatArchive = useCallback(() => {
    setPinError(false);
    setIsUnlocked(true);
  }, []);

  const submitPin = useCallback(
    (candidate: string) => {
      if (!hasPin) {
        unlockChatArchive();
        return;
      }
      if (candidate === expectedPin) {
        unlockChatArchive();
        return;
      }
      setPinError(true);
      setShakeCount((prev) => prev + 1);
      setPinInput("");
    },
    [expectedPin, hasPin, unlockChatArchive]
  );

  const handleDigitPress = useCallback(
    (digit: string) => {
      if (!hasPin || pinInput.length >= 4) return;
      const next = `${pinInput}${digit}`;
      setPinError(false);
      setPinInput(next);
      if (next.length === 4) {
        if (next === expectedPin) {
          unlockChatArchive();
        } else {
          setPinError(true);
          setShakeCount((prev) => prev + 1);
          setPinInput("");
        }
      }
    },
    [expectedPin, hasPin, pinInput, unlockChatArchive]
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

  // Chat replay helpers
  const clearReplayTimer = useCallback(() => {
    if (replayIntervalRef.current !== null) {
      window.clearInterval(replayIntervalRef.current);
      replayIntervalRef.current = null;
    }
  }, []);

  const handleSelectThread = (index: number) => {
    clearReplayTimer();
    setIsReplaying(false);
    setActiveThreadIndex(index);
    const targetThread = chatThreads[index] ?? chatThreads[0];
    setVisibleMessagesCount(targetThread.messages.length);
  };

  const handleReplayChat = () => {
    clearReplayTimer();
    const totalCount = activeThread.messages.length;
    if (totalCount <= 1) {
      setVisibleMessagesCount(totalCount);
      setIsReplaying(false);
      return;
    }
    setVisibleMessagesCount(1);
    setIsReplaying(true);

    replayIntervalRef.current = window.setInterval(() => {
      setVisibleMessagesCount((prev) => {
        const next = prev + 1;
        if (next >= totalCount) {
          clearReplayTimer();
          setIsReplaying(false);
          return totalCount;
        }
        return next;
      });
    }, 900);
  };

  useEffect(() => {
    return () => {
      clearReplayTimer();
    };
  }, [clearReplayTimer]);

  // Voice Note player (Web Audio soft synth + live progress)
  const stopVoiceNote = useCallback((resetProgress = false) => {
    if (voiceProgressTimerRef.current !== null) {
      window.clearInterval(voiceProgressTimerRef.current);
      voiceProgressTimerRef.current = null;
    }
    if (voiceNoteTimerRef.current !== null) {
      window.clearInterval(voiceNoteTimerRef.current);
      voiceNoteTimerRef.current = null;
    }
    if (voiceCtxRef.current) {
      voiceCtxRef.current.close().catch(() => {});
      voiceCtxRef.current = null;
    }
    setIsVoicePlaying(false);
    if (resetProgress) {
      setVoiceElapsedSec(0);
    }
  }, []);

  const toggleVoiceNote = () => {
    if (isVoicePlaying) {
      stopVoiceNote(false);
      return;
    }

    stopVoiceNote(false);
    setVoiceElapsedSec((prev) => (prev >= VOICE_NOTE_DURATION_SEC ? 0 : prev));
    setIsVoicePlaying(true);

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;

    if (AudioCtx) {
      const ctx = new AudioCtx();
      voiceCtxRef.current = ctx;
      voiceStepRef.current = 0;

      const playSoftTone = () => {
        if (!voiceCtxRef.current || voiceCtxRef.current.state === "closed") return;
        const now = ctx.currentTime;
        const freq =
          VOICE_NOTE_NOTES[voiceStepRef.current % VOICE_NOTE_NOTES.length];
        voiceStepRef.current += 1;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.045, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
      };

      playSoftTone();
      voiceNoteTimerRef.current = window.setInterval(playSoftTone, 560);
    }

    voiceProgressTimerRef.current = window.setInterval(() => {
      setVoiceElapsedSec((prev) => {
        const next = prev + 1;
        if (next >= VOICE_NOTE_DURATION_SEC) {
          stopVoiceNote(false);
          return VOICE_NOTE_DURATION_SEC;
        }
        return next;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (voiceProgressTimerRef.current !== null) {
        window.clearInterval(voiceProgressTimerRef.current);
      }
      if (voiceNoteTimerRef.current !== null) {
        window.clearInterval(voiceNoteTimerRef.current);
      }
      if (voiceCtxRef.current) {
        voiceCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Lightbox controls
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

  // Quiz handlers
  const handleSelectQuizOption = (questionIndex: number, optionIndex: number) => {
    if (quizAnswers[questionIndex] !== undefined) return;
    setQuizAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
  };

  const answeredQuizCount = Object.keys(quizAnswers).length;
  const correctQuizCount = quizQuestions.reduce((acc, q, idx) => {
    return acc + (quizAnswers[idx] === q.correctIndex ? 1 : 0);
  }, 0);

  // Coupon toggle
  const toggleCouponClaim = (index: number) => {
    setClaimedCoupons((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const littleThings = data.littleThings ?? [];
  const coupons = data.coupons ?? [];
  const activeLightboxMemory =
    lightboxIndex !== null ? data.memories[lightboxIndex] ?? null : null;

  const splitIndex = Math.ceil(data.memories.length / 2);
  const firstStripMemories = data.memories.slice(0, splitIndex);
  const secondStripMemories = data.memories.slice(splitIndex);

  const revealedMessages = activeThread.messages.slice(0, visibleMessagesCount);
  const nextHiddenMessage = activeThread.messages[visibleMessagesCount];
  const voiceCaptionIndex = Math.min(
    VOICE_NOTE_CAPTIONS.length - 1,
    Math.floor((voiceElapsedSec / VOICE_NOTE_DURATION_SEC) * VOICE_NOTE_CAPTIONS.length)
  );
  const voiceProgressPercent = Math.min(
    100,
    Math.round((voiceElapsedSec / VOICE_NOTE_DURATION_SEC) * 100)
  );

  const counterUnits = [
    { label: "HARI", value: elapsed ? String(elapsed.days) : "--" },
    { label: "JAM", value: elapsed ? padTwo(elapsed.hours) : "--" },
    { label: "MENIT", value: elapsed ? padTwo(elapsed.minutes) : "--" },
    { label: "DETIK", value: elapsed ? padTwo(elapsed.seconds) : "--" },
  ];

  const keypadDigits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <div
      className={cn(
        "relative w-full bg-[#F8F7F4] font-jakarta text-[#18181B] selection:bg-[#D9FDD3] selection:text-[#18181B]",
        embedded
          ? isUnlocked
            ? "min-h-[760px]"
            : "h-[760px] overflow-hidden"
          : "min-h-[100dvh]"
      )}
    >
      {/* Optional 4-digit PIN lock gate (only rendered when passcodePin is non-empty) */}
      <AnimatePresence>
        {!isUnlocked && hasPin && (
          <motion.div
            key="chat-pin-gate"
            initial={{ opacity: 1 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0, transition: { duration: 0.15 } }
                : { opacity: 0, y: -32, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }
            }
            className={cn(
              "inset-0 z-30 flex items-center justify-center bg-[#F8F7F4]/98 px-4 py-8 backdrop-blur-xs",
              embedded ? "absolute" : "fixed"
            )}
          >
            <motion.div
              key={shakeCount}
              initial={prefersReducedMotion ? false : { opacity: 1, y: 12 }}
              animate={
                pinError && !prefersReducedMotion
                  ? { opacity: 1, y: 0, x: [0, -8, 8, -6, 6, -3, 3, 0] }
                  : { opacity: 1, y: 0, x: 0 }
              }
              transition={{ duration: 0.35 }}
              className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_20px_50px_rgba(24,24,27,0.08)] sm:p-8"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#059669] text-white">
                <Lock size={22} weight="bold" />
              </div>

              <div className="text-center">
                <p className="font-mono text-xs font-medium tracking-wider text-[#059669] uppercase">
                  Arsip Chat Pribadi
                </p>
                <h2 className="font-archivo mt-1.5 text-2xl font-bold tracking-tight text-[#18181B]">
                  {data.partnerOne} & {data.partnerTwo}
                </h2>
                <p className="mt-1.5 text-sm text-[#52525B]">
                  Masukin 4 digit PIN buat buka arsip chat dan photobox kita.
                </p>
              </div>

              <div className="mt-6 flex justify-center gap-3" aria-label="Kolom 4 digit PIN">
                {[0, 1, 2, 3].map((slot) => {
                  const filled = slot < pinInput.length;
                  return (
                    <div
                      key={slot}
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl border text-lg font-semibold transition-colors",
                        pinError
                          ? "border-rose-400 bg-rose-50 text-rose-600"
                          : filled
                            ? "border-[#059669] bg-[#D9FDD3] text-[#059669]"
                            : "border-[#E5E7EB] bg-[#F8F7F4] text-zinc-400"
                      )}
                    >
                      {filled ? (
                        <Heart size={15} weight="fill" className="text-[#059669]" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-xs bg-zinc-300" />
                      )}
                    </div>
                  );
                })}
              </div>

              {pinError && (
                <p role="alert" className="mt-3 text-center text-xs font-medium text-rose-600">
                  PIN belum pas nih, coba inget tanggal spesial kita ya.
                </p>
              )}

              <div className="mx-auto mt-6 grid max-w-[260px] grid-cols-3 gap-2.5">
                {keypadDigits.map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleDigitPress(digit)}
                    className="flex h-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white font-mono text-base font-semibold text-[#18181B] transition-colors hover:border-[#059669]/50 hover:bg-[#D9FDD3]/40 active:scale-[0.97]"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleBackspace}
                  aria-label="Hapus digit"
                  className="flex h-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#F8F7F4] text-[#52525B] transition-colors hover:bg-zinc-200/70"
                >
                  <Backspace size={18} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDigitPress("0")}
                  className="flex h-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white font-mono text-base font-semibold text-[#18181B] transition-colors hover:border-[#059669]/50 hover:bg-[#D9FDD3]/40 active:scale-[0.97]"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => submitPin(pinInput)}
                  aria-label="Buka arsip"
                  className="flex h-11 items-center justify-center rounded-xl bg-[#059669] text-white transition-colors hover:bg-[#047857] active:scale-[0.97]"
                >
                  <Check size={18} weight="bold" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={cn(!isUnlocked && hasPin ? "pointer-events-none select-none blur-xs" : "")}>
        {/* Section 1: Chat Header & Live Counter Hero */}
        <header className="sticky top-0 z-20 border-b border-[#E5E7EB] bg-[#F8F7F4]/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex shrink-0 -space-x-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#F8F7F4] bg-[#18181B] font-archivo text-sm font-bold text-white">
                  {getInitials(data.partnerOne)}
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#F8F7F4] bg-[#059669] font-archivo text-sm font-bold text-white">
                  {getInitials(data.partnerTwo)}
                </div>
              </div>
              <div className="min-w-0">
                <p className="truncate font-archivo text-base font-bold tracking-tight text-[#18181B] sm:text-lg">
                  {data.partnerOne} & {data.partnerTwo}
                </p>
                <p className="truncate text-xs text-[#52525B]">
                  Aktif terus kalau soal kamu
                </p>
              </div>
            </div>

            <div className="hidden shrink-0 text-right sm:block">
              <p className="font-mono text-[11px] font-medium tracking-wider text-[#52525B] uppercase">
                Terhubung Sejak
              </p>
              <p className="font-mono text-xs font-semibold text-[#18181B]">
                {formatAnniversaryDate(data.anniversaryDate)}
              </p>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl space-y-16 px-4 pt-8 pb-24 sm:space-y-20 sm:px-6 sm:pt-12">
          {/* Hero Intro + Live Duration Counter */}
          <section aria-labelledby="hero-chat-heading" className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
              <div className="space-y-4 lg:col-span-7">
                <p className="font-mono text-xs font-semibold tracking-wider text-[#059669] uppercase">
                  Arsip Chat & Photobox Kita
                </p>
                <h1
                  id="hero-chat-heading"
                  className="font-archivo text-3xl leading-[1.12] font-bold tracking-tight text-[#18181B] sm:text-5xl"
                >
                  {data.heroHeadline}
                </h1>
                <p className="max-w-2xl text-base leading-relaxed text-[#3F3F46] sm:text-lg">
                  {data.openingNote}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-medium text-[#52525B]">
                  <MusicNotes size={16} weight="fill" className="shrink-0 text-[#059669]" />
                  <span>Lagu kita:</span>
                  <span className="font-semibold text-[#18181B]">
                    {data.songDedication.title} - {data.songDedication.artist}
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_8px_24px_rgba(24,24,27,0.04)] sm:p-5">
                  <div className="mb-3 flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
                    <span className="font-mono text-[11px] font-semibold tracking-wider text-[#52525B] uppercase">
                      Durasi Obrolan Kita
                    </span>
                    <span className="font-mono text-xs font-medium text-[#059669]">
                      {formatAnniversaryDate(data.anniversaryDate)}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {counterUnits.map((unit) => (
                      <div
                        key={unit.label}
                        className="rounded-xl border border-[#E5E7EB] bg-[#F8F7F4] px-2 py-3 text-center"
                      >
                        <div className="font-mono tabular-nums text-xl font-bold text-[#18181B] sm:text-2xl">
                          {unit.value}
                        </div>
                        <div className="mt-1 font-mono text-[10px] font-semibold tracking-wider text-[#52525B]">
                          {unit.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Interactive Chat Replay Window + Voice Note */}
          <section aria-labelledby="chat-replay-heading" className="space-y-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <div className="flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-[#059669] uppercase">
                  <ChatCircleDots size={16} weight="fill" />
                  <span>Putar Ulang Obrolan</span>
                </div>
                <h2
                  id="chat-replay-heading"
                  className="font-archivo mt-1 text-2xl font-bold tracking-tight text-[#18181B] sm:text-3xl"
                >
                  Arsip Chat yang Nggak Pernah Dihapus
                </h2>
              </div>

              <button
                type="button"
                onClick={handleReplayChat}
                className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[#059669] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#047857] active:scale-[0.98] sm:self-auto"
              >
                <ArrowCounterClockwise size={15} weight="bold" />
                <span>{isReplaying ? "Sedang Diputar..." : "Putar Ulang Chat"}</span>
              </button>
            </div>

            <motion.div
              initial={prefersReducedMotion || embedded ? false : { opacity: 1, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: "some" }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_14px_34px_rgba(24,24,27,0.05)]"
            >
              {/* Topic Tabs */}
              <div
                role="tablist"
                aria-label="Topik obrolan"
                className="flex overflow-x-auto border-b border-[#E5E7EB] bg-white px-3 pt-2 sm:px-5"
              >
                {chatThreads.map((thread, idx) => {
                  const isActive = idx === safeThreadIndex;
                  return (
                    <button
                      key={thread.topic}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => handleSelectThread(idx)}
                      className={cn(
                        "relative shrink-0 px-4 py-3 text-sm font-semibold transition-colors",
                        isActive
                          ? "text-[#059669]"
                          : "text-[#52525B] hover:text-[#18181B]"
                      )}
                    >
                      <span>{thread.topic}</span>
                      {isActive && (
                        <motion.span
                          layoutId="chatTopicTab"
                          transition={{ type: "spring", stiffness: 420, damping: 32 }}
                          className="absolute right-2 bottom-0 left-2 h-0.5 bg-[#059669]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Chat Stream Body */}
              <div
                style={{
                  backgroundImage:
                    "radial-gradient(rgba(24,24,27,0.06) 1px, transparent 1px)",
                  backgroundSize: "18px 18px",
                }}
                className="space-y-3 bg-[#EFEAE2] p-4 sm:p-6"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="h-px flex-1 bg-black/10" />
                  <span className="font-mono text-[10px] font-semibold tracking-wider text-[#52525B] uppercase">
                    Topik: {activeThread.topic}
                  </span>
                  <span className="h-px flex-1 bg-black/10" />
                </div>

                {revealedMessages.map((msg, idx) => {
                  const isOne = msg.sender === "one";
                  const senderName = isOne ? data.partnerOne : data.partnerTwo;
                  return (
                    <motion.div
                      key={`${activeThread.topic}-${idx}`}
                      initial={
                        prefersReducedMotion || embedded
                          ? false
                          : { opacity: 1, y: 12 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className={cn(
                        "flex flex-col",
                        isOne ? "items-end" : "items-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-4 py-2.5 shadow-[0_1px_2px_rgba(24,24,27,0.08)] sm:max-w-[72%]",
                          isOne
                            ? "rounded-tr-xs bg-[#D9FDD3] text-[#18181B]"
                            : "rounded-tl-xs border border-[#E5E7EB] bg-[#FFFFFF] text-[#18181B]"
                        )}
                      >
                        <p className="text-[11px] font-bold text-[#059669]">
                          {senderName}
                        </p>
                        <p className="mt-0.5 text-sm leading-relaxed sm:text-[15px]">
                          {msg.text}
                        </p>
                        <div className="mt-1 flex items-center justify-end gap-1 font-mono text-[10px] text-[#52525B]">
                          <span>{msg.time}</span>
                          {isOne && (
                            <Checks
                              size={14}
                              weight="bold"
                              aria-label="Dibaca"
                              className="text-[#059669]"
                            />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Typing indicator while replaying */}
                {isReplaying && nextHiddenMessage && (
                  <div
                    className={cn(
                      "flex",
                      nextHiddenMessage.sender === "one"
                        ? "justify-end"
                        : "justify-start"
                    )}
                  >
                    <div
                      aria-label="Sedang mengetik"
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-2xl px-4 py-3 shadow-xs",
                        nextHiddenMessage.sender === "one"
                          ? "rounded-tr-xs bg-[#D9FDD3]"
                          : "rounded-tl-xs border border-[#E5E7EB] bg-white"
                      )}
                    >
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#52525B] [animation-delay:0ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#52525B] [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#52525B] [animation-delay:300ms]" />
                    </div>
                  </div>
                )}

                {/* Interactive Voice Note Card inside the chat stream */}
                {!isReplaying && (
                  <div className="flex flex-col items-end pt-1">
                    <div className="w-full max-w-[340px] rounded-2xl rounded-tr-xs bg-[#D9FDD3] p-3.5 text-[#18181B] shadow-[0_1px_2px_rgba(24,24,27,0.08)] sm:max-w-[380px]">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#059669]">
                          <Microphone size={13} weight="fill" />
                          <span>Voice Note dari {data.partnerOne}</span>
                        </span>
                        <span className="font-mono tabular-nums text-[10px] font-medium text-[#52525B]">
                          0:{padTwo(voiceElapsedSec)} / 0:{padTwo(VOICE_NOTE_DURATION_SEC)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={toggleVoiceNote}
                          aria-label={
                            isVoicePlaying ? "Jeda voice note" : "Putar voice note"
                          }
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#059669] text-white transition-transform hover:bg-[#047857] active:scale-95"
                        >
                          {isVoicePlaying ? (
                            <Pause size={16} weight="fill" />
                          ) : (
                            <Play size={16} weight="fill" className="translate-x-0.5" />
                          )}
                        </button>

                        <div className="flex-1 space-y-1.5">
                          <div
                            aria-hidden="true"
                            className="flex h-8 items-center gap-1"
                          >
                            {VOICE_NOTE_BAR_HEIGHTS.map((height, barIdx) => {
                              const barThreshold =
                                ((barIdx + 1) / VOICE_NOTE_BAR_HEIGHTS.length) * 100;
                              const isPassed = voiceProgressPercent >= barThreshold;
                              return (
                                <motion.span
                                  key={barIdx}
                                  animate={
                                    isVoicePlaying && !prefersReducedMotion
                                      ? {
                                          scaleY: [0.55, 1.15, 0.7, 1],
                                        }
                                      : { scaleY: 1 }
                                  }
                                  transition={
                                    isVoicePlaying
                                      ? {
                                          repeat: Infinity,
                                          duration: 0.65 + (barIdx % 4) * 0.12,
                                          ease: "easeInOut",
                                        }
                                      : { duration: 0.2 }
                                  }
                                  style={{ height: `${Math.round((height / 100) * 28)}px` }}
                                  className={cn(
                                    "w-1.5 flex-1 origin-center rounded-xs transition-colors",
                                    isPassed || isVoicePlaying
                                      ? "bg-[#059669]"
                                      : "bg-[#18181B]/25"
                                  )}
                                />
                              );
                            })}
                          </div>
                          <div className="h-1 w-full overflow-hidden rounded-full bg-black/10">
                            <div
                              style={{ width: `${voiceProgressPercent}%` }}
                              className="h-full bg-[#059669] transition-all duration-300"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-black/10 pt-2">
                        <p className="text-xs italic text-[#3F3F46]">
                          &ldquo;{VOICE_NOTE_CAPTIONS[voiceCaptionIndex]}&rdquo;
                        </p>
                        <div className="flex shrink-0 items-center gap-1 font-mono text-[10px] text-[#52525B]">
                          <span>21.05</span>
                          <Checks size={14} weight="bold" className="text-[#059669]" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </section>

          {/* Section 3: Photobox 4-Cut Studio Strip & Album */}
          <section aria-labelledby="photobox-heading" className="space-y-6">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <div className="flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-[#059669] uppercase">
                  <Camera size={16} weight="fill" />
                  <span>Photobox Studio Strip</span>
                </div>
                <h2
                  id="photobox-heading"
                  className="font-archivo mt-1 text-2xl font-bold tracking-tight text-[#18181B] sm:text-3xl"
                >
                  Enam Frame Favorit Kita Berdua
                </h2>
              </div>
              <p className="text-xs font-medium text-[#52525B]">
                Klik salah satu foto buat lihat versi penuhnya
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {[
                { label: "STRIP A", items: firstStripMemories, offset: 0 },
                { label: "STRIP B", items: secondStripMemories, offset: splitIndex },
              ].map((strip) => (
                <motion.div
                  key={strip.label}
                  initial={
                    prefersReducedMotion || embedded ? false : { opacity: 1, y: 12 }
                  }
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: "some" }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl border border-zinc-800 bg-[#18181B] p-4 text-white shadow-[0_18px_42px_rgba(24,24,27,0.16)] sm:p-5"
                >
                  <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-2.5 font-mono text-[11px] tracking-widest text-zinc-400">
                    <span>{strip.label}</span>
                    <span>
                      {data.partnerOne.toUpperCase()} + {data.partnerTwo.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {strip.items.map((memory, localIdx) => {
                      const globalIdx = strip.offset + localIdx;
                      return (
                        <button
                          key={`${memory.imageUrl}-${globalIdx}`}
                          type="button"
                          onClick={() => openLightbox(globalIdx)}
                          className="group block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
                        >
                          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-zinc-900">
                            <img
                              src={memory.imageUrl}
                              alt={memory.caption}
                              loading="eager"
                              className="absolute inset-0 block h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            />
                          </div>
                          <div className="mt-2 flex items-start justify-between gap-3">
                            <p className="text-xs leading-relaxed text-zinc-200 sm:text-sm">
                              {memory.caption}
                            </p>
                            <span className="shrink-0 font-mono text-[11px] font-medium text-emerald-400">
                              {padTwo(globalIdx + 1)} / {memory.dateLabel}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-3 font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
                    <span>PHOTOBOX ARCHIVE</span>
                    <span>NO FILTER NEEDED</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Section 4: Mini Quiz "Seberapa Hafal Kamu Soal Kita?" */}
          <section aria-labelledby="quiz-heading" className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <div className="flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-[#059669] uppercase">
                  <Question size={16} weight="fill" />
                  <span>Mini Kuis Pasangan</span>
                </div>
                <h2
                  id="quiz-heading"
                  className="font-archivo mt-1 text-2xl font-bold tracking-tight text-[#18181B] sm:text-3xl"
                >
                  Seberapa Hafal Kamu Soal Kita?
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2 font-mono text-xs font-semibold text-[#18181B]">
                  {answeredQuizCount === quizQuestions.length
                    ? `${correctQuizCount} / ${quizQuestions.length} Hafal Banget!`
                    : `${correctQuizCount} / ${quizQuestions.length} Benar`}
                </div>
                {answeredQuizCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetQuiz}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2 text-xs font-semibold text-[#18181B] transition-colors hover:border-[#059669] hover:text-[#059669]"
                  >
                    <ArrowCounterClockwise size={14} weight="bold" />
                    <span>Ulang Kuis</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {quizQuestions.map((item, qIdx) => {
                const selectedOpt = quizAnswers[qIdx];
                const isAnswered = selectedOpt !== undefined;
                const isRight = selectedOpt === item.correctIndex;

                return (
                  <motion.div
                    key={`${item.question}-${qIdx}`}
                    initial={
                      prefersReducedMotion || embedded ? false : { opacity: 1, y: 12 }
                    }
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: "some" }}
                    transition={{ duration: 0.35 }}
                    className="flex flex-col justify-between rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_6px_20px_rgba(24,24,27,0.03)]"
                  >
                    <div>
                      <span className="font-mono text-xs font-bold text-[#059669]">
                        SOAL {padTwo(qIdx + 1)}
                      </span>
                      <h3 className="mt-2 text-base font-bold leading-snug text-[#18181B]">
                        {item.question}
                      </h3>

                      <div className="mt-4 space-y-2">
                        {item.options.map((opt, optIdx) => {
                          const isChosen = selectedOpt === optIdx;
                          const isCorrectOption = optIdx === item.correctIndex;

                          let btnStyle =
                            "border-[#E5E7EB] bg-[#F8F7F4] text-[#18181B] hover:border-[#059669]/60 hover:bg-[#D9FDD3]/35";
                          if (isAnswered) {
                            if (isCorrectOption) {
                              btnStyle =
                                "border-[#059669] bg-[#D9FDD3] text-[#18181B] font-semibold";
                            } else if (isChosen) {
                              btnStyle =
                                "border-[#E11D48] bg-rose-50 text-[#E11D48] font-semibold";
                            } else {
                              btnStyle =
                                "border-[#E5E7EB] bg-[#F8F7F4]/60 text-[#52525B]";
                            }
                          }

                          return (
                            <button
                              key={`${qIdx}-${optIdx}`}
                              type="button"
                              disabled={isAnswered}
                              onClick={() => handleSelectQuizOption(qIdx, optIdx)}
                              className={cn(
                                "flex w-full items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left text-xs transition-colors sm:text-sm",
                                btnStyle
                              )}
                            >
                              <span>{opt}</span>
                              {isAnswered && isCorrectOption && (
                                <CheckCircle
                                  size={16}
                                  weight="fill"
                                  className="shrink-0 text-[#059669]"
                                />
                              )}
                              {isAnswered && isChosen && !isCorrectOption && (
                                <XCircle
                                  size={16}
                                  weight="fill"
                                  className="shrink-0 text-[#E11D48]"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {isAnswered && (
                      <div
                        className={cn(
                          "mt-4 rounded-xl border p-3 text-xs leading-relaxed",
                          isRight
                            ? "border-[#059669]/30 bg-[#D9FDD3]/45 text-[#18181B]"
                            : "border-[#E11D48]/30 bg-rose-50 text-[#18181B]"
                        )}
                      >
                        <p className="font-bold">
                          {isRight ? "Tepat banget!" : "Hampir bener nih."}
                        </p>
                        <p className="mt-0.5 text-[#3F3F46]">{item.reaction}</p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Section 5: Pesan Berbintang (littleThings & loveReasons) */}
          <section aria-labelledby="starred-heading" className="space-y-6">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-[#059669] uppercase">
                <Star size={16} weight="fill" />
                <span>Pesan Berbintang</span>
              </div>
              <h2
                id="starred-heading"
                className="font-archivo mt-1 text-2xl font-bold tracking-tight text-[#18181B] sm:text-3xl"
              >
                Catatan Kecil yang Disimpan Rapi
              </h2>
            </div>

            <div className="grid grid-cols-1 border-y border-[#E5E7EB] lg:grid-cols-2">
              {/* Left Column: littleThings */}
              <div className="border-b border-[#E5E7EB] py-6 lg:border-r lg:border-b-0 lg:pr-8">
                <p className="font-mono text-xs font-semibold tracking-wider text-[#52525B] uppercase">
                  Kebiasaan Kecil Kamu
                </p>
                <div className="mt-4 divide-y divide-[#E5E7EB]">
                  {littleThings.map((item, idx) => (
                    <div key={`${item.label}-${idx}`} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-xs font-bold text-[#059669]">
                          {padTwo(idx + 1)}
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-[#18181B] sm:text-base">
                            {item.label}
                          </h3>
                          <p className="mt-1 text-sm leading-relaxed text-[#52525B]">
                            {item.detail}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: loveReasons */}
              <div className="py-6 lg:pl-8">
                <p className="font-mono text-xs font-semibold tracking-wider text-[#52525B] uppercase">
                  Kenapa Betah Sama Kamu
                </p>
                <div className="mt-4 divide-y divide-[#E5E7EB]">
                  {data.loveReasons.map((reason, idx) => (
                    <div key={`${reason}-${idx}`} className="py-3.5 first:pt-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 font-mono text-xs font-bold text-[#059669]">
                          #{idx + 1}
                        </span>
                        <p className="text-sm leading-relaxed text-[#18181B] sm:text-[15px]">
                          {reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: Voucher Traktiran + Pinned Closing Message */}
          <section aria-labelledby="vouchers-closing-heading" className="space-y-12">
            {coupons.length > 0 && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-[#059669] uppercase">
                    <Ticket size={16} weight="fill" />
                    <span>Voucher Traktiran</span>
                  </div>
                  <h2
                    id="vouchers-closing-heading"
                    className="font-archivo mt-1 text-2xl font-bold tracking-tight text-[#18181B] sm:text-3xl"
                  >
                    Tinggal Klaim Kapan Pun Kamu Mau
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {coupons.map((coupon, idx) => {
                    const isClaimed = Boolean(claimedCoupons[idx]);
                    return (
                      <motion.div
                        key={`${coupon.title}-${idx}`}
                        initial={
                          prefersReducedMotion || embedded
                            ? false
                            : { opacity: 1, y: 12 }
                        }
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: "some" }}
                        transition={{ duration: 0.35 }}
                        className={cn(
                          "relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-dashed p-5 transition-colors",
                          isClaimed
                            ? "border-[#059669]/40 bg-[#D9FDD3]/40"
                            : "border-[#E5E7EB] bg-white"
                        )}
                      >
                        <div>
                          <div className="flex items-center justify-between font-mono text-[11px] font-semibold text-[#52525B]">
                            <span>KUPON #{padTwo(idx + 1)}</span>
                            <span>BERLAKU SELAMANYA</span>
                          </div>
                          <h3 className="mt-3 text-base font-bold text-[#18181B]">
                            {coupon.title}
                          </h3>
                          <p className="mt-1.5 text-sm leading-relaxed text-[#52525B]">
                            {coupon.note}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleCouponClaim(idx)}
                          className={cn(
                            "mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors active:scale-[0.98]",
                            isClaimed
                              ? "border border-[#059669]/30 bg-white text-[#059669]"
                              : "bg-[#18181B] text-white hover:bg-[#059669]"
                          )}
                        >
                          <Check size={14} weight="bold" />
                          <span>{isClaimed ? "Batalkan Klaim" : "Klaim Voucher"}</span>
                        </button>

                        <AnimatePresence>
                          {isClaimed && (
                            <motion.div
                              initial={
                                prefersReducedMotion
                                  ? { opacity: 1 }
                                  : { opacity: 0, scale: 1.35, rotate: -12 }
                              }
                              animate={{ opacity: 1, scale: 1, rotate: -8 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{
                                type: "spring",
                                stiffness: 360,
                                damping: 22,
                              }}
                              className="pointer-events-none absolute top-4 right-3 rounded-md border-2 border-[#059669] bg-white/95 px-2.5 py-1 font-mono text-[11px] font-bold tracking-wider text-[#059669] shadow-xs"
                            >
                              SUDAH DIKLAIM
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pinned Closing Message */}
            <motion.div
              initial={prefersReducedMotion || embedded ? false : { opacity: 1, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: "some" }}
              transition={{ duration: 0.45 }}
              className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_14px_38px_rgba(24,24,27,0.05)] sm:p-9"
            >
              <div className="flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-[#059669] uppercase">
                <PushPin size={15} weight="fill" />
                <span>Pesan Tersemat</span>
              </div>

              <h2 className="font-archivo mt-2 text-2xl font-bold tracking-tight text-[#18181B]">
                Buat {data.partnerTwo}
              </h2>

              <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-[#3F3F46] sm:text-lg">
                {data.closingLetter}
              </p>

              <div className="mt-6 flex items-center justify-between border-t border-[#E5E7EB] pt-4 text-xs text-[#52525B]">
                <span>Yang selalu nunggu chat dari kamu,</span>
                <span className="font-archivo text-sm font-bold text-[#18181B]">
                  {data.partnerOne}
                </span>
              </div>
            </motion.div>
          </section>
        </main>

        <footer className="border-t border-[#E5E7EB] bg-white/80 py-6 text-center text-xs text-[#52525B]">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-[#059669]"
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

      {/* Fullscreen Lightbox for Photobox Strips */}
      <AnimatePresence>
        {activeLightboxMemory && lightboxIndex !== null && (
          <motion.div
            key="chat-photobox-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label="Detail foto photobox"
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-xs"
          >
            <motion.div
              initial={
                prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }
              }
              animate={{ opacity: 1, scale: 1 }}
              exit={
                prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }
              }
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
              className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-[#18181B] p-4 text-white shadow-2xl sm:p-6"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono tabular-nums text-xs font-semibold text-zinc-400">
                  {padTwo(lightboxIndex + 1)} / {padTwo(totalMemories)} -{" "}
                  {activeLightboxMemory.dateLabel}
                </span>
                <button
                  type="button"
                  onClick={closeLightbox}
                  aria-label="Tutup foto"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 text-zinc-200 transition-colors hover:bg-zinc-800"
                >
                  <X size={16} weight="bold" />
                </button>
              </div>

              <div className="max-h-[65dvh] overflow-hidden rounded-lg bg-zinc-900">
                <img
                  src={activeLightboxMemory.imageUrl}
                  alt={activeLightboxMemory.caption}
                  loading="eager"
                  className="max-h-[65dvh] w-full object-contain"
                />
              </div>

              <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <p className="text-sm leading-relaxed text-zinc-200 sm:text-base">
                  {activeLightboxMemory.caption}
                </p>

                {totalMemories > 1 && (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={goPrevPhoto}
                      aria-label="Foto sebelumnya"
                      className="inline-flex items-center gap-1 rounded-xl border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:bg-zinc-800"
                    >
                      <CaretLeft size={14} weight="bold" />
                      <span>Prev</span>
                    </button>
                    <button
                      type="button"
                      onClick={goNextPhoto}
                      aria-label="Foto berikutnya"
                      className="inline-flex items-center gap-1 rounded-xl bg-[#059669] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#047857]"
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

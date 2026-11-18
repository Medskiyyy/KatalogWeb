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
  Backspace,
  Calendar,
  Camera,
  CaretLeft,
  CaretRight,
  ChatCircleDots,
  Check,
  CheckCircle,
  Checks,
  Heart,
  Lock,
  LockOpen,
  Microphone,
  MusicNotes,
  PaperPlaneTilt,
  Pause,
  Play,
  PushPin,
  Question,
  X,
  XCircle,
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

interface ChatMessageItem {
  sender: "one" | "two";
  text: string;
  time: string;
}

interface FloatingHeart {
  id: number;
  offsetX: number;
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

const VOICE_NOTE_BAR_HEIGHTS = [
  32, 68, 48, 86, 54, 92, 44, 78, 62, 88, 50, 74, 40, 64, 52, 76,
];

const QUICK_REPLY_OPTIONS = [
  {
    prompt: "Kangen banget tau",
    reply: "Sini deh bentar lagi aku samperin, jangan cemberut dulu ya.",
  },
  {
    prompt: "Nanti pulang cari kuah hangat yuk",
    reply: "Gas! Aku udah siapin helm cadangan, nanti langsung meluncur cari yang berkuah.",
  },
  {
    prompt: "Makasih udah selalu ada ya",
    reply: "Sama-sama terus kok. Selama kamu butuh temen cerita, chat aku selalu paling depan.",
  },
];

const WEEKEND_POLL_OPTIONS = [
  {
    id: 0,
    label: "Kulineran pecel lele + es krim pinggir jalan",
    partnerPreVoted: true,
  },
  {
    id: 1,
    label: "Nonton bioskop + mampir Photobox ulang",
    partnerPreVoted: true,
  },
  {
    id: 2,
    label: "Keliling kota sore cari angin naik motor",
    partnerPreVoted: false,
  },
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
        {
          sender: "one" as const,
          text: "Namanya juga usaha biar obrolannya nggak berhenti di 'oh oke' doang.",
          time: "20.17",
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
        {
          sender: "one" as const,
          text: "Oke siap, mie kuah hangat deket taman ya, paham banget kode kamu.",
          time: "18.46",
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
        {
          sender: "one" as const,
          text: "Yaudah sini telepon bentar biar kamu nggak bengong sendirian.",
          time: "23.42",
        },
      ],
    },
  ];
}

const FALLBACK_QUIZ_QUESTIONS = [
  {
    question:
      "Kalau bilang 'terserah' pas ditanya mau makan apa, ujungnya paling sering milih apa?",
    options: ["Salad dingin", "Mie kuah hangat atau pecel lele", "Roti tawar"],
    correctIndex: 1,
    reaction:
      "Akurat 100 persen, jawaban 'terserah' hampir selalu berujung ke kuah hangat.",
  },
  {
    question: "Bagian mana yang paling dicari duluan pas masuk kafe bareng?",
    options: [
      "Pojokan deket colokan HP",
      "Meja paling depan",
      "Kursi tanpa sandaran",
    ],
    correctIndex: 0,
    reaction:
      "Baterai HP aman berarti sesi ngobrol bisa jalan terus tanpa drama.",
  },
  {
    question: "Topik andalan pas teleponan malam sebelum tidur biasanya bahas apa?",
    options: [
      "Laporan pajak",
      "Hal receh seharian dan rencana jajan",
      "Berita cuaca luar negeri",
    ],
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

function formatAudioClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${padTwo(secs)}`;
}

function getInitials(name: string): string {
  const cleaned = name.trim();
  if (!cleaned) return "?";
  return cleaned[0].toUpperCase();
}

function getCurrentClockLabel(): string {
  const now = new Date();
  return `${padTwo(now.getHours())}.${padTwo(now.getMinutes())}`;
}

interface VoiceNoteBubbleProps {
  id: string;
  src: string;
  senderName: string;
  align: "left" | "right";
  timeLabel: string;
  subtitle: string;
  activeVoiceId: string | null;
  onActivateVoice: (id: string | null) => void;
  prefersReducedMotion: boolean;
}

function VoiceNoteBubble({
  id,
  src,
  senderName,
  align,
  timeLabel,
  subtitle,
  activeVoiceId,
  onActivateVoice,
  prefersReducedMotion,
}: VoiceNoteBubbleProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<1 | 1.5>(1);

  const isRight = align === "right";

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (activeVoiceId !== id && !el.paused) {
      el.pause();
    }
  }, [activeVoiceId, id]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.playbackRate = playbackRate;
  }, [playbackRate]);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (!el.paused) {
      el.pause();
      onActivateVoice(null);
      return;
    }
    onActivateVoice(id);
    el.playbackRate = playbackRate;
    const playPromise = el.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        setIsPlaying(false);
        onActivateVoice(null);
      });
    }
  };

  const toggleSpeed = () => {
    const nextRate: 1 | 1.5 = playbackRate === 1 ? 1.5 : 1;
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const handleSeek = (nextValue: number) => {
    const el = audioRef.current;
    if (!el || !Number.isFinite(nextValue)) return;
    el.currentTime = nextValue;
    setCurrentTime(nextValue);
  };

  const safeDuration = duration > 0 ? duration : 0;
  const progressRatio = safeDuration > 0 ? Math.min(1, currentTime / safeDuration) : 0;

  return (
    <div className={cn("flex flex-col pt-1", isRight ? "items-end" : "items-start")}>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={(event) => {
          const nextDur = event.currentTarget.duration;
          if (Number.isFinite(nextDur) && nextDur > 0) {
            setDuration(nextDur);
          }
        }}
        onTimeUpdate={(event) => {
          setCurrentTime(event.currentTarget.currentTime);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
          if (activeVoiceId === id) {
            onActivateVoice(null);
          }
        }}
      />

      <div
        className={cn(
          "w-full max-w-[350px] rounded-2xl p-3.5 text-[#18181B] shadow-[0_1px_2px_rgba(24,24,27,0.08)] sm:max-w-[390px]",
          isRight
            ? "rounded-tr-xs bg-[#D9FDD3]"
            : "rounded-tl-xs border border-[#E5E7EB] bg-white"
        )}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#059669]">
            <Microphone size={13} weight="fill" />
            <span>Voice Note {senderName}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSpeed}
              aria-label={`Ubah kecepatan voice note ${senderName}`}
              className="rounded-md border border-black/15 bg-white/75 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#18181B] transition-colors hover:border-[#059669] hover:text-[#059669]"
            >
              {playbackRate}x
            </button>
            <span className="font-mono text-[10px] font-medium text-[#52525B] tabular-nums">
              {formatAudioClock(currentTime)} / {formatAudioClock(safeDuration)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={
              isPlaying
                ? `Jeda voice note ${senderName}`
                : `Putar voice note ${senderName}`
            }
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#059669] text-white transition-transform hover:bg-[#047857] active:scale-95"
          >
            {isPlaying ? (
              <Pause size={16} weight="fill" />
            ) : (
              <Play size={16} weight="fill" className="translate-x-0.5" />
            )}
          </button>

          <div className="flex-1 space-y-1.5">
            <div aria-hidden="true" className="flex h-7 items-center gap-1">
              {VOICE_NOTE_BAR_HEIGHTS.map((height, barIdx) => {
                const barThreshold =
                  (barIdx + 1) / VOICE_NOTE_BAR_HEIGHTS.length;
                const isPassed = progressRatio >= barThreshold;
                return (
                  <motion.span
                    key={barIdx}
                    animate={
                      isPlaying && !prefersReducedMotion
                        ? {
                            scaleY: [0.55, 1.15, 0.7, 1],
                          }
                        : { scaleY: 1 }
                    }
                    transition={
                      isPlaying
                        ? {
                            repeat: Infinity,
                            duration: 0.65 + (barIdx % 4) * 0.12,
                            ease: "easeInOut",
                          }
                        : { duration: 0.2 }
                    }
                    style={{ height: `${Math.round((height / 100) * 26)}px` }}
                    className={cn(
                      "w-1 flex-1 origin-center rounded-xs transition-colors",
                      isPassed || isPlaying ? "bg-[#059669]" : "bg-[#18181B]/25"
                    )}
                  />
                );
              })}
            </div>

            <input
              type="range"
              min={0}
              max={safeDuration > 0 ? safeDuration : 1}
              step={0.05}
              value={safeDuration > 0 ? Math.min(currentTime, safeDuration) : 0}
              disabled={safeDuration <= 0}
              onChange={(event) => handleSeek(Number(event.currentTarget.value))}
              aria-label={`Posisi audio voice note ${senderName}`}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-black/15 accent-[#059669] disabled:cursor-default"
            />
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-black/10 pt-2">
          <p className="text-xs italic text-[#3F3F46]">&ldquo;{subtitle}&rdquo;</p>
          <div className="flex shrink-0 items-center gap-1 font-mono text-[10px] text-[#52525B]">
            <span>{timeLabel}</span>
            {isRight && (
              <Checks size={14} weight="bold" className="text-[#059669]" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BucinChatTemplate({
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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [selectedPollVotes, setSelectedPollVotes] = useState<
    Record<number, boolean>
  >({});

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 30,
    restDelta: 0.001,
  });

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

  const [activeVoiceId, setActiveVoiceId] = useState<string | null>(null);

  const [quickMessages, setQuickMessages] = useState<ChatMessageItem[]>([]);
  const [isAutoReplying, setIsAutoReplying] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const autoReplyTimerRef = useRef<number | null>(null);
  const heartIdRef = useRef(0);

  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

  const [stripFlashActive, setStripFlashActive] = useState(false);
  const [stripSnapCount, setStripSnapCount] = useState(0);
  const stripFlashTimerRef = useRef<number | null>(null);

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
    return () => {
      if (autoReplyTimerRef.current !== null) {
        window.clearTimeout(autoReplyTimerRef.current);
      }
      if (stripFlashTimerRef.current !== null) {
        window.clearTimeout(stripFlashTimerRef.current);
      }
    };
  }, []);

  const unlockChatArchive = useCallback(() => {
    playSfx("chat-pop");
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

  const clearReplayTimer = useCallback(() => {
    if (replayIntervalRef.current !== null) {
      window.clearInterval(replayIntervalRef.current);
      replayIntervalRef.current = null;
    }
  }, []);

  const handleSelectThread = (index: number) => {
    if (index === safeThreadIndex) return;
    playSfx("paper-flip");
    clearReplayTimer();
    setIsReplaying(false);
    setActiveThreadIndex(index);
    const targetThread = chatThreads[index] ?? chatThreads[0];
    setVisibleMessagesCount(targetThread.messages.length);
  };

  const handleReplayChat = () => {
    playSfx("paper-flip");
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

  const handleQuickReply = (prompt: string, reply: string) => {
    playSfx("chat-pop");
    const clock = getCurrentClockLabel();

    setQuickMessages((prev) => [
      ...prev,
      { sender: "two", text: prompt, time: clock },
    ]);

    const spawned: FloatingHeart[] = [-36, 0, 36].map((offsetX) => {
      heartIdRef.current += 1;
      return { id: heartIdRef.current, offsetX };
    });
    setFloatingHearts((prev) => [...prev, ...spawned]);
    window.setTimeout(() => {
      const ids = new Set(spawned.map((h) => h.id));
      setFloatingHearts((prev) => prev.filter((item) => !ids.has(item.id)));
    }, 1100);

    if (autoReplyTimerRef.current !== null) {
      window.clearTimeout(autoReplyTimerRef.current);
    }
    setIsAutoReplying(true);
    autoReplyTimerRef.current = window.setTimeout(() => {
      setIsAutoReplying(false);
      playSfx("chat-pop");
      setQuickMessages((prev) => [
        ...prev,
        { sender: "one", text: reply, time: getCurrentClockLabel() },
      ]);
      autoReplyTimerRef.current = null;
    }, 1000);
  };

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

  const handleReshootStrip = () => {
    playSfx("camera-shutter");
    setStripSnapCount((prev) => prev + 1);
    setStripFlashActive(true);
    if (stripFlashTimerRef.current !== null) {
      window.clearTimeout(stripFlashTimerRef.current);
    }
    stripFlashTimerRef.current = window.setTimeout(() => {
      setStripFlashActive(false);
      stripFlashTimerRef.current = null;
    }, 260);
  };

  const handleSelectQuizOption = (questionIndex: number, optionIndex: number) => {
    if (quizAnswers[questionIndex] !== undefined) return;
    const isCorrect = optionIndex === quizQuestions[questionIndex]?.correctIndex;
    playSfx(isCorrect ? "quiz-ding" : "chat-pop");
    setQuizAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleResetQuiz = () => {
    playSfx("paper-flip");
    setQuizAnswers({});
  };

  const answeredQuizCount = Object.keys(quizAnswers).length;
  const correctQuizCount = quizQuestions.reduce((acc, q, idx) => {
    return acc + (quizAnswers[idx] === q.correctIndex ? 1 : 0);
  }, 0);

  const togglePollVote = (optionId: number) => {
    playSfx("chat-pop");
    setSelectedPollVotes((prev) => ({
      ...prev,
      [optionId]: !prev[optionId],
    }));
  };

  const hasUserVotedPoll = WEEKEND_POLL_OPTIONS.some((opt) =>
    Boolean(selectedPollVotes[opt.id])
  );
  const totalPollVotes = WEEKEND_POLL_OPTIONS.reduce(
    (sum, opt) =>
      sum + (opt.partnerPreVoted ? 1 : 0) + (selectedPollVotes[opt.id] ? 1 : 0),
    0
  );

  const milestones = data.milestones ?? [];
  const littleThings = data.littleThings ?? [];
  const activeLightboxMemory =
    lightboxIndex !== null ? data.memories[lightboxIndex] ?? null : null;

  const heroPrimaryMemory = data.memories[0];
  const heroSecondaryMemory = data.memories[1] ?? data.memories[0];
  const inlineChatMemoryIndex = data.memories[2] ? 2 : 0;
  const inlineChatMemory = data.memories[inlineChatMemoryIndex];

  const splitIndex = Math.ceil(data.memories.length / 2);
  const firstStripMemories = data.memories.slice(0, splitIndex);
  const secondStripMemories = data.memories.slice(splitIndex);

  const revealedMessages = activeThread.messages.slice(0, visibleMessagesCount);
  const nextHiddenMessage = activeThread.messages[visibleMessagesCount];

  const counterUnits = [
    { label: "HARI", value: elapsed ? String(elapsed.days) : "--" },
    { label: "JAM", value: elapsed ? padTwo(elapsed.hours) : "--" },
    { label: "MENIT", value: elapsed ? padTwo(elapsed.minutes) : "--" },
    { label: "DETIK", value: elapsed ? padTwo(elapsed.seconds) : "--" },
  ];

  const recapStats = [
    {
      label: "Total Hari Aktif",
      value: elapsed ? String(elapsed.days) : "--",
    },
    {
      label: "Frame Favorit",
      value: String(data.memories.length),
    },
    {
      label: "Kuis Terjawab",
      value: `${answeredQuizCount}/${quizQuestions.length}`,
    },
    {
      label: "Alasan Sayang",
      value: String(data.loveReasons.length),
    },
  ];

  const keypadDigits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const lockscreenPreviewOne =
    chatThreads[0]?.messages[0]?.text ??
    "Daftar titipan barusan nyasar ke chat kamu haha, btw udah makan belum?";
  const lockscreenPreviewTwo =
    "Aku rapihin semua arsip chat, voice note, sama photobox kita di sini ya.";

  const partnerOneVoiceUrl =
    data.voiceNoteUrl?.trim() || "/audio/voicenotes/dimas-vn.mp3";

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
      {/* Top Reading Progress Bar */}
      {!embedded && (
        <motion.div
          aria-hidden="true"
          style={{ scaleX: prefersReducedMotion ? scrollYProgress : scaleX }}
          className="fixed top-0 right-0 left-0 z-40 h-[3px] origin-left bg-[#059669]"
        />
      )}

      {/* Opening Lockscreen Gate (!embedded) */}
      <AnimatePresence>
        {!isUnlocked && (
          <motion.div
            key="chat-lock-gate"
            initial={{ opacity: 1 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0, transition: { duration: 0.15 } }
                : {
                    opacity: 0,
                    y: -28,
                    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                  }
            }
            className={cn(
              "inset-0 z-30 flex items-center justify-center bg-[#F8F7F4]/95 px-4 py-8 backdrop-blur-sm",
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
                          "flex h-12 w-12 items-center justify-center rounded-xl border text-lg font-semibold transition-colors",
                          pinError
                            ? "border-rose-400 bg-rose-50 text-rose-600"
                            : filled
                              ? "border-[#059669] bg-[#D9FDD3] text-[#059669]"
                              : "border-[#E5E7EB] bg-[#F8F7F4] text-zinc-400"
                        )}
                      >
                        {filled ? (
                          <Heart
                            size={15}
                            weight="fill"
                            className="text-[#059669]"
                          />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-xs bg-zinc-300" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {pinError && (
                  <p
                    role="alert"
                    className="mt-3 text-center text-xs font-medium text-rose-600"
                  >
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
            ) : (
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 1, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="w-full max-w-md rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-[0_24px_60px_rgba(24,24,27,0.1)] sm:p-8"
              >
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#059669] text-white">
                      <ChatCircleDots size={18} weight="fill" />
                    </div>
                    <div>
                      <p className="font-mono text-[10px] font-semibold tracking-wider text-[#059669] uppercase">
                        Notifikasi Masuk
                      </p>
                      <p className="font-archivo text-base font-bold text-[#18181B]">
                        {data.partnerOne} & {data.partnerTwo}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] font-medium text-[#52525B]">
                    {formatAnniversaryDate(data.anniversaryDate)}
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8F7F4] p-3.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#18181B] font-archivo text-[11px] font-bold text-white">
                          {getInitials(data.partnerOne)}
                        </span>
                        <span className="text-xs font-bold text-[#18181B]">
                          {data.partnerOne}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-[#52525B]">
                        20.11
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-snug text-[#3F3F46]">
                      {lockscreenPreviewOne}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#059669]/25 bg-[#D9FDD3]/45 p-3.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#059669] font-archivo text-[11px] font-bold text-white">
                          {getInitials(data.partnerOne)}
                        </span>
                        <span className="text-xs font-bold text-[#18181B]">
                          {data.partnerOne}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] font-semibold text-[#059669]">
                        Baru saja
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-snug text-[#18181B]">
                      {lockscreenPreviewTwo}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={unlockChatArchive}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#059669] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#047857] active:scale-[0.99]"
                >
                  <LockOpen size={17} weight="bold" />
                  <span>Buka Ruang Chat Kita</span>
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className={cn(
          !isUnlocked ? "pointer-events-none select-none blur-xs" : ""
        )}
      >
        {/* Sticky Chat Header */}
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
          {/* Section 1: Visual Split Hero */}
          <section aria-labelledby="hero-chat-heading">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              {/* Left Column: Intro + Song + Live Counter */}
              <div className="space-y-5 lg:col-span-6">
                <p className="font-mono text-xs font-semibold tracking-wider text-[#059669] uppercase">
                  Arsip Chat & Photobox Kita
                </p>
                <h1
                  id="hero-chat-heading"
                  className="font-archivo text-3xl leading-[1.12] font-bold tracking-tight text-[#18181B] sm:text-5xl"
                >
                  {data.heroHeadline}
                </h1>
                <p className="text-base leading-relaxed text-[#3F3F46] sm:text-lg">
                  {data.openingNote}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#52525B]">
                  <MusicNotes
                    size={16}
                    weight="fill"
                    className="shrink-0 text-[#059669]"
                  />
                  <span>Lagu kita:</span>
                  <span className="font-semibold text-[#18181B]">
                    {data.songDedication.title} - {data.songDedication.artist}
                  </span>
                </div>

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
                        <div className="font-mono text-xl font-bold text-[#18181B] tabular-nums sm:text-2xl">
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

              {/* Right Column: Photobox & Floating Chat Collage */}
              <div className="lg:col-span-6">
                <div className="relative mx-auto max-w-md py-6 sm:py-8">
                  <div className="grid grid-cols-12 items-start gap-3">
                    {heroPrimaryMemory && (
                      <motion.button
                        type="button"
                        onClick={() => openLightbox(0)}
                        initial={
                          prefersReducedMotion || embedded
                            ? false
                            : { y: 12, rotate: -3 }
                        }
                        animate={{ y: 0, rotate: -3 }}
                        whileHover={
                          prefersReducedMotion
                            ? undefined
                            : { rotate: -1, y: -4 }
                        }
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 22,
                        }}
                        className="col-span-7 rounded-xl border border-[#E5E7EB] bg-white p-2.5 text-left shadow-[0_14px_32px_rgba(24,24,27,0.1)]"
                      >
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-zinc-100">
                          <img
                            src={heroPrimaryMemory.imageUrl}
                            alt={heroPrimaryMemory.caption}
                            loading="eager"
                            className="absolute inset-0 block h-full w-full object-cover"
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2 px-0.5">
                          <span className="truncate text-[11px] font-semibold text-[#18181B]">
                            {heroPrimaryMemory.dateLabel}
                          </span>
                          <span className="font-mono text-[10px] text-[#059669]">
                            FRAME 01
                          </span>
                        </div>
                      </motion.button>
                    )}

                    {heroSecondaryMemory && (
                      <motion.button
                        type="button"
                        onClick={() => openLightbox(data.memories[1] ? 1 : 0)}
                        initial={
                          prefersReducedMotion || embedded
                            ? false
                            : { y: 18, rotate: 3 }
                        }
                        animate={{ y: 12, rotate: 3 }}
                        whileHover={
                          prefersReducedMotion ? undefined : { rotate: 1, y: 6 }
                        }
                        transition={{
                          type: "spring",
                          stiffness: 240,
                          damping: 22,
                        }}
                        className="col-span-5 mt-8 rounded-xl border border-[#E5E7EB] bg-white p-2.5 text-left shadow-[0_14px_32px_rgba(24,24,27,0.1)]"
                      >
                        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-zinc-100">
                          <img
                            src={heroSecondaryMemory.imageUrl}
                            alt={heroSecondaryMemory.caption}
                            loading="eager"
                            className="absolute inset-0 block h-full w-full object-cover"
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-1 px-0.5">
                          <span className="truncate text-[11px] font-semibold text-[#18181B]">
                            {heroSecondaryMemory.dateLabel}
                          </span>
                          <span className="font-mono text-[10px] text-[#059669]">
                            02
                          </span>
                        </div>
                      </motion.button>
                    )}
                  </div>

                  {/* Floating Mini Chat Previews */}
                  <motion.div
                    initial={prefersReducedMotion ? false : { y: 10 }}
                    animate={
                      prefersReducedMotion ? { y: 0 } : { y: [0, -5, 0] }
                    }
                    transition={
                      prefersReducedMotion
                        ? { duration: 0.2 }
                        : {
                            repeat: Infinity,
                            duration: 4.5,
                            ease: "easeInOut",
                          }
                    }
                    className="relative z-10 -mt-3 ml-2 max-w-[260px] rounded-2xl rounded-tr-xs border border-[#059669]/20 bg-[#D9FDD3] px-3.5 py-2.5 shadow-[0_10px_24px_rgba(24,24,27,0.08)] sm:ml-6"
                  >
                    <p className="text-[10px] font-bold text-[#059669]">
                      {data.partnerOne}
                    </p>
                    <p className="mt-0.5 text-xs leading-snug text-[#18181B]">
                      {chatThreads[0]?.messages[0]?.text ??
                        "Maaf barusan chat nyasar ke kamu haha."}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={prefersReducedMotion ? false : { y: 10 }}
                    animate={
                      prefersReducedMotion ? { y: 0 } : { y: [0, 5, 0] }
                    }
                    transition={
                      prefersReducedMotion
                        ? { duration: 0.2 }
                        : {
                            repeat: Infinity,
                            duration: 5.2,
                            ease: "easeInOut",
                          }
                    }
                    className="relative z-10 mt-2.5 mr-1 ml-auto max-w-[260px] rounded-2xl rounded-tl-xs border border-[#E5E7EB] bg-white px-3.5 py-2.5 shadow-[0_10px_24px_rgba(24,24,27,0.08)] sm:mr-4"
                  >
                    <p className="text-[10px] font-bold text-[#059669]">
                      {data.partnerTwo}
                    </p>
                    <p className="mt-0.5 text-xs leading-snug text-[#18181B]">
                      {chatThreads[0]?.messages[1]?.text ??
                        "Hahaha aman kok, kirain mau nitip sekalian."}
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Asymmetric 12-Col Messenger (7) + Recap & Milestones Timeline (5) */}
          <section aria-labelledby="chat-replay-heading" className="space-y-6">
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
                <span>
                  {isReplaying ? "Sedang Diputar..." : "Putar Ulang Chat"}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
              {/* Left 7 Cols: Messenger Stream */}
              <motion.div
                initial={
                  prefersReducedMotion || embedded
                    ? false
                    : { opacity: 1, y: 12 }
                }
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: "some" }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_14px_34px_rgba(24,24,27,0.05)] lg:col-span-7"
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
                            transition={{
                              type: "spring",
                              stiffness: 420,
                              damping: 32,
                            }}
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
                      TOPIK: {activeThread.topic}
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
                            "max-w-[85%] rounded-2xl px-4 py-2.5 shadow-[0_1px_2px_rgba(24,24,27,0.08)] sm:max-w-[78%]",
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

                  {/* Inline Photo Attachment Bubble + 2 Real Spoken Voice Notes */}
                  {!isReplaying && (
                    <>
                      {inlineChatMemory && (
                        <div className="flex flex-col items-end pt-1">
                          <div className="w-full max-w-[290px] rounded-2xl rounded-tr-xs bg-[#D9FDD3] p-2.5 text-[#18181B] shadow-[0_1px_2px_rgba(24,24,27,0.08)] sm:max-w-[320px]">
                            <p className="mb-1.5 px-1 text-[11px] font-bold text-[#059669]">
                              {data.partnerOne}
                            </p>
                            <button
                              type="button"
                              onClick={() => openLightbox(inlineChatMemoryIndex)}
                              className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
                            >
                              <img
                                src={inlineChatMemory.imageUrl}
                                alt={inlineChatMemory.caption}
                                loading="eager"
                                className="absolute inset-0 block h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                              />
                            </button>
                            <p className="mt-2 px-1 text-xs leading-relaxed text-[#18181B]">
                              {inlineChatMemory.caption}
                            </p>
                            <div className="mt-1 flex items-center justify-between px-1 font-mono text-[10px] text-[#52525B]">
                              <span>{inlineChatMemory.dateLabel}</span>
                              <span className="inline-flex items-center gap-1">
                                <span>20.48</span>
                                <Checks
                                  size={14}
                                  weight="bold"
                                  className="text-[#059669]"
                                />
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <VoiceNoteBubble
                        id="vn-partner-one"
                        src={partnerOneVoiceUrl}
                        senderName={data.partnerOne}
                        align="right"
                        timeLabel="21.05"
                        subtitle="Kalau lagi capek sama kerjaan, dengerin ini bentar ya."
                        activeVoiceId={activeVoiceId}
                        onActivateVoice={setActiveVoiceId}
                        prefersReducedMotion={prefersReducedMotion}
                      />

                      <VoiceNoteBubble
                        id="vn-partner-two"
                        src="/audio/voicenotes/alya-vn.mp3"
                        senderName={data.partnerTwo}
                        align="left"
                        timeLabel="21.06"
                        subtitle="Makasih ya udah selalu nyariin aku duluan tiap sore."
                        activeVoiceId={activeVoiceId}
                        onActivateVoice={setActiveVoiceId}
                        prefersReducedMotion={prefersReducedMotion}
                      />

                      {/* Quick-Reply Appended Bubbles */}
                      {quickMessages.map((qMsg, idx) => {
                        const isOne = qMsg.sender === "one";
                        const senderName = isOne
                          ? data.partnerOne
                          : data.partnerTwo;
                        return (
                          <motion.div
                            key={`quick-${idx}`}
                            initial={
                              prefersReducedMotion ? false : { opacity: 1, y: 8 }
                            }
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22 }}
                            className={cn(
                              "flex flex-col",
                              isOne ? "items-end" : "items-start"
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-[85%] rounded-2xl px-4 py-2.5 shadow-[0_1px_2px_rgba(24,24,27,0.08)] sm:max-w-[78%]",
                                isOne
                                  ? "rounded-tr-xs bg-[#D9FDD3] text-[#18181B]"
                                  : "rounded-tl-xs border border-[#E5E7EB] bg-white text-[#18181B]"
                              )}
                            >
                              <p className="text-[11px] font-bold text-[#059669]">
                                {senderName}
                              </p>
                              <p className="mt-0.5 text-sm leading-relaxed sm:text-[15px]">
                                {qMsg.text}
                              </p>
                              <div className="mt-1 flex items-center justify-end gap-1 font-mono text-[10px] text-[#52525B]">
                                <span>{qMsg.time}</span>
                                {isOne && (
                                  <Checks
                                    size={14}
                                    weight="bold"
                                    className="text-[#059669]"
                                  />
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}

                      {isAutoReplying && (
                        <div className="flex justify-end">
                          <div
                            aria-label={`${data.partnerOne} sedang mengetik`}
                            className="inline-flex items-center gap-1.5 rounded-2xl rounded-tr-xs bg-[#D9FDD3] px-4 py-3 shadow-xs"
                          >
                            <span className="h-2 w-2 animate-bounce rounded-full bg-[#52525B] [animation-delay:0ms]" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-[#52525B] [animation-delay:150ms]" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-[#52525B] [animation-delay:300ms]" />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Interactive Quick-Reply Input Bar */}
                <div className="relative border-t border-[#E5E7EB] bg-white p-3.5 sm:px-5 sm:py-4">
                  <div className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2">
                    <AnimatePresence>
                      {floatingHearts.map((heart) => (
                        <motion.span
                          key={heart.id}
                          initial={{ opacity: 0.95, y: 0, x: heart.offsetX, scale: 0.8 }}
                          animate={{
                            opacity: 0,
                            y: -58,
                            x: heart.offsetX,
                            scale: 1.15,
                          }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.95, ease: "easeOut" }}
                          className="absolute text-[#059669]"
                        >
                          <Heart size={18} weight="fill" />
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#52525B]">
                    <PaperPlaneTilt
                      size={13}
                      weight="fill"
                      className="text-[#059669]"
                    />
                    <span>Kirim balasan cepat ke {data.partnerOne}:</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {QUICK_REPLY_OPTIONS.map((option) => (
                      <button
                        key={option.prompt}
                        type="button"
                        onClick={() =>
                          handleQuickReply(option.prompt, option.reply)
                        }
                        className="rounded-xl border border-[#E5E7EB] bg-[#F8F7F4] px-3 py-2 text-left text-xs font-medium text-[#18181B] transition-colors hover:border-[#059669] hover:bg-[#D9FDD3]/50 active:scale-[0.98]"
                      >
                        {option.prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Right 5 Cols: Rekap Obrolan Kita + Milestones Vertical Dashed Timeline */}
              <div className="space-y-6 lg:col-span-5">
                {/* Rekap Obrolan Kita Stat Grid */}
                <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_28px_rgba(24,24,27,0.04)]">
                  <p className="font-mono text-xs font-semibold tracking-wider text-[#059669] uppercase">
                    Rekap Obrolan Kita
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {recapStats.map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-xl border border-[#E5E7EB] bg-[#F8F7F4] p-3.5"
                      >
                        <p className="font-archivo text-2xl font-bold text-[#18181B] tabular-nums">
                          {stat.value}
                        </p>
                        <p className="mt-1 text-xs font-medium text-[#52525B]">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Milestones Vertical Dashed Timeline */}
                {milestones.length > 0 && (
                  <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_28px_rgba(24,24,27,0.04)]">
                    <div className="flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-[#059669] uppercase">
                      <Calendar size={15} weight="fill" />
                      <span>Linimasa Cerita Kita</span>
                    </div>
                    <h3 className="font-archivo mt-1 text-lg font-bold text-[#18181B]">
                      Jejak Momen dari Awal Chat
                    </h3>

                    <div className="mt-5 ml-2 space-y-4 border-l-2 border-dashed border-[#059669]/35 pl-5">
                      {milestones.map((milestone, idx) => (
                        <motion.div
                          key={`${milestone.title}-${idx}`}
                          whileHover={
                            prefersReducedMotion ? undefined : { y: -3 }
                          }
                          transition={{
                            type: "spring",
                            stiffness: 340,
                            damping: 24,
                          }}
                          className="relative rounded-xl border border-[#E5E7EB] bg-[#F8F7F4] p-3.5 transition-shadow hover:border-[#059669]/40 hover:bg-white hover:shadow-md"
                        >
                          <span
                            aria-hidden="true"
                            className="absolute top-4 -left-[27px] h-3 w-3 rounded-full border-2 border-white bg-[#059669] shadow-xs"
                          />
                          <p className="font-mono text-[10px] font-semibold tracking-wider text-[#059669] uppercase">
                            {milestone.dateLabel}
                          </p>
                          <h4 className="mt-0.5 text-sm font-bold text-[#18181B]">
                            {milestone.title}
                          </h4>
                          <p className="mt-1 text-xs leading-relaxed text-[#52525B]">
                            {milestone.description}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Section 3: Interactive Photobox Strips */}
          <section aria-labelledby="photobox-heading" className="relative space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
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

              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs font-medium text-[#52525B]">
                  Klik salah satu foto buat lihat versi penuhnya
                </p>
                <button
                  type="button"
                  onClick={handleReshootStrip}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#18181B] bg-[#18181B] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#059669] hover:border-[#059669] active:scale-[0.98]"
                >
                  <Camera size={15} weight="fill" />
                  <span>Jepret Ulang Strip</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <AnimatePresence>
                {stripFlashActive && (
                  <motion.div
                    key="photobox-flash"
                    initial={{ opacity: 0.9 }}
                    animate={{ opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-20 rounded-2xl bg-white"
                  />
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {[
                  {
                    label: "STRIP A",
                    items: firstStripMemories,
                    offset: 0,
                    tiltClass: "-rotate-1 hover:rotate-0",
                  },
                  {
                    label: "STRIP B",
                    items: secondStripMemories,
                    offset: splitIndex,
                    tiltClass: "rotate-1 hover:rotate-0",
                  },
                ].map((strip) => (
                  <motion.div
                    key={`${strip.label}-${stripSnapCount}`}
                    initial={
                      prefersReducedMotion
                        ? false
                        : stripSnapCount > 0
                          ? { scale: 0.97, y: 10 }
                          : { opacity: 1, y: 12 }
                    }
                    animate={{ scale: 1, y: 0 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: "some" }}
                    transition={{
                      type: "spring",
                      stiffness: 320,
                      damping: 22,
                    }}
                    className={cn(
                      "rounded-2xl border border-zinc-800 bg-[#18181B] p-4 text-white shadow-[0_18px_42px_rgba(24,24,27,0.16)] transition-transform duration-300 sm:p-5",
                      strip.tiltClass
                    )}
                  >
                    <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-2.5 font-mono text-[11px] tracking-widest text-zinc-400">
                      <span>{strip.label}</span>
                      <span>
                        {data.partnerOne.toUpperCase()} +{" "}
                        {data.partnerTwo.toUpperCase()}
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
                      prefersReducedMotion || embedded
                        ? false
                        : { opacity: 1, y: 12 }
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
                              onClick={() =>
                                handleSelectQuizOption(qIdx, optIdx)
                              }
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

          {/* Section 5: Pinned Notes (littleThings & loveReasons) */}
          <section aria-labelledby="starred-heading" className="space-y-6">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-[#059669] uppercase">
                <Heart size={16} weight="fill" />
                <span>Catatan Favorit</span>
              </div>
              <h2
                id="starred-heading"
                className="font-archivo mt-1 text-2xl font-bold tracking-tight text-[#18181B] sm:text-3xl"
              >
                Catatan Kecil yang Disimpan Rapi
              </h2>
            </div>

            <div className="grid grid-cols-1 border-y border-[#E5E7EB] lg:grid-cols-2">
              <div className="border-b border-[#E5E7EB] py-6 lg:border-r lg:border-b-0 lg:pr-8">
                <p className="font-mono text-xs font-semibold tracking-wider text-[#52525B] uppercase">
                  Kebiasaan Kecil Kamu
                </p>
                <div className="mt-4 divide-y divide-[#E5E7EB]">
                  {littleThings.map((item, idx) => (
                    <div
                      key={`${item.label}-${idx}`}
                      className="py-4 first:pt-0 last:pb-0"
                    >
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

              <div className="py-6 lg:pl-8">
                <p className="font-mono text-xs font-semibold tracking-wider text-[#52525B] uppercase">
                  Kenapa Betah Sama Kamu
                </p>
                <div className="mt-4 divide-y divide-[#E5E7EB]">
                  {data.loveReasons.map((reason, idx) => (
                    <div
                      key={`${reason}-${idx}`}
                      className="py-3.5 first:pt-0 last:pb-0"
                    >
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

          {/* Section 6: Polling Malam Minggu Kita + Pinned Closing Message */}
          <section
            aria-labelledby="weekend-poll-heading"
            className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start"
          >
            {/* WhatsApp-Style Live Group Poll Card */}
            <motion.div
              initial={
                prefersReducedMotion || embedded ? false : { opacity: 1, y: 12 }
              }
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: "some" }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_14px_38px_rgba(24,24,27,0.05)] lg:col-span-6"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-[#059669] uppercase">
                  <ChatCircleDots size={15} weight="fill" />
                  <span>POLLING RENCANA KENCAN</span>
                </div>
                <span className="font-mono text-[11px] font-medium text-[#52525B] tabular-nums">
                  {totalPollVotes} suara masuk
                </span>
              </div>

              <h2
                id="weekend-poll-heading"
                className="font-archivo mt-1.5 text-2xl font-bold tracking-tight text-[#18181B]"
              >
                Vote Malam Minggu Besok
              </h2>
              <p className="mt-1 text-xs text-[#52525B]">
                Pilih satu atau lebih rencana yang paling pengen kamu jalanin bareng.
              </p>

              <div className="mt-5 space-y-3">
                {WEEKEND_POLL_OPTIONS.map((option) => {
                  const userVoted = Boolean(selectedPollVotes[option.id]);
                  const voteCount =
                    (option.partnerPreVoted ? 1 : 0) + (userVoted ? 1 : 0);
                  const percent =
                    totalPollVotes > 0
                      ? Math.round((voteCount / totalPollVotes) * 100)
                      : 0;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => togglePollVote(option.id)}
                      aria-pressed={userVoted}
                      className={cn(
                        "block w-full rounded-xl border p-3.5 text-left transition-colors active:scale-[0.99]",
                        userVoted
                          ? "border-[#059669] bg-[#D9FDD3]/35"
                          : "border-[#E5E7EB] bg-[#F8F7F4] hover:border-[#059669]/45"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <span
                            className={cn(
                              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                              userVoted
                                ? "border-[#059669] bg-[#059669] text-white"
                                : "border-zinc-300 bg-white text-transparent"
                            )}
                          >
                            <Check size={12} weight="bold" />
                          </span>
                          <span className="text-sm font-semibold leading-snug text-[#18181B]">
                            {option.label}
                          </span>
                        </div>

                        <div className="flex shrink-0 items-center gap-1.5">
                          <div className="flex -space-x-1.5">
                            {option.partnerPreVoted && (
                              <span
                                title={data.partnerOne}
                                className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-[#18181B] font-archivo text-[10px] font-bold text-white"
                              >
                                {getInitials(data.partnerOne)}
                              </span>
                            )}
                            {userVoted && (
                              <span
                                title={data.partnerTwo}
                                className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-[#059669] font-archivo text-[10px] font-bold text-white"
                              >
                                {getInitials(data.partnerTwo)}
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-xs font-bold text-[#18181B] tabular-nums">
                            {voteCount}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-black/10">
                        <motion.div
                          initial={false}
                          animate={{ width: `${percent}%` }}
                          transition={
                            prefersReducedMotion
                              ? { duration: 0.1 }
                              : {
                                  type: "spring",
                                  stiffness: 260,
                                  damping: 26,
                                }
                          }
                          className="h-full rounded-full bg-[#059669]"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#E5E7EB] pt-3 text-xs">
                <span
                  className={cn(
                    "font-medium",
                    hasUserVotedPoll ? "text-[#059669]" : "text-[#52525B]"
                  )}
                >
                  {hasUserVotedPoll
                    ? "Siap, langsung masuk jadwal akhir pekan kita!"
                    : `${data.partnerOne} udah vote duluan, tinggal pilihan kamu.`}
                </span>
                <span className="font-mono text-[10px] text-[#52525B]">
                  21.10
                </span>
              </div>
            </motion.div>

            {/* Pinned Closing Message */}
            <motion.div
              initial={
                prefersReducedMotion || embedded ? false : { opacity: 1, y: 12 }
              }
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: "some" }}
              transition={{ duration: 0.45 }}
              className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_14px_38px_rgba(24,24,27,0.05)] sm:p-8 lg:col-span-6"
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

      {/* Fullscreen Lightbox for Photobox Strips & Chat Photo */}
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
                <span className="font-mono text-xs font-semibold text-zinc-400 tabular-nums">
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

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowCounterClockwise,
  Cake,
  Camera,
  Check,
  CheckSquare,
  Confetti,
  Gift,
  Microphone,
  MusicNotes,
  Quotes,
  Square,
  VinylRecord,
} from "@phosphor-icons/react";
import { MusicPlayer } from "@/components/MusicPlayer";
import type { UltahSiteConfig } from "@/lib/schema";
import { cn } from "@/lib/utils";

type ConfettiShape = "rect" | "circle" | "triangle" | "streamer";

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: ConfettiShape;
  rotation: number;
  vr: number;
  life: number;
  maxLife: number;
}

const CONFETTI_COLORS = [
  "#FFD60A",
  "#FF4D6D",
  "#121212",
  "#FFFDF7",
  "#FF9F1C",
];

const CONFETTI_SHAPES: ConfettiShape[] = [
  "rect",
  "circle",
  "triangle",
  "streamer",
];

const CANDLE_FLAME_POSITIONS = [39.2, 44.6, 50.0, 55.6, 61.0];

export function UltahInteraktifTemplate({
  site,
  embedded = false,
}: {
  site: UltahSiteConfig;
  embedded?: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const { data } = site;

  const [candlesBlown, setCandlesBlown] = useState(false);
  const [giftTaps, setGiftTaps] = useState(0);
  const [isVoucherClaimed, setIsVoucherClaimed] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [checkedWishes, setCheckedWishes] = useState<number[]>([]);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<ConfettiParticle[]>([]);
  const confettiRafRef = useRef<number | null>(null);

  const micStreamRef = useRef<MediaStream | null>(null);
  const micAudioCtxRef = useRef<AudioContext | null>(null);
  const micRafRef = useRef<number | null>(null);
  const micBarRef = useRef<HTMLDivElement | null>(null);

  const memories = data.memories;
  const friendWishes = data.friendWishes;
  const wishChecklist = data.wishChecklist ?? [];
  const giftVoucher = data.giftVoucher;
  const cakeImageSrc = data.cakeImageUrl || "/demo/ultah-cake-stage.webp";
  const remainingMemoriesCount = Math.max(0, memories.length - 1);
  const isGiftOpened = giftTaps >= 3;

  const stopConfetti = useCallback(() => {
    if (confettiRafRef.current !== null) {
      window.cancelAnimationFrame(confettiRafRef.current);
      confettiRafRef.current = null;
    }
    particlesRef.current = [];
  }, []);

  const launchConfetti = useCallback(() => {
    if (prefersReducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    stopConfetti();

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const origins = [
      { x: width >= 1024 ? width * 0.68 : width * 0.5, y: Math.min(height * 0.44, 360) },
      { x: width * 0.18, y: height * 0.58 },
      { x: width * 0.85, y: height * 0.58 },
    ];

    const particles: ConfettiParticle[] = [];
    for (let i = 0; i < 120; i += 1) {
      const origin = origins[i % origins.length];
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.1;
      const speed = 5.5 + Math.random() * 11.5;
      particles.push({
        x: origin.x + (Math.random() - 0.5) * 80,
        y: origin.y + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.2,
        size: 7 + Math.random() * 7,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        shape: CONFETTI_SHAPES[i % CONFETTI_SHAPES.length],
        rotation: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.24,
        life: 0,
        maxLife: 115 + Math.random() * 55,
      });
    }
    particlesRef.current = particles;

    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      const active: ConfettiParticle[] = [];

      for (const p of particlesRef.current) {
        p.life += 1;
        if (p.life >= p.maxLife || p.y > height + 40) {
          continue;
        }
        p.vy += 0.27;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vr;

        const alpha = Math.max(0, 1 - p.life / p.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = "#121212";
        ctx.lineWidth = 1.4;

        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.44, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else if (p.shape === "triangle") {
          const half = p.size * 0.55;
          ctx.beginPath();
          ctx.moveTo(0, -half);
          ctx.lineTo(half, half);
          ctx.lineTo(-half, half);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else if (p.shape === "streamer") {
          ctx.fillRect(-p.size * 0.75, -p.size * 0.2, p.size * 1.5, p.size * 0.4);
          ctx.strokeRect(-p.size * 0.75, -p.size * 0.2, p.size * 1.5, p.size * 0.4);
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
          ctx.strokeRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
        }

        ctx.restore();
        active.push(p);
      }

      particlesRef.current = active;
      if (active.length > 0) {
        confettiRafRef.current = window.requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, width, height);
        confettiRafRef.current = null;
      }
    };

    confettiRafRef.current = window.requestAnimationFrame(tick);
  }, [prefersReducedMotion, stopConfetti]);

  const stopMicrophone = useCallback(() => {
    if (micRafRef.current !== null) {
      window.cancelAnimationFrame(micRafRef.current);
      micRafRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (micAudioCtxRef.current) {
      micAudioCtxRef.current.close().catch(() => {});
      micAudioCtxRef.current = null;
    }
    if (micBarRef.current) {
      micBarRef.current.style.width = "0%";
    }
    setIsListeningMic(false);
  }, []);

  const blowOutCandles = useCallback(() => {
    stopMicrophone();
    setMicError(null);
    setCandlesBlown(true);
    launchConfetti();
  }, [launchConfetti, stopMicrophone]);

  const relightCandles = useCallback(() => {
    stopMicrophone();
    stopConfetti();
    setMicError(null);
    setCandlesBlown(false);
  }, [stopConfetti, stopMicrophone]);

  const startMicDetection = useCallback(async () => {
    if (isListeningMic) {
      stopMicrophone();
      return;
    }

    setMicError(null);

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setMicError("Mic tidak tersedia, pencet tombol Tiup Lilinnya! aja ya.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioCtx) {
        stream.getTracks().forEach((track) => track.stop());
        setMicError("Mic tidak tersedia, pencet tombol Tiup Lilinnya! aja ya.");
        return;
      }

      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      micStreamRef.current = stream;
      micAudioCtxRef.current = ctx;
      setIsListeningMic(true);

      const dataArray = new Uint8Array(analyser.fftSize);
      let sustainedFrames = 0;

      const monitorVolume = () => {
        if (!micStreamRef.current || !micAudioCtxRef.current) return;
        analyser.getByteTimeDomainData(dataArray);

        let sumSquares = 0;
        for (let i = 0; i < dataArray.length; i += 1) {
          const centered = (dataArray[i] - 128) / 128;
          sumSquares += centered * centered;
        }
        const rms = Math.sqrt(sumSquares / dataArray.length);

        if (micBarRef.current) {
          const pct = Math.min(100, Math.round((rms / 0.25) * 100));
          micBarRef.current.style.width = `${pct}%`;
        }

        if (rms > 0.13) {
          sustainedFrames += 1;
        } else {
          sustainedFrames = Math.max(0, sustainedFrames - 1);
        }

        if (sustainedFrames >= 4 || rms > 0.26) {
          blowOutCandles();
          return;
        }

        micRafRef.current = window.requestAnimationFrame(monitorVolume);
      };

      micRafRef.current = window.requestAnimationFrame(monitorVolume);
    } catch {
      stopMicrophone();
      setMicError("Mic tidak tersedia, pencet tombol Tiup Lilinnya! aja ya.");
    }
  }, [blowOutCandles, isListeningMic, stopMicrophone]);

  useEffect(() => {
    return () => {
      stopMicrophone();
      stopConfetti();
    };
  }, [stopConfetti, stopMicrophone]);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const showPrevPhoto = useCallback(() => {
    if (memories.length === 0) return;
    setLightboxIndex((prev) =>
      prev === null ? 0 : (prev - 1 + memories.length) % memories.length
    );
  }, [memories.length]);

  const showNextPhoto = useCallback(() => {
    if (memories.length === 0) return;
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

  const handleGiftTap = () => {
    setGiftTaps((prev) => Math.min(3, prev + 1));
  };

  const toggleWishItem = (index: number) => {
    setCheckedWishes((prev) =>
      prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index]
    );
  };

  const age = data.turningAge;
  const ageStats = [
    { value: age.toLocaleString("id-ID"), label: "Tahun" },
    { value: (age * 12).toLocaleString("id-ID"), label: "Bulan" },
    { value: (age * 365).toLocaleString("id-ID"), label: "Hari" },
    { value: (age * 8760).toLocaleString("id-ID"), label: "Jam Bikin Rame Suasana" },
  ];

  const activeLightboxMemory =
    lightboxIndex !== null ? memories[lightboxIndex] ?? null : null;

  return (
    <div className="relative min-h-full bg-[#FFFDF7] font-jakarta text-[#121212] selection:bg-[#FFD60A] selection:text-[#121212]">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-50 h-full w-full"
      />

      <MusicPlayer
        track={site.musicTrack}
        autoPlayTrigger={candlesBlown}
        className="rounded-none border-2 border-[#121212] bg-[#FFD60A] font-jakarta text-xs font-extrabold text-[#121212] shadow-[4px_4px_0_#121212] hover:bg-[#ffe14d]"
      />

      {/* Section 1: Hero + Real Korean Cake Interactive Stage */}
      <section
        id="hero-stage"
        className={cn(
          "relative bg-[#FFFDF7] pt-14 pb-14 sm:pt-16 sm:pb-16",
          !embedded && "flex min-h-[100dvh] items-center"
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(#121212 1.25px, transparent 1.25px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left Column */}
            <div className="space-y-6 lg:col-span-6">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#FF4D6D] sm:text-sm">
                Kejutan Ulang Tahun Buat Kamu
              </p>

              <h1 className="font-archivo text-4xl font-extrabold leading-[1.06] tracking-tight text-[#121212] sm:text-5xl lg:text-[3.5rem]">
                Happy Birthday ke-{data.turningAge}, {data.celebrantName}!
              </h1>

              <p className="border-l-4 border-[#FF4D6D] pl-3.5 text-sm font-bold text-[#121212]/80 sm:text-base">
                Dari {data.senderName}, {data.birthDateLabel}
              </p>

              <AnimatePresence mode="wait">
                {candlesBlown ? (
                  <motion.div
                    key="wish-revealed"
                    initial={
                      prefersReducedMotion
                        ? { opacity: 1 }
                        : { opacity: 0, y: 14, scale: 0.98 }
                    }
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={
                      prefersReducedMotion
                        ? { duration: 0.1 }
                        : { type: "spring", stiffness: 280, damping: 22 }
                    }
                    className="border-2 border-[#121212] bg-[#FFD60A] p-6 shadow-[4px_4px_0_#121212]"
                  >
                    <h2 className="font-archivo text-base font-extrabold tracking-tight text-[#121212] sm:text-lg">
                      Ucapan Spesial Buat {data.celebrantName}
                    </h2>
                    <p className="mt-2.5 text-base font-semibold leading-relaxed text-[#121212] sm:text-lg">
                      {data.heroWish}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="wish-sealed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="border-2 border-dashed border-[#121212] bg-white/95 p-5 shadow-[4px_4px_0_#121212]"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border-2 border-[#121212] bg-[#FFD60A]">
                        <Cake size={18} weight="fill" aria-hidden="true" />
                      </div>
                      <p className="text-sm font-semibold leading-relaxed text-[#121212]/85 sm:text-base">
                        Tutup mata bentar, sebutin doa paling kenceng dalam hati,
                        terus tiup lilin di samping buat buka pesan rahasia!
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column: Real Cake Photo Stage */}
            <div className="lg:col-span-6">
              <div className="border-2 border-[#121212] bg-white shadow-[4px_4px_0_#121212] sm:shadow-[6px_6px_0_#121212]">
                <div className="flex items-center justify-between border-b-2 border-[#121212] bg-[#FFD60A] px-5 py-3">
                  <div className="inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide">
                    <Cake size={18} weight="fill" aria-hidden="true" />
                    <span>Kue Ulang Tahun</span>
                  </div>
                  <span className="font-archivo text-xs font-extrabold uppercase tracking-wider text-[#121212] tabular-nums sm:text-sm">
                    Umur {data.turningAge}
                  </span>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="relative aspect-[4/3] w-full overflow-hidden border-2 border-[#121212] bg-[#EFE9DD]">
                    <img
                      src={cakeImageSrc}
                      alt={`Kue ulang tahun ke-${data.turningAge} untuk ${data.celebrantName}`}
                      className="h-full w-full object-cover"
                    />

                    {/* 5 Natural Glowing Animated Flames aligned over the 5 candle wicks */}
                    {CANDLE_FLAME_POSITIONS.map((leftPct, idx) => (
                      <div
                        key={leftPct}
                        style={{ left: `${leftPct}%`, top: "7.5%" }}
                        aria-hidden="true"
                        className="pointer-events-none absolute flex h-[7.2%] w-[4.4%] -translate-x-1/2 items-end justify-center"
                      >
                        {!candlesBlown ? (
                          <div className="relative flex h-full w-full items-end justify-center">
                            <motion.div
                              animate={
                                prefersReducedMotion
                                  ? undefined
                                  : {
                                      opacity: [0.65, 0.95, 0.72, 0.9, 0.65],
                                      scale: [0.95, 1.12, 0.98, 1.08, 0.95],
                                    }
                              }
                              transition={{
                                duration: 1.1 + (idx % 3) * 0.2,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                              className="absolute -inset-x-[85%] -top-[55%] -bottom-[35%] rounded-full bg-[radial-gradient(circle,rgba(255,214,10,0.75)_0%,rgba(255,145,0,0.28)_48%,transparent_72%)]"
                            />
                            <motion.div
                              animate={
                                prefersReducedMotion
                                  ? undefined
                                  : {
                                      scaleY: [1, 1.16, 0.92, 1.1, 1],
                                      scaleX: [1, 0.9, 1.08, 0.94, 1],
                                      rotate: [0, -3.5, 3, -2, 0],
                                    }
                              }
                              transition={{
                                duration: 0.85 + (idx % 3) * 0.16,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                              style={{ transformOrigin: "50% 90%" }}
                              className="relative flex h-full w-[58%] items-end justify-center rounded-t-full rounded-b-[45%] bg-gradient-to-t from-[#FF6B00] via-[#FFB703] to-[#FFF5BA] shadow-[0_0_12px_rgba(255,183,3,0.9)]"
                            >
                              <div className="mb-[14%] h-[56%] w-[52%] rounded-t-full rounded-b-full bg-gradient-to-t from-[#FFD60A] to-[#FFFDF7]" />
                            </motion.div>
                          </div>
                        ) : (
                          <div className="relative flex h-full w-full items-end justify-center">
                            <motion.div
                              initial={
                                prefersReducedMotion
                                  ? { opacity: 0.35 }
                                  : { opacity: 0.8, y: 2, scale: 0.65 }
                              }
                              animate={
                                prefersReducedMotion
                                  ? { opacity: 0 }
                                  : { opacity: 0, y: -30, x: idx % 2 === 0 ? 6 : -6, scale: 1.7 }
                              }
                              transition={{ duration: 1.15, ease: "easeOut" }}
                              className="h-[60%] w-[70%] rounded-full bg-[#121212]/25 blur-[2.5px]"
                            />
                            {!prefersReducedMotion && (
                              <motion.div
                                initial={{ opacity: 0.65, y: 4, scale: 0.5 }}
                                animate={{
                                  opacity: 0,
                                  y: -42,
                                  x: idx % 2 === 0 ? -5 : 5,
                                  scale: 2,
                                }}
                                transition={{ duration: 1.45, delay: 0.12, ease: "easeOut" }}
                                className="absolute bottom-0 h-[55%] w-[60%] rounded-full bg-[#121212]/15 blur-[3px]"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Interactive Controls */}
                  <div className="mt-4 space-y-3">
                    {!candlesBlown ? (
                      <>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={blowOutCandles}
                            className="inline-flex cursor-pointer items-center justify-center gap-2 border-2 border-[#121212] bg-[#FF4D6D] px-4 py-3 text-sm font-extrabold text-[#FFFDF7] shadow-[4px_4px_0_#121212] transition-transform hover:bg-[#ff355a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#121212]"
                          >
                            <Confetti size={18} weight="bold" aria-hidden="true" />
                            <span>Tiup Lilinnya!</span>
                          </button>

                          <button
                            type="button"
                            onClick={startMicDetection}
                            className={cn(
                              "inline-flex cursor-pointer items-center justify-center gap-2 border-2 border-[#121212] px-4 py-3 text-sm font-extrabold text-[#121212] shadow-[4px_4px_0_#121212] transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#121212]",
                              isListeningMic
                                ? "bg-[#FFFDF7] hover:bg-[#f5f2e6]"
                                : "bg-[#FFD60A] hover:bg-[#ffe14d]"
                            )}
                          >
                            <Microphone
                              size={18}
                              weight={isListeningMic ? "fill" : "bold"}
                              aria-hidden="true"
                            />
                            <span>
                              {isListeningMic
                                ? "Matikan Mic"
                                : "Tiup Lewat Mic HP"}
                            </span>
                          </button>
                        </div>

                        {isListeningMic && (
                          <div className="border-2 border-[#121212] bg-[#FFFDF7] p-3">
                            <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
                              <span>Lagi dengerin mic... tiup ke arah HP kamu!</span>
                              <span className="uppercase text-[#FF4D6D]">Nyala</span>
                            </div>
                            <div className="h-3 w-full overflow-hidden border-2 border-[#121212] bg-white">
                              <div
                                ref={micBarRef}
                                style={{ width: "0%" }}
                                className="h-full bg-[#FF4D6D] transition-[width] duration-75"
                              />
                            </div>
                          </div>
                        )}

                        {micError && (
                          <p
                            role="alert"
                            className="border-2 border-[#121212] bg-[#FFFDF7] px-3.5 py-2.5 text-xs font-bold text-[#FF4D6D]"
                          >
                            {micError}
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="inline-flex items-center gap-2 border-2 border-[#121212] bg-[#FFD60A] px-3.5 py-2.5 text-xs font-extrabold sm:text-sm">
                          <Check size={18} weight="bold" aria-hidden="true" />
                          <span>
                            Semua lilin udah padam! Make a wish yang tadi diucapin
                            semoga kejadian semua ya, {data.celebrantName}.
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={relightCandles}
                          className="inline-flex cursor-pointer items-center justify-center gap-2 border-2 border-[#121212] bg-[#FFFDF7] px-4 py-2.5 text-xs font-extrabold shadow-[4px_4px_0_#121212] transition-transform hover:bg-[#f4f0e0] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#121212] sm:text-sm"
                        >
                          <ArrowCounterClockwise
                            size={16}
                            weight="bold"
                            aria-hidden="true"
                          />
                          <span>Nyalain Lilin Lagi</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: "${turningAge} Tahun dalam Angka" Animated Band */}
      <section className="border-y-2 border-[#121212] bg-[#FFD60A] py-12 sm:py-14">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-8 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#121212]/75">
                Hitung-Hitungan Seru
              </p>
              <h2 className="mt-1 font-archivo text-2xl font-extrabold tracking-tight text-[#121212] sm:text-3xl">
                {age} Tahun Hidup di Bumi Versi Angka
              </h2>
            </div>
            <p className="text-sm font-bold text-[#121212]/80">
              Tiap detik yang udah kamu lewatin bareng kita wajib banget dirayain!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
            {ageStats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={
                  prefersReducedMotion
                    ? { opacity: 1 }
                    : { opacity: 0, y: 18, scale: 0.96 }
                }
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: "some" }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0.1 }
                    : {
                        type: "spring",
                        stiffness: 280,
                        damping: 22,
                        delay: idx * 0.03,
                      }
                }
                className="border-2 border-[#121212] bg-[#FFFDF7] p-5 shadow-[4px_4px_0_#121212]"
              >
                <p className="font-archivo text-3xl font-extrabold tracking-tight text-[#121212] tabular-nums sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-xs font-extrabold uppercase tracking-wider text-[#FF4D6D] sm:text-sm">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: 3-Tap Interactive Gift Box -> Perforated Dinner Voucher */}
      <section className="border-b-2 border-[#121212] bg-[#FFFDF7] py-16">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="mb-8 border-l-4 border-[#FF4D6D] pl-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#FF4D6D]">
              Kado Rahasia
            </p>
            <h2 className="mt-1 font-archivo text-3xl font-extrabold tracking-tight sm:text-4xl">
              Ada Kado Rahasia! Ketuk Kotaknya 3x Buat Buka
            </h2>
          </div>

          <AnimatePresence mode="wait">
            {!isGiftOpened ? (
              <motion.button
                key="voucher-wrapped"
                type="button"
                onClick={handleGiftTap}
                whileHover={prefersReducedMotion ? undefined : { y: -3 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
                className="group relative flex w-full cursor-pointer flex-col items-center justify-center gap-5 border-2 border-[#121212] bg-[#FFD60A] px-6 py-12 text-center shadow-[4px_4px_0_#121212] transition-colors hover:bg-[#ffe14d] sm:shadow-[6px_6px_0_#121212]"
              >
                {/* Decorative Gift Ribbon Cross */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-1/2 w-5 -translate-x-1/2 border-x-2 border-[#121212] bg-[#FF4D6D]/25"
                />

                <motion.div
                  key={giftTaps}
                  initial={
                    giftTaps > 0 && !prefersReducedMotion
                      ? { rotate: giftTaps % 2 === 1 ? -10 : 10, scale: 0.9 }
                      : false
                  }
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 16 }}
                  className="relative z-10 flex flex-col items-center gap-4"
                >
                  <div className="flex h-16 w-16 items-center justify-center border-2 border-[#121212] bg-[#FF4D6D] text-[#FFFDF7] shadow-[4px_4px_0_#121212] transition-transform group-hover:-rotate-6">
                    <Gift size={32} weight="fill" aria-hidden="true" />
                  </div>

                  <div className="space-y-1.5">
                    <p className="font-archivo text-xl font-extrabold tracking-tight sm:text-2xl">
                      Ketuk Buat Buka Kado
                    </p>
                    <p className="text-sm font-semibold text-[#121212]/80">
                      {giftTaps === 0 &&
                        `Titipan dari ${data.senderName} nih, gas ketuk 3x buat buka bungkusnya!`}
                      {giftTaps === 1 &&
                        "Nice! Pitanya udah mulai kebuka, ketuk lagi!"}
                      {giftTaps === 2 &&
                        "Satu ketukan lagi, isinya udah keliatan dikit tuh!"}
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-2 pt-1">
                    <span className="font-archivo text-sm font-extrabold tracking-wider text-[#121212] tabular-nums">
                      Ketukan: {giftTaps}/3
                    </span>
                    <div className="flex items-center gap-2" aria-hidden="true">
                      {[0, 1, 2].map((step) => (
                        <span
                          key={step}
                          className={cn(
                            "h-3 w-10 border-2 border-[#121212] transition-colors",
                            step < giftTaps ? "bg-[#FF4D6D]" : "bg-[#FFFDF7]"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.button>
            ) : (
              <motion.div
                key="voucher-stub"
                initial={
                  prefersReducedMotion
                    ? { opacity: 1 }
                    : { opacity: 0, scale: 0.94, y: 14 }
                }
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0.1 }
                    : { type: "spring", stiffness: 260, damping: 20 }
                }
                className="relative overflow-hidden border-2 border-[#121212] bg-white shadow-[4px_4px_0_#121212] sm:shadow-[6px_6px_0_#121212]"
              >
                {/* Top Header Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#121212] bg-[#FF4D6D] px-6 py-3 text-[#FFFDF7]">
                  <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider">
                    <Check size={16} weight="bold" aria-hidden="true" />
                    <span>Kado Kebuka!</span>
                  </span>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#FFD60A]">
                    Dari {data.senderName} buat {data.celebrantName}
                  </span>
                </div>

                {/* Perforated Ticket Body */}
                <div className="relative grid grid-cols-1 md:grid-cols-12">
                  {/* Side Ticket Notches */}
                  <div
                    aria-hidden="true"
                    className="absolute top-1/2 -left-[2px] hidden h-8 w-4 -translate-y-1/2 rounded-r-full border-y-2 border-r-2 border-[#121212] bg-[#FFFDF7] md:block"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute top-1/2 -right-[2px] hidden h-8 w-4 -translate-y-1/2 rounded-l-full border-y-2 border-l-2 border-[#121212] bg-[#FFFDF7] md:block"
                  />

                  <div className="space-y-4 p-6 sm:p-8 md:col-span-8 md:border-r-2 md:border-dashed md:border-[#121212]">
                    <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#FF4D6D]">
                      Tiket Traktiran Resmi - Anti Wacana
                    </p>
                    <h3 className="font-archivo text-2xl font-extrabold tracking-tight text-[#121212] sm:text-3xl">
                      {giftVoucher.title}
                    </h3>
                    <p className="text-base font-medium leading-relaxed text-[#121212]/90">
                      {giftVoucher.description}
                    </p>
                  </div>

                  {/* Right Ticket Stub */}
                  <div className="flex flex-col justify-between gap-5 border-t-2 border-dashed border-[#121212] bg-[#FFD60A]/35 p-6 sm:p-7 md:col-span-4 md:border-t-0">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wider text-[#121212]/75">
                        Cara Klaim Tiket
                      </p>
                      <p className="mt-1.5 text-sm font-bold leading-snug text-[#121212]">
                        {giftVoucher.redeemNote}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsVoucherClaimed((prev) => !prev)}
                      className={cn(
                        "inline-flex w-full cursor-pointer items-center justify-center gap-2 border-2 border-[#121212] px-4 py-3 text-sm font-extrabold shadow-[4px_4px_0_#121212] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#121212]",
                        isVoucherClaimed
                          ? "bg-[#121212] text-[#FFD60A]"
                          : "bg-[#FFD60A] text-[#121212] hover:bg-[#ffe14d]"
                      )}
                    >
                      <Check size={16} weight="bold" aria-hidden="true" />
                      <span>
                        {isVoucherClaimed ? "Voucher Udah Kamu Klaim!" : "Ambil Voucher Ini"}
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Section 4: Expanded 5-Photo Bento Album + Animated Lightbox */}
      <section className="border-b-2 border-[#121212] bg-[#FFFDF7] py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div className="border-l-4 border-[#FFD60A] pl-4">
              <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#121212]/75">
                <Camera size={15} weight="fill" aria-hidden="true" />
                <span>Rekam Jejak Seru</span>
              </p>
              <h2 className="mt-1 font-archivo text-3xl font-extrabold tracking-tight sm:text-4xl">
                Dump Foto Edisi Ulang Tahunmu
              </h2>
            </div>
            <p className="text-sm font-semibold text-[#121212]/75">
              Klik foto mana aja kalau mau liat lebih jelas.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {memories.map((memory, index) => {
              const isLead = index === 0;
              const isOddLast =
                index > 0 &&
                index === memories.length - 1 &&
                remainingMemoriesCount % 2 === 1;

              return (
                <figure
                  key={`${memory.imageUrl}-${index}`}
                  className={cn(
                    "group flex flex-col overflow-hidden border-2 border-[#121212] bg-white shadow-[4px_4px_0_#121212]",
                    (isLead || isOddLast) && "md:col-span-2"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(index)}
                    aria-label={`Buka foto ${index + 1}: ${memory.caption}`}
                    className={cn(
                      "relative block w-full cursor-pointer overflow-hidden bg-[#FFD60A]/20 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121212]",
                      isLead || isOddLast
                        ? "aspect-[16/10] sm:aspect-[16/9]"
                        : "aspect-[4/3]"
                    )}
                  >
                    <img
                      src={memory.imageUrl}
                      alt={memory.caption}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </button>
                  <figcaption className="flex items-start gap-3 border-t-2 border-[#121212] bg-[#FFFDF7] px-4 py-3.5 text-sm font-semibold leading-snug text-[#121212]">
                    <span className="font-archivo text-sm font-extrabold text-[#FF4D6D] tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{memory.caption}</span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 5: Interactive Target & Doa Checklist */}
      {wishChecklist.length > 0 && (
        <section className="border-b-2 border-[#121212] bg-[#FFD60A]/20 py-16">
          <div className="mx-auto max-w-4xl px-5 sm:px-8">
            <div className="mb-8 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div className="border-l-4 border-[#121212] pl-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#FF4D6D]">
                  Wishlist Tahun Ini
                </p>
                <h2 className="mt-1 font-archivo text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Doa &amp; Wishlist Wajib Tembus di Umur {data.turningAge}
                </h2>
              </div>
              <p className="font-archivo text-sm font-extrabold text-[#121212] tabular-nums">
                {checkedWishes.length} / {wishChecklist.length} Udah Dicentang
              </p>
            </div>

            <div className="space-y-3.5">
              {wishChecklist.map((item, idx) => {
                const isChecked = checkedWishes.includes(idx);
                return (
                  <motion.button
                    key={`${item}-${idx}`}
                    type="button"
                    onClick={() => toggleWishItem(idx)}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-4 border-2 border-[#121212] px-5 py-4 text-left shadow-[4px_4px_0_#121212] transition-colors",
                      isChecked
                        ? "bg-[#FFD60A]/40"
                        : "bg-white hover:bg-[#FFFDF7]"
                    )}
                  >
                    <span className="shrink-0 text-[#121212]">
                      {isChecked ? (
                        <CheckSquare size={24} weight="fill" aria-hidden="true" />
                      ) : (
                        <Square size={24} weight="bold" aria-hidden="true" />
                      )}
                    </span>
                    <span
                      className={cn(
                        "flex-1 text-base font-bold leading-snug",
                        isChecked
                          ? "text-[#121212] line-through decoration-2"
                          : "text-[#121212]"
                      )}
                    >
                      {item}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Section 6: Expanded 6-Card Postcard Ucapan Sahabat */}
      <section className="border-b-2 border-[#121212] bg-[#FFFDF7] py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-8 border-l-4 border-[#FF4D6D] pl-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#FF4D6D]">
              Dari Circle Terdekat
            </p>
            <h2 className="mt-1 font-archivo text-3xl font-extrabold tracking-tight sm:text-4xl">
              Titipan Ucapan dari Orang-Orang Terdekatmu
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {friendWishes.map((wish, index) => {
              const accentClass =
                index % 2 === 0
                  ? "bg-[#FFD60A] text-[#121212]"
                  : "bg-[#FF4D6D] text-[#FFFDF7]";

              return (
                <motion.article
                  key={`${wish.from}-${index}`}
                  initial={
                    prefersReducedMotion
                      ? { opacity: 1 }
                      : { opacity: 0, y: 18 }
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
                          delay: (index % 3) * 0.08,
                        }
                  }
                  className="flex flex-col justify-between border-2 border-[#121212] bg-white p-6 shadow-[4px_4px_0_#121212]"
                >
                  <div>
                    <div className="mb-4 flex items-center justify-between gap-2">
                      <div
                        className={cn(
                          "inline-flex h-8 w-8 items-center justify-center border-2 border-[#121212]",
                          accentClass
                        )}
                      >
                        <Quotes size={16} weight="fill" aria-hidden="true" />
                      </div>
                      <span className="font-archivo text-xs font-extrabold uppercase tracking-wider text-[#121212]/45 tabular-nums">
                        #{String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <p className="text-base font-medium leading-relaxed text-[#121212]">
                      {wish.message}
                    </p>
                  </div>

                  <p className="mt-5 border-t-2 border-dashed border-[#121212]/25 pt-3 font-archivo text-sm font-extrabold tracking-tight text-[#121212]">
                    {wish.from} - {wish.role}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 7: Music Dedication Strip + Closing Party Banner + Subtle Footer */}
      <section className="bg-[#FFD60A] py-14">
        <div className="mx-auto max-w-6xl space-y-6 px-5 sm:px-8">
          {data.playlistSong && (
            <div className="flex flex-col items-start justify-between gap-4 border-2 border-[#121212] bg-[#FFFDF7] p-5 shadow-[4px_4px_0_#121212] sm:flex-row sm:items-center sm:p-6">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={
                    prefersReducedMotion ? undefined : { rotate: 360 }
                  }
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-[#121212] bg-[#FFD60A] text-[#121212]"
                >
                  <VinylRecord size={26} weight="fill" aria-hidden="true" />
                </motion.div>
                <div>
                  <p className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-[#FF4D6D]">
                    <MusicNotes size={14} weight="fill" aria-hidden="true" />
                    <span>Lagu Pengiring Ulang Tahunmu</span>
                  </p>
                  <p className="mt-0.5 font-archivo text-lg font-extrabold tracking-tight text-[#121212]">
                    {data.playlistSong.title} - {data.playlistSong.artist}
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-[#121212]/75">
                Play musiknya lewat tombol di pojok kanan bawah ya
              </span>
            </div>
          )}

          <div className="flex flex-col items-start justify-between gap-6 border-2 border-[#121212] bg-[#FF4D6D] p-7 text-[#FFFDF7] shadow-[4px_4px_0_#121212] sm:flex-row sm:items-center sm:p-9">
            <div className="space-y-2">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#FFD60A]">
                Waktunya Rayain Hari Kamu
              </p>
              <h2 className="font-archivo text-2xl font-extrabold tracking-tight sm:text-4xl">
                Semoga umur ke-{data.turningAge} makin banyak tawa dan kejutan seru, {data.celebrantName}!
              </h2>
              <p className="max-w-2xl text-sm font-medium text-[#FFFDF7]/90 sm:text-base">
                Dibikin khusus oleh {data.senderName} buat {data.birthDateLabel}.
              </p>
            </div>

            <a
              href="#hero-stage"
              className="inline-flex shrink-0 items-center gap-2 border-2 border-[#121212] bg-[#FFD60A] px-5 py-3 text-sm font-extrabold text-[#121212] shadow-[4px_4px_0_#121212] transition-transform hover:bg-[#ffe14d] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#121212]"
            >
              <Confetti size={18} weight="bold" aria-hidden="true" />
              <span>Balik ke Kue</span>
            </a>
          </div>
        </div>
      </section>

      {/* Subtle Footer */}
      <footer className="border-t-2 border-[#121212] bg-[#FFFDF7] py-7">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-5 text-center sm:px-8">
          <Link
            href="/"
            className="text-xs font-bold text-[#121212]/75 underline decoration-2 underline-offset-4 transition-colors hover:text-[#FF4D6D]"
          >
            Dibuat dengan KatalogWeb
          </Link>
        </div>
      </footer>

      {/* Animated Lightbox Modal */}
      <AnimatePresence>
        {activeLightboxMemory && lightboxIndex !== null && (
          <motion.div
            key="ultah-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label={`Foto kenangan ${lightboxIndex + 1} dari ${memories.length}`}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/80 p-4 backdrop-blur-xs sm:p-6"
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
              className="w-full max-w-3xl overflow-hidden border-2 border-[#121212] bg-[#FFFDF7] shadow-[6px_6px_0_#FFD60A]"
            >
              <div className="flex items-center justify-between gap-3 border-b-2 border-[#121212] bg-[#FFD60A] px-4 py-3">
                <span className="font-archivo text-xs font-extrabold uppercase tracking-wider text-[#121212] tabular-nums sm:text-sm">
                  Foto {lightboxIndex + 1} / {memories.length}
                </span>
                <button
                  type="button"
                  onClick={closeLightbox}
                  className="cursor-pointer border-2 border-[#121212] bg-[#FFFDF7] px-3 py-1 text-xs font-extrabold uppercase text-[#121212] shadow-[2px_2px_0_#121212] hover:bg-[#FF4D6D] hover:text-[#FFFDF7]"
                >
                  Tutup
                </button>
              </div>

              <div className="relative bg-[#121212]">
                <img
                  src={activeLightboxMemory.imageUrl}
                  alt={activeLightboxMemory.caption}
                  className="max-h-[68dvh] w-full object-contain"
                />
              </div>

              <div className="flex flex-col gap-4 border-t-2 border-[#121212] bg-[#FFFDF7] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
                <p className="text-sm font-bold leading-snug text-[#121212] sm:text-base">
                  {activeLightboxMemory.caption}
                </p>

                {memories.length > 1 && (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={showPrevPhoto}
                      className="cursor-pointer border-2 border-[#121212] bg-white px-3 py-1.5 text-xs font-extrabold uppercase text-[#121212] shadow-[2px_2px_0_#121212] hover:bg-[#FFD60A]"
                    >
                      Sebelumnya
                    </button>
                    <button
                      type="button"
                      onClick={showNextPhoto}
                      className="cursor-pointer border-2 border-[#121212] bg-[#FFD60A] px-3 py-1.5 text-xs font-extrabold uppercase text-[#121212] shadow-[2px_2px_0_#121212] hover:bg-[#ffe14d]"
                    >
                      Berikutnya
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

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowCounterClockwise,
  Cake,
  Camera,
  Check,
  Confetti,
  Gift,
  Microphone,
  Quotes,
  Sparkle,
} from "@phosphor-icons/react";
import { MusicPlayer } from "@/components/MusicPlayer";
import type { UltahSiteConfig } from "@/lib/schema";
import { cn } from "@/lib/utils";

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
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

const CANDLE_STRIPES = [
  "bg-[#FF4D6D]",
  "bg-[#FFD60A]",
  "bg-[#FFFDF7]",
];

const CANDLE_HEIGHTS = [58, 66, 54, 70, 56, 64, 60];

export function UltahInteraktifTemplate({
  site,
  embedded = false,
}: {
  site: UltahSiteConfig;
  embedded?: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<ConfettiParticle[]>([]);
  const confettiRafRef = useRef<number | null>(null);

  const micStreamRef = useRef<MediaStream | null>(null);
  const micAudioCtxRef = useRef<AudioContext | null>(null);
  const micRafRef = useRef<number | null>(null);
  const micBarRef = useRef<HTMLDivElement | null>(null);

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

    const originX = width >= 1024 ? width * 0.68 : width * 0.5;
    const originY = Math.min(height * 0.45, 380);

    const particles: ConfettiParticle[] = [];
    for (let i = 0; i < 95; i += 1) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
      const speed = 5 + Math.random() * 11;
      particles.push({
        x: originX + (Math.random() - 0.5) * 90,
        y: originY + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 7 + Math.random() * 7,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rotation: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.24,
        life: 0,
        maxLife: 110 + Math.random() * 55,
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
        p.vy += 0.28;
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
        ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#121212";
        ctx.strokeRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
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
      setMicError("Mikrofon tidak tersedia, pakai tombol Tiup Lilin di sebelah.");
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
        setMicError("Mikrofon tidak tersedia, pakai tombol Tiup Lilin di sebelah.");
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
      setMicError("Mikrofon tidak tersedia, pakai tombol Tiup Lilin di sebelah.");
    }
  }, [blowOutCandles, isListeningMic, stopMicrophone]);

  useEffect(() => {
    return () => {
      stopMicrophone();
      stopConfetti();
    };
  }, [stopConfetti, stopMicrophone]);

  const visibleCandleCount = Math.min(Math.max(site.data.turningAge, 1), 7);
  const candleIndices = Array.from({ length: visibleCandleCount }, (_, idx) => idx);
  const { memories, friendWishes, giftVoucher } = site.data;
  const remainingMemoriesCount = Math.max(0, memories.length - 1);

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
        className="border-2 border-[#121212] bg-[#FFD60A] font-jakarta text-xs font-bold text-[#121212] shadow-[4px_4px_0_#121212] hover:bg-[#ffe14d]"
      />

      {/* Section 1: Interactive Tiup Lilin Hero */}
      <section
        className={cn(
          "relative border-b-2 border-[#121212] bg-[#FFFDF7] pt-16 pb-14",
          !embedded && "flex min-h-[100dvh] items-center"
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(#121212 1.25px, transparent 1.25px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left Column: Headline, Sender, & Wish Reveal */}
            <div className="space-y-6 lg:col-span-6">
              <div className="inline-flex items-center gap-2 border-2 border-[#121212] bg-[#FFD60A] px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider shadow-[3px_3px_0_#121212]">
                <Cake size={16} weight="fill" aria-hidden="true" />
                <span>HBD {site.data.celebrantName}</span>
              </div>

              <h1 className="font-archivo text-4xl font-extrabold leading-[1.06] tracking-tight text-[#121212] sm:text-5xl lg:text-6xl">
                Selamat Ulang Tahun ke-
                <span className="mx-1.5 inline-block border-2 border-[#121212] bg-[#FF4D6D] px-2.5 py-0.5 text-[#FFFDF7] tabular-nums shadow-[3px_3px_0_#121212]">
                  {site.data.turningAge}
                </span>
                , {site.data.celebrantName}
              </h1>

              <p className="inline-flex flex-wrap items-center gap-2 border-2 border-[#121212] bg-white px-4 py-2 text-sm font-semibold shadow-[3px_3px_0_#121212]">
                <span>
                  Dari {site.data.senderName} - {site.data.birthDateLabel}
                </span>
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
                    <div className="mb-2.5 inline-flex items-center gap-1.5 border-2 border-[#121212] bg-[#FFFDF7] px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide">
                      <Sparkle size={14} weight="fill" aria-hidden="true" />
                      <span>Harapan Ulang Tahun</span>
                    </div>
                    <p className="text-base font-semibold leading-relaxed text-[#121212] sm:text-lg">
                      {site.data.heroWish}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="wish-sealed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="border-2 border-dashed border-[#121212] bg-white/90 p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border-2 border-[#121212] bg-[#FFD60A]">
                        <Sparkle size={16} weight="bold" aria-hidden="true" />
                      </div>
                      <p className="text-sm font-medium leading-relaxed text-[#121212]/85 sm:text-base">
                        Tutup mata sebentar, ucapkan harapan terbaikmu di usia{" "}
                        <span className="font-bold tabular-nums">
                          {site.data.turningAge}
                        </span>
                        , lalu tiup semua lilin di kue sebelah untuk membuka pesan spesial.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column: Interactive Kue Ulang Tahun Stage */}
            <div className="lg:col-span-6">
              <div className="border-2 border-[#121212] bg-white p-5 shadow-[6px_6px_0_#121212] sm:p-7">
                <div className="mb-5 flex items-center justify-between border-b-2 border-[#121212] pb-3">
                  <div className="inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide">
                    <Cake size={18} weight="fill" aria-hidden="true" />
                    <span>Kue Ulang Tahun</span>
                  </div>
                  <span className="border-2 border-[#121212] bg-[#FFD60A] px-2.5 py-0.5 text-xs font-extrabold tabular-nums">
                    Usia {site.data.turningAge}
                  </span>
                </div>

                {/* Geometric CSS Cake Stage */}
                <div className="relative flex flex-col items-center justify-end border-2 border-[#121212] bg-[#FFFDF7] px-4 pt-12 pb-7">
                  {/* Candles Row */}
                  <div className="relative z-10 flex items-end justify-center gap-3 sm:gap-4">
                    {candleIndices.map((idx) => {
                      const stripeBg = CANDLE_STRIPES[idx % CANDLE_STRIPES.length];
                      const candleHeight = CANDLE_HEIGHTS[idx % CANDLE_HEIGHTS.length];

                      return (
                        <div
                          key={idx}
                          className="flex flex-col items-center"
                        >
                          {/* Flame or Smoke */}
                          <div className="relative flex h-9 w-6 items-end justify-center">
                            {!candlesBlown ? (
                              <motion.div
                                animate={
                                  prefersReducedMotion
                                    ? undefined
                                    : {
                                        scaleY: [1, 1.14, 0.94, 1.08, 1],
                                        scaleX: [1, 0.92, 1.06, 0.96, 1],
                                        rotate: [0, -3, 3, -2, 0],
                                      }
                                }
                                transition={{
                                  duration: 0.95 + (idx % 3) * 0.18,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                                className="relative flex items-end justify-center"
                              >
                                <div className="h-7 w-4 rounded-t-full rounded-b-[45%] border-2 border-[#121212] bg-[#FF4D6D] shadow-[0_0_12px_rgba(255,214,10,0.85)]" />
                                <div className="absolute bottom-1 h-4 w-2 rounded-t-full rounded-b-full bg-[#FFD60A]" />
                              </motion.div>
                            ) : (
                              <motion.div
                                initial={
                                  prefersReducedMotion
                                    ? { opacity: 0.4 }
                                    : { opacity: 0.85, y: 4, scale: 0.7 }
                                }
                                animate={
                                  prefersReducedMotion
                                    ? { opacity: 0 }
                                    : { opacity: 0, y: -24, scale: 1.5 }
                                }
                                transition={{ duration: 0.9, ease: "easeOut" }}
                                className="mb-1 h-4 w-3 rounded-full bg-[#121212]/25 blur-[2px]"
                              />
                            )}
                          </div>

                          {/* Wick */}
                          <div className="h-2 w-[3px] bg-[#121212]" />

                          {/* Candle Stick */}
                          <div
                            style={{ height: `${candleHeight}px` }}
                            className={cn(
                              "relative w-3.5 overflow-hidden border-2 border-[#121212] sm:w-4",
                              stripeBg
                            )}
                          >
                            <div className="mt-2 h-1.5 w-full border-y border-[#121212] bg-[#121212]/15" />
                            <div className="mt-3 h-1.5 w-full border-y border-[#121212] bg-[#121212]/15" />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Top Cake Tier with Frosting */}
                  <div className="relative z-10 -mt-[2px] w-48 border-2 border-[#121212] bg-[#FFD60A] sm:w-56">
                    <div className="flex h-5 w-full border-b-2 border-[#121212] bg-[#FF4D6D]">
                      <div className="h-full flex-1 border-r-2 border-[#121212]/30" />
                      <div className="h-full flex-1 border-r-2 border-[#121212]/30" />
                      <div className="h-full flex-1" />
                    </div>
                    <div className="flex h-12 items-center justify-center px-3">
                      <span className="border-2 border-[#121212] bg-[#FFFDF7] px-3 py-0.5 font-archivo text-base font-extrabold tracking-tight tabular-nums shadow-[2px_2px_0_#121212]">
                        {site.data.turningAge} TAHUN
                      </span>
                    </div>
                  </div>

                  {/* Middle Cream Layer */}
                  <div className="relative z-10 -mt-[2px] h-4 w-56 border-2 border-[#121212] bg-[#FFFDF7] sm:w-64" />

                  {/* Bottom Cake Tier */}
                  <div className="relative z-10 -mt-[2px] flex h-16 w-64 items-center justify-around border-2 border-[#121212] bg-[#FF4D6D] px-4 sm:w-72">
                    <span className="h-3 w-3 rotate-45 border-2 border-[#121212] bg-[#FFD60A]" />
                    <span className="h-3 w-3 rotate-45 border-2 border-[#121212] bg-[#FFFDF7]" />
                    <span className="h-3 w-3 rotate-45 border-2 border-[#121212] bg-[#FFD60A]" />
                    <span className="h-3 w-3 rotate-45 border-2 border-[#121212] bg-[#FFFDF7]" />
                  </div>

                  {/* Cake Stand Plate */}
                  <div className="relative z-10 -mt-[2px] h-4 w-72 border-2 border-[#121212] bg-[#121212] shadow-[4px_4px_0_#FFD60A] sm:w-80" />
                </div>

                {/* Interactive Controls */}
                <div className="mt-5 space-y-3">
                  {!candlesBlown ? (
                    <>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={blowOutCandles}
                          className="inline-flex cursor-pointer items-center justify-center gap-2 border-2 border-[#121212] bg-[#FF4D6D] px-4 py-3 text-sm font-extrabold text-[#FFFDF7] shadow-[4px_4px_0_#121212] transition-transform hover:bg-[#ff355a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#121212]"
                        >
                          <Confetti size={18} weight="bold" aria-hidden="true" />
                          <span>Tiup Lilin Sekarang</span>
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
                              ? "Hentikan Mikrofon"
                              : "Tiup Pakai Mikrofon"}
                          </span>
                        </button>
                      </div>

                      {isListeningMic && (
                        <div className="border-2 border-[#121212] bg-[#FFFDF7] p-3">
                          <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
                            <span>Dekatkan ke mikrofon lalu tiup kencang</span>
                            <span className="uppercase text-[#FF4D6D]">Aktif</span>
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
                          Semua lilin padam! Selamat ulang tahun,{" "}
                          {site.data.celebrantName}.
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
                        <span>Nyalakan Lilin Lagi</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Interactive Buka Voucher Hadiah */}
      <section className="border-b-2 border-[#121212] bg-[#FFD60A]/25 py-16">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 border-2 border-[#121212] bg-[#FF4D6D] px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#FFFDF7] shadow-[3px_3px_0_#121212]">
                <Gift size={14} weight="fill" aria-hidden="true" />
                <span>Hadiah Spesial</span>
              </span>
              <h2 className="mt-3 font-archivo text-3xl font-extrabold tracking-tight sm:text-4xl">
                Voucher Kejutan Untukmu
              </h2>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!isVoucherOpen ? (
              <motion.button
                key="voucher-sealed"
                type="button"
                onClick={() => setIsVoucherOpen(true)}
                whileHover={prefersReducedMotion ? undefined : { y: -3 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                className="group relative flex w-full cursor-pointer flex-col items-center justify-center gap-4 border-2 border-[#121212] bg-[#FFD60A] px-6 py-12 text-center shadow-[6px_6px_0_#121212] transition-colors hover:bg-[#ffe14d]"
              >
                <div
                  aria-hidden="true"
                  className="absolute top-1/2 -left-[2px] h-8 w-4 -translate-y-1/2 rounded-r-full border-y-2 border-r-2 border-[#121212] bg-[#FFFDF7]"
                />
                <div
                  aria-hidden="true"
                  className="absolute top-1/2 -right-[2px] h-8 w-4 -translate-y-1/2 rounded-l-full border-y-2 border-l-2 border-[#121212] bg-[#FFFDF7]"
                />

                <div className="flex h-16 w-16 items-center justify-center border-2 border-[#121212] bg-[#FF4D6D] text-[#FFFDF7] shadow-[4px_4px_0_#121212] transition-transform group-hover:-rotate-6">
                  <Gift size={32} weight="fill" aria-hidden="true" />
                </div>

                <div className="space-y-1.5">
                  <p className="font-archivo text-xl font-extrabold tracking-tight sm:text-2xl">
                    Ketuk untuk Buka Hadiah dari {site.data.senderName}
                  </p>
                  <p className="text-sm font-semibold text-[#121212]/80">
                    Ada satu voucher khusus yang sudah disiapkan untuk hari ulang tahunmu.
                  </p>
                </div>
              </motion.button>
            ) : (
              <motion.div
                key="voucher-open"
                initial={
                  prefersReducedMotion
                    ? { opacity: 1 }
                    : { opacity: 0, rotateX: -25, scale: 0.95 }
                }
                animate={{ opacity: 1, rotateX: 0, scale: 1 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0.1 }
                    : { type: "spring", stiffness: 260, damping: 20 }
                }
                className="relative overflow-hidden border-2 border-[#121212] bg-white shadow-[6px_6px_0_#121212]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#121212] bg-[#FF4D6D] px-6 py-3 text-[#FFFDF7]">
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider">
                    <Check size={16} weight="bold" aria-hidden="true" />
                    <span>Voucher Berhasil Dibuka</span>
                  </span>
                  <span className="border-2 border-[#121212] bg-[#FFD60A] px-2.5 py-0.5 text-xs font-extrabold text-[#121212]">
                    Dari {site.data.senderName}
                  </span>
                </div>

                <div className="space-y-4 p-6 sm:p-8">
                  <h3 className="font-archivo text-2xl font-extrabold tracking-tight text-[#121212] sm:text-3xl">
                    {giftVoucher.title}
                  </h3>

                  <p className="text-base font-medium leading-relaxed text-[#121212]/90">
                    {giftVoucher.description}
                  </p>

                  <div className="border-2 border-[#121212] bg-[#FFD60A] p-4 shadow-[3px_3px_0_#121212]">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-[#121212]/75">
                      Cara Klaim Hadiah
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#121212]">
                      {giftVoucher.redeemNote}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Section 3: Asymmetric Bento Photo Memories */}
      <section className="border-b-2 border-[#121212] bg-[#FFFDF7] py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 border-2 border-[#121212] bg-[#FFD60A] px-3 py-1 text-xs font-extrabold uppercase tracking-wider shadow-[3px_3px_0_#121212]">
              <Camera size={14} weight="fill" aria-hidden="true" />
              <span>Potret Momen</span>
            </span>
            <h2 className="mt-3 font-archivo text-3xl font-extrabold tracking-tight sm:text-4xl">
              Kenangan yang Layak Dirayakan
            </h2>
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
                    "flex flex-col overflow-hidden border-2 border-[#121212] bg-white shadow-[4px_4px_0_#121212]",
                    (isLead || isOddLast) && "md:col-span-2"
                  )}
                >
                  <div
                    className={cn(
                      "w-full overflow-hidden bg-[#FFD60A]/20",
                      isLead || isOddLast
                        ? "aspect-[16/10] sm:aspect-[16/9]"
                        : "aspect-[4/3]"
                    )}
                  >
                    <img
                      src={memory.imageUrl}
                      alt={memory.caption}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <figcaption className="flex items-start gap-2.5 border-t-2 border-[#121212] bg-[#FFFDF7] px-4 py-3.5 text-sm font-semibold leading-snug text-[#121212]">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center border border-[#121212] bg-[#FFD60A] text-[11px] font-extrabold tabular-nums">
                      {index + 1}
                    </span>
                    <span>{memory.caption}</span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 4: Papan Ucapan Sahabat */}
      <section className="bg-[#FFFDF7] py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 border-2 border-[#121212] bg-[#FF4D6D] px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#FFFDF7] shadow-[3px_3px_0_#121212]">
              <Quotes size={14} weight="fill" aria-hidden="true" />
              <span>Ucapan Masuk</span>
            </span>
            <h2 className="mt-3 font-archivo text-3xl font-extrabold tracking-tight sm:text-4xl">
              Papan Ucapan Sahabat
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {friendWishes.map((wish, index) => {
              const accentClass =
                index % 2 === 0 ? "bg-[#FFD60A]" : "bg-[#FF4D6D] text-[#FFFDF7]";

              return (
                <article
                  key={`${wish.from}-${index}`}
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
                      <span className="border-2 border-[#121212] bg-[#FFFDF7] px-2.5 py-0.5 text-xs font-bold">
                        {wish.role}
                      </span>
                    </div>

                    <p className="text-base font-medium leading-relaxed text-[#121212]">
                      {wish.message}
                    </p>
                  </div>

                  <p className="mt-5 border-t-2 border-dashed border-[#121212]/25 pt-3 font-archivo text-sm font-extrabold tracking-tight text-[#121212]">
                    {wish.from}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-[#121212] bg-[#FFFDF7] py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-5 text-center sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 border-2 border-[#121212] bg-white px-4 py-2 text-xs font-bold text-[#121212] shadow-[3px_3px_0_#121212] transition-colors hover:bg-[#FFD60A]"
          >
            <span>Dibuat dengan KatalogWeb</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}

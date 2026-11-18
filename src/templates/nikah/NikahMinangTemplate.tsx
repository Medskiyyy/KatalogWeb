"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react";
import {
  ArrowSquareOut,
  CalendarPlus,
  CaretDown,
  CaretLeft,
  CaretRight,
  CaretUp,
  Check,
  Clock,
  Copy,
  EnvelopeOpen,
  Gift,
  Heart,
  MapPin,
  Package,
  Palette,
  ShareNetwork,
  Users,
  WhatsappLogo,
  X,
} from "@phosphor-icons/react";
import { MusicPlayer } from "@/components/MusicPlayer";
import { getSubdomainUrl } from "@/config/brand";
import type { NikahSiteConfig } from "@/lib/schema";
import { playSfx } from "@/lib/sfx";
import { buildWeddingGuestLink, buildWhatsAppUrl, cn } from "@/lib/utils";

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

interface PrayerEntry {
  name: string;
  relation: string;
  message: string;
}

const MINANG_EASE = [0.22, 1, 0.36, 1] as const;
const VIEWPORT_ONCE = { once: true, amount: "some" } as const;

function padTwo(value: number): string {
  return String(Math.max(0, value)).padStart(2, "0");
}

function buildGoogleCalendarUrl(params: {
  title: string;
  weddingDateIso: string;
  timeLabel: string;
  venueName: string;
  address: string;
  details: string;
}): string {
  const isoMatch = params.weddingDateIso.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/
  );
  const datePart = isoMatch
    ? `${isoMatch[1]}${isoMatch[2]}${isoMatch[3]}`
    : "20261227";
  const defaultStart = isoMatch ? `${isoMatch[4]}${isoMatch[5]}00` : "083000";

  const timeRangeMatch = params.timeLabel.match(
    /(\d{1,2})[.:](\d{2})\s*-\s*(\d{1,2})[.:](\d{2})/
  );

  let startTime = defaultStart;
  let endTime = "100000";

  if (timeRangeMatch) {
    startTime = `${padTwo(Number(timeRangeMatch[1]))}${timeRangeMatch[2]}00`;
    endTime = `${padTwo(Number(timeRangeMatch[3]))}${timeRangeMatch[4]}00`;
  } else if (isoMatch) {
    const endHour = Math.min(23, Number(isoMatch[4]) + 2);
    endTime = `${padTwo(endHour)}${isoMatch[5]}00`;
  }

  const query = new URLSearchParams({
    action: "TEMPLATE",
    text: params.title,
    dates: `${datePart}T${startTime}/${datePart}T${endTime}`,
    details: params.details,
    location: `${params.venueName}, ${params.address}`,
    ctz: "Asia/Jakarta",
  });

  return `https://calendar.google.com/calendar/render?${query.toString()}`;
}

function GonjongCrest({
  variant = "gold",
  className,
}: {
  variant?: "gold" | "light";
  className?: string;
}) {
  const strokeMain = variant === "light" ? "#FAF3E8" : "#7F1D1D";
  const strokeAccent = variant === "light" ? "#FBBF24" : "#B45309";

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 240 84"
      fill="none"
      className={cn("h-12 w-auto sm:h-14", className)}
    >
      {/* Atap Gonjong Utama Rumah Gadang */}
      <path
        d="M16 58 C44 52, 62 34, 72 10 C76 34, 92 48, 120 48 C148 48, 164 34, 168 10 C178 34, 196 52, 224 58"
        stroke={strokeMain}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Puncak Gonjong Dalam */}
      <path
        d="M42 62 C64 56, 82 42, 92 22 C98 40, 108 46, 120 46 C132 46, 142 40, 148 22 C158 42, 176 56, 198 62"
        stroke={strokeAccent}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bubungan & Balok Songket */}
      <path
        d="M34 66 H206"
        stroke={strokeMain}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M64 72 H176"
        stroke={strokeAccent}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Ornamen Geometris Belah Ketupat Tengah */}
      <path
        d="M120 55 L129 66 L120 77 L111 66 Z"
        fill={strokeAccent}
        fillOpacity="0.22"
        stroke={strokeAccent}
        strokeWidth="1.4"
      />
      <circle cx="120" cy="66" r="2.2" fill={strokeMain} />
    </svg>
  );
}

function PucukRebungBand({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("w-full overflow-hidden py-1", className)}
    >
      <svg
        viewBox="0 0 1200 22"
        preserveAspectRatio="none"
        className="h-[18px] w-full"
        fill="none"
      >
        <defs>
          <pattern
            id="pucuk-rebung-motif"
            width="40"
            height="22"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 19 L10 3 L20 19 Z"
              fill="#B45309"
              fillOpacity="0.24"
              stroke="#B45309"
              strokeWidth="0.9"
            />
            <path
              d="M20 19 L30 5 L40 19 Z"
              fill="#7F1D1D"
              fillOpacity="0.16"
              stroke="#7F1D1D"
              strokeWidth="0.8"
            />
            <path
              d="M10 19 L10 9 M30 19 L30 11"
              stroke="#B45309"
              strokeOpacity="0.5"
              strokeWidth="0.8"
            />
          </pattern>
        </defs>
        <line
          x1="0"
          y1="1"
          x2="1200"
          y2="1"
          stroke="#B45309"
          strokeOpacity="0.35"
          strokeWidth="1"
        />
        <rect width="1200" height="20" y="1" fill="url(#pucuk-rebung-motif)" />
        <line
          x1="0"
          y1="21"
          x2="1200"
          y2="21"
          stroke="#7F1D1D"
          strokeOpacity="0.3"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

export function NikahMinangTemplate({
  site,
  embedded = false,
}: {
  site: NikahSiteConfig;
  embedded?: boolean;
}) {
  const { data } = site;
  const prefersReducedMotion = Boolean(useReducedMotion());

  const [isOpened, setIsOpened] = useState(embedded);
  const [guestName, setGuestName] = useState("Dunsanak & Tamu Undangan");
  const [countdown, setCountdown] = useState<CountdownState | null>(null);

  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const copyTimerRef = useRef<number | null>(null);

  const [copiedAddress, setCopiedAddress] = useState(false);
  const addressTimerRef = useRef<number | null>(null);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const [rsvpName, setRsvpName] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState<"Hadir" | "Berhalangan">("Hadir");
  const [rsvpCount, setRsvpCount] = useState("2");
  const [rsvpWish, setRsvpWish] = useState("");
  const [rsvpError, setRsvpError] = useState("");
  const [rsvpFeedback, setRsvpFeedback] = useState("");
  const [submittedPrayers, setSubmittedPrayers] = useState<PrayerEntry[]>([]);

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [guestListInput, setGuestListInput] = useState(
    "Datuak Rajo Alam\nKeluarga Bapak H. Darmawan\nUda Hendra & Keluarga"
  );
  const [copiedGuestLink, setCopiedGuestLink] = useState<string | null>(null);
  const guestCopyTimerRef = useRef<number | null>(null);

  const { scrollYProgress } = useScroll();
  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      const toParam = params.get("to")?.trim();
      if (toParam) {
        setGuestName(toParam);
        setRsvpName((prev) => (prev ? prev : toParam));
      }
      if (params.get("share") === "1") {
        setIsShareOpen(true);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    data.gallery.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, [data.gallery]);

  useEffect(() => {
    const targetMs = new Date(data.weddingDateIso).getTime();

    const updateCountdown = () => {
      if (Number.isNaN(targetMs)) {
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: false,
        });
        return;
      }

      const diff = targetMs - Date.now();
      if (diff <= 0) {
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: true,
        });
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      setCountdown({
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
        isPast: false,
      });
    };

    const initialTimer = window.setTimeout(updateCountdown, 0);
    const interval = window.setInterval(updateCountdown, 1000);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, [data.weddingDateIso]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      if (addressTimerRef.current !== null) {
        window.clearTimeout(addressTimerRef.current);
      }
      if (guestCopyTimerRef.current !== null) {
        window.clearTimeout(guestCopyTimerRef.current);
      }
    };
  }, []);

  const totalPhotos = data.gallery.length;

  const openLightbox = (index: number) => {
    playSfx("camera-shutter");
    setLightboxIndex(index);
  };

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const goPrevPhoto = useCallback(() => {
    playSfx("paper-flip");
    setLightboxIndex((prev) => {
      if (prev === null || totalPhotos === 0) return null;
      return (prev - 1 + totalPhotos) % totalPhotos;
    });
  }, [totalPhotos]);

  const goNextPhoto = useCallback(() => {
    playSfx("paper-flip");
    setLightboxIndex((prev) => {
      if (prev === null || totalPhotos === 0) return null;
      return (prev + 1) % totalPhotos;
    });
  }, [totalPhotos]);

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

  const coupleTitle = `${data.groom.nickname} & ${data.bride.nickname}`;
  const coverImage = data.gallery[0] ?? "/demo/nikah-minang-couple.webp";
  const heroVenueImage =
    data.gallery[1] ?? "/demo/nikah-minang-venue.webp";
  const baseSubdomainUrl = getSubdomainUrl(site.slug);
  const activeLightboxUrl =
    lightboxIndex !== null ? data.gallery[lightboxIndex] ?? null : null;

  const allPrayers = useMemo<PrayerEntry[]>(
    () => [...submittedPrayers, ...(data.initialPrayers ?? [])],
    [data.initialPrayers, submittedPrayers]
  );

  const akadCalendarUrl = useMemo(
    () =>
      buildGoogleCalendarUrl({
        title: `Akad Nikah ${coupleTitle}`,
        weddingDateIso: data.weddingDateIso,
        timeLabel: data.akad.timeLabel,
        venueName: data.akad.venueName,
        address: data.akad.address,
        details: `Undangan Akad Nikah ${data.groom.fullName} & ${data.bride.fullName}.`,
      }),
    [
      coupleTitle,
      data.akad.address,
      data.akad.timeLabel,
      data.akad.venueName,
      data.bride.fullName,
      data.groom.fullName,
      data.weddingDateIso,
    ]
  );

  const resepsiCalendarUrl = useMemo(
    () =>
      buildGoogleCalendarUrl({
        title: `Baralek Gadang ${coupleTitle}`,
        weddingDateIso: data.weddingDateIso,
        timeLabel: data.resepsi.timeLabel,
        venueName: data.resepsi.venueName,
        address: data.resepsi.address,
        details: `Undangan Baralek Gadang ${data.groom.fullName} & ${data.bride.fullName}.`,
      }),
    [
      coupleTitle,
      data.bride.fullName,
      data.groom.fullName,
      data.resepsi.address,
      data.resepsi.timeLabel,
      data.resepsi.venueName,
      data.weddingDateIso,
    ]
  );

  const generatedGuestLinks = useMemo(() => {
    const names = guestListInput
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    return names.map((name) => ({
      name,
      url: buildWeddingGuestLink(baseSubdomainUrl, name),
    }));
  }, [baseSubdomainUrl, guestListInput]);

  const handleOpenInvitation = () => {
    playSfx("paper-flip");
    setIsOpened(true);
  };

  const handleCopyAccount = async (accountNumber: string) => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      playSfx("paper-flip");
      setCopiedAccount(accountNumber);
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => {
        setCopiedAccount(null);
      }, 2000);
    } catch {
      setCopiedAccount(null);
    }
  };

  const handleCopyAddress = async (addressText: string) => {
    try {
      await navigator.clipboard.writeText(addressText);
      playSfx("paper-flip");
      setCopiedAddress(true);
      if (addressTimerRef.current !== null) {
        window.clearTimeout(addressTimerRef.current);
      }
      addressTimerRef.current = window.setTimeout(() => {
        setCopiedAddress(false);
      }, 2000);
    } catch {
      setCopiedAddress(false);
    }
  };

  const handleCopyGuestLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      playSfx("paper-flip");
      setCopiedGuestLink(url);
      if (guestCopyTimerRef.current !== null) {
        window.clearTimeout(guestCopyTimerRef.current);
      }
      guestCopyTimerRef.current = window.setTimeout(() => {
        setCopiedGuestLink(null);
      }, 2000);
    } catch {
      setCopiedGuestLink(null);
    }
  };

  const buildRsvpWhatsappLink = (cleanedName: string, cleanedWish: string) => {
    const lines = [
      `Assalamu'alaikum ${coupleTitle}, saya ingin konfirmasi kehadiran Baralek Gadang:`,
      "",
      `Nama Tamu: ${cleanedName}`,
      `Kehadiran: ${rsvpStatus}`,
    ];

    if (rsvpStatus === "Hadir") {
      lines.push(`Jumlah Tamu: ${rsvpCount || "1"} orang`);
    }

    if (cleanedWish) {
      lines.push(`Doa & Ucapan: ${cleanedWish}`);
    }

    return buildWhatsAppUrl(data.rsvpWhatsapp, lines.join("\n"));
  };

  const recordLocalPrayer = (cleanedName: string, cleanedWish: string) => {
    if (!cleanedWish) return false;
    setSubmittedPrayers((prev) => [
      {
        name: cleanedName,
        relation:
          rsvpStatus === "Hadir" ? "Konfirmasi Hadir" : "Berhalangan Hadir",
        message: cleanedWish,
      },
      ...prev,
    ]);
    return true;
  };

  const handleRsvpSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanedName = rsvpName.trim();
    const cleanedWish = rsvpWish.trim();
    if (!cleanedName) {
      setRsvpError("Mohon tuliskan nama Bapak/Ibu/Dunsanak terlebih dahulu.");
      return;
    }

    setRsvpError("");
    playSfx("chat-pop");
    const addedPrayer = recordLocalPrayer(cleanedName, cleanedWish);
    if (addedPrayer) {
      setRsvpWish("");
      setRsvpFeedback(
        "Tarimo kasih, doa dan konfirmasi kehadiran sudah tercatat di Buku Tamu Dunsanak."
      );
    } else {
      setRsvpFeedback(
        `Tarimo kasih, konfirmasi kehadiran atas nama ${cleanedName} (${rsvpStatus}) sudah dicatat.`
      );
    }
  };

  const handleSendWhatsapp = () => {
    const cleanedName = rsvpName.trim();
    const cleanedWish = rsvpWish.trim();
    if (!cleanedName) {
      setRsvpError("Mohon tuliskan nama Bapak/Ibu/Dunsanak terlebih dahulu.");
      return;
    }

    setRsvpError("");
    playSfx("chat-pop");
    const addedPrayer = recordLocalPrayer(cleanedName, cleanedWish);
    if (addedPrayer) {
      setRsvpWish("");
      setRsvpFeedback(
        "Tarimo kasih, doa sudah tercatat di Buku Tamu Dunsanak dan pesan WhatsApp siap dikirim."
      );
    }
    const whatsappUrl = buildRsvpWhatsappLink(cleanedName, cleanedWish);
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const fadeUpInitial =
    prefersReducedMotion || embedded ? false : { opacity: 1, y: 12 };
  const fadeUpTarget = { opacity: 1, y: 0 };

  return (
    <div
      className={cn(
        "font-jakarta bg-[#FFFDF9] text-[#1F1716] antialiased selection:bg-[#7F1D1D] selection:text-[#FFFDF9]",
        embedded && "relative min-h-[760px] overflow-hidden"
      )}
    >
      {/* Top Songket Maroon Scroll Progress Bar */}
      {!embedded && (
        <motion.div
          aria-hidden="true"
          style={{
            scaleX: prefersReducedMotion
              ? scrollYProgress
              : smoothScrollProgress,
          }}
          className="fixed top-0 right-0 left-0 z-40 h-[3px] origin-left bg-[#7F1D1D]"
        />
      )}

      {/* Fullscreen Cover Gate */}
      <AnimatePresence>
        {!isOpened && (
          <motion.div
            key="minang-cover"
            role="dialog"
            aria-modal="true"
            aria-label={`Ondangan Baralek Gadang ${coupleTitle}`}
            initial={{ opacity: 1, y: 0 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { y: "-100%", opacity: 0 }
            }
            transition={{
              duration: prefersReducedMotion ? 0.15 : 0.7,
              ease: MINANG_EASE,
            }}
            className={cn(
              embedded ? "absolute inset-0 z-30" : "fixed inset-0 z-30",
              "flex flex-col justify-between overflow-y-auto bg-[#7F1D1D] text-[#FFFDF9]"
            )}
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <img
                src={coverImage}
                alt={`Foto sampul Baralek Gadang ${coupleTitle}`}
                className="h-full w-full object-cover opacity-28"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#450A0A]/92 via-[#7F1D1D]/86 to-[#3B0808]/96" />
              <div className="absolute inset-4 rounded-2xl border border-[#B45309]/45 sm:inset-6" />
            </div>

            <div className="relative z-10 mx-auto flex min-h-full w-full max-w-2xl flex-col items-center justify-between px-6 py-12 text-center sm:py-16">
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 1, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: MINANG_EASE }}
                className="flex flex-col items-center gap-3"
              >
                <GonjongCrest variant="light" />
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#FDE68A]">
                  Ondangan Baralek Gadang
                </p>
              </motion.div>

              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 1, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.08, ease: MINANG_EASE }}
                className="my-8 space-y-4"
              >
                <p className="text-xs uppercase tracking-[0.24em] text-[#FAF3E8]/75">
                  Aleka Anak Daro &amp; Marapulai
                </p>
                <h1 className="font-serif-editorial text-5xl font-medium italic leading-[1.15] pb-1 text-[#FFFDF9] sm:text-6xl md:text-7xl">
                  {coupleTitle}
                </h1>
                <p className="text-sm font-medium tracking-wide text-[#FAF3E8]/90">
                  {data.akad.dateLabel}
                </p>
              </motion.div>

              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 1, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.14, ease: MINANG_EASE }}
                className="w-full max-w-md rounded-2xl border border-[#B45309]/60 bg-[#450A0A]/75 px-6 py-6 shadow-2xl backdrop-blur-sm"
              >
                <p className="text-xs tracking-wide text-[#FAF3E8]/80">
                  Kepada Yth. {guestName}
                </p>
                <p className="mt-2 font-serif-editorial text-2xl font-medium italic leading-[1.15] pb-1 text-[#FDE68A] sm:text-3xl">
                  {guestName}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-[#FAF3E8]/80">
                  Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Dunsanak untuk hadir dan memberikan doa restu pada acara Baralek Gadang kami.
                </p>
                <button
                  type="button"
                  onClick={handleOpenInvitation}
                  className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-[#B45309] px-6 py-3.5 text-sm font-semibold text-[#FFFDF9] shadow-lg transition-colors hover:bg-[#92400E] active:scale-[0.99]"
                >
                  <EnvelopeOpen size={18} weight="regular" />
                  <span>Buka Undangan Baralek</span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main>
        {/* 1. Hero with Warm Venue Veil, Gonjong Crest, Blessing Quote & Countdown */}
        <section className="relative overflow-hidden bg-[#FFFDF9]">
          <div className="pointer-events-none absolute inset-0">
            <img
              src={heroVenueImage}
              alt={`Suasana pelaminan Adat Minangkabau ${coupleTitle}`}
              loading="eager"
              className="h-full w-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF9]/92 via-[#FFFDF9]/85 to-[#FAF3E8]/95" />
          </div>

          <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 sm:px-10 sm:py-24">
            <motion.div
              initial={fadeUpInitial}
              whileInView={fadeUpTarget}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.6, ease: MINANG_EASE }}
              className="mx-auto flex max-w-3xl flex-col items-center text-center"
            >
              <GonjongCrest variant="gold" />
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.28em] text-[#B45309]">
                Ondangan Baralek Gadang
              </p>
              <h2 className="mt-3 font-serif-editorial text-5xl font-medium italic leading-[1.15] pb-1 text-[#7F1D1D] sm:text-6xl lg:text-7xl">
                {coupleTitle}
              </h2>
              <p className="mt-3 text-sm font-semibold tracking-wide text-[#1F1716]/85 sm:text-base">
                {data.resepsi.dateLabel} / {data.resepsi.venueName}
              </p>

              {data.culturalNote && (
                <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[#1F1716]/80 sm:text-base">
                  {data.culturalNote}
                </p>
              )}

              <blockquote className="mt-8 max-w-2xl rounded-2xl border border-[#B45309]/35 bg-[#FFFDF9]/90 px-6 py-5 text-left shadow-sm">
                <div className="border-l-2 border-[#7F1D1D] pl-4">
                  <p className="text-sm leading-relaxed text-[#1F1716] sm:text-base">
                    &ldquo;{data.blessingQuote.text}&rdquo;
                  </p>
                  <footer className="mt-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#B45309]">
                    {data.blessingQuote.source}
                  </footer>
                </div>
              </blockquote>

              {/* Live Countdown */}
              <div className="mt-10 w-full max-w-xl">
                {countdown?.isPast ? (
                  <div className="rounded-2xl border border-[#B45309]/40 bg-[#FAF3E8] px-6 py-5 text-center">
                    <p className="font-serif-editorial text-2xl font-medium italic leading-[1.15] pb-1 text-[#7F1D1D]">
                      Hari Baralek Gadang Telah Tiba
                    </p>
                    <p className="mt-1 text-xs text-[#1F1716]/75">
                      Tarimo kasih atas kehadiran dan doa restu Bapak/Ibu/Dunsanak.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
                    {[
                      {
                        label: "Hari",
                        value: countdown ? padTwo(countdown.days) : "--",
                      },
                      {
                        label: "Jam",
                        value: countdown ? padTwo(countdown.hours) : "--",
                      },
                      {
                        label: "Menit",
                        value: countdown ? padTwo(countdown.minutes) : "--",
                      },
                      {
                        label: "Detik",
                        value: countdown ? padTwo(countdown.seconds) : "--",
                      },
                    ].map((unit) => (
                      <div
                        key={unit.label}
                        className="rounded-2xl border border-[#B45309]/35 bg-[#FFFDF9] px-2 py-4 shadow-sm sm:px-4 sm:py-5"
                      >
                        <p className="tabular-nums font-serif-editorial text-3xl font-semibold text-[#7F1D1D] sm:text-4xl">
                          {unit.value}
                        </p>
                        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B45309]">
                          {unit.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <a
                  href="#jadwal-baralek"
                  className="inline-flex items-center gap-2 rounded-full bg-[#7F1D1D] px-6 py-3 text-xs font-semibold tracking-wide text-[#FFFDF9] transition-colors hover:bg-[#661414]"
                >
                  <CalendarPlus size={16} weight="regular" />
                  <span>Lihat Jadwal Baralek</span>
                </a>
                <a
                  href="#buku-tamu-dunsanak"
                  className="inline-flex items-center gap-2 rounded-full border border-[#B45309]/50 bg-[#FFFDF9] px-6 py-3 text-xs font-semibold tracking-wide text-[#7F1D1D] transition-colors hover:bg-[#FAF3E8]"
                >
                  <WhatsappLogo size={16} weight="regular" />
                  <span>Konfirmasi Kehadiran</span>
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        <PucukRebungBand className="bg-[#FAF3E8]" />

        {/* 2. Profil Anak Daro & Marapulai in Arched Songket-Gold Cards */}
        <section className="bg-[#FAF3E8] py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-6 sm:px-10">
            <motion.div
              initial={fadeUpInitial}
              whileInView={fadeUpTarget}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.6, ease: MINANG_EASE }}
              className="mx-auto max-w-2xl text-center"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#B45309]">
                Pasangan Mempelai
              </p>
              <h2 className="mt-3 font-serif-editorial text-4xl font-medium italic leading-[1.15] pb-1 text-[#7F1D1D] sm:text-5xl">
                Anak Daro &amp; Marapulai
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#1F1716]/80 sm:text-base">
                Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami sesuai tuntunan syariat Islam dan adat Minangkabau.
              </p>
            </motion.div>

            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
              {[
                {
                  role: "Anak Daro",
                  person: data.bride,
                  delay: 0.06,
                },
                {
                  role: "Marapulai",
                  person: data.groom,
                  delay: 0.14,
                },
              ].map((item) => (
                <motion.article
                  key={item.role}
                  initial={fadeUpInitial}
                  whileInView={fadeUpTarget}
                  viewport={VIEWPORT_ONCE}
                  transition={{
                    duration: 0.65,
                    delay: item.delay,
                    ease: MINANG_EASE,
                  }}
                  className="rounded-t-[180px] rounded-b-2xl border-2 border-[#B45309]/55 bg-[#FFFDF9] p-5 shadow-sm sm:p-7"
                >
                  <div className="rounded-t-[160px] rounded-b-xl border border-[#7F1D1D]/20 bg-[#FAF3E8] p-2">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-t-[152px] rounded-b-lg bg-[#FAF3E8]">
                      <img
                        src={item.person.photoUrl}
                        alt={`Potret ${item.role} ${item.person.fullName}`}
                        loading="eager"
                        className="absolute inset-0 block h-full w-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#B45309]">
                      {item.role}
                    </p>
                    <h3 className="mt-2 font-serif-editorial text-3xl font-medium italic leading-[1.15] pb-1 text-[#7F1D1D] sm:text-4xl">
                      {item.person.nickname}
                    </h3>
                    <p className="mt-1 text-base font-semibold text-[#1F1716]">
                      {item.person.fullName}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-[#1F1716]/75">
                      {item.person.parents}
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <PucukRebungBand className="bg-[#FFFDF9]" />

        {/* 3. Rangkaian Prosesi Adat, Akad Nikah, Baralek Gadang & Dresscode */}
        <section id="jadwal-baralek" className="bg-[#FFFDF9] py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-6 sm:px-10">
            <motion.div
              initial={fadeUpInitial}
              whileInView={fadeUpTarget}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.6, ease: MINANG_EASE }}
              className="mx-auto max-w-2xl text-center"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#B45309]">
                Prosesi Adat &amp; Jadwal Utama
              </p>
              <h2 className="mt-3 font-serif-editorial text-4xl font-medium italic leading-[1.15] pb-1 text-[#7F1D1D] sm:text-5xl">
                Rangkaian Prosesi Adat
              </h2>
            </motion.div>

            {/* Ceremony Extras: Malam Bainai & Manjapuik Marapulai */}
            {data.ceremonyExtras && data.ceremonyExtras.length > 0 && (
              <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
                {data.ceremonyExtras.map((extra, idx) => (
                  <motion.div
                    key={extra.label}
                    initial={fadeUpInitial}
                    whileInView={fadeUpTarget}
                    viewport={VIEWPORT_ONCE}
                    transition={{
                      duration: 0.55,
                      delay: idx * 0.08,
                      ease: MINANG_EASE,
                    }}
                    className="rounded-2xl border border-[#B45309]/40 bg-[#FAF3E8] p-6"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#B45309]">
                      Prosesi Adat Minang
                    </p>
                    <h3 className="mt-1.5 font-serif-editorial text-2xl font-medium italic leading-[1.15] pb-1 text-[#7F1D1D]">
                      {extra.label}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#1F1716]/80">
                      {extra.detail}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Akad Nikah & Baralek Gadang Cards */}
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
              {[
                {
                  key: "akad",
                  eyebrow: "Ijab Kabul",
                  title: "Akad Nikah",
                  event: data.akad,
                  calendarUrl: akadCalendarUrl,
                },
                {
                  key: "resepsi",
                  eyebrow: "Jamuan Adat",
                  title: "Baralek Gadang",
                  event: data.resepsi,
                  calendarUrl: resepsiCalendarUrl,
                },
              ].map((card, idx) => (
                <motion.article
                  key={card.key}
                  initial={fadeUpInitial}
                  whileInView={fadeUpTarget}
                  viewport={VIEWPORT_ONCE}
                  transition={{
                    duration: 0.6,
                    delay: idx * 0.1,
                    ease: MINANG_EASE,
                  }}
                  className="flex flex-col justify-between rounded-2xl border border-[#7F1D1D]/20 bg-[#FAF3E8]/60 p-6 sm:p-8"
                >
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#B45309]">
                      {card.eyebrow}
                    </p>
                    <h3 className="mt-2 font-serif-editorial text-3xl font-medium italic leading-[1.15] pb-1 text-[#7F1D1D]">
                      {card.title}
                    </h3>

                    <dl className="mt-6 space-y-3 border-t border-[#7F1D1D]/15 pt-5 text-sm text-[#1F1716]">
                      <div className="flex items-start gap-3">
                        <CalendarPlus
                          size={18}
                          weight="regular"
                          className="mt-0.5 shrink-0 text-[#B45309]"
                        />
                        <div>
                          <dt className="sr-only">Tanggal</dt>
                          <dd className="font-semibold text-[#7F1D1D]">
                            {card.event.dateLabel}
                          </dd>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock
                          size={18}
                          weight="regular"
                          className="mt-0.5 shrink-0 text-[#B45309]"
                        />
                        <div>
                          <dt className="sr-only">Waktu</dt>
                          <dd className="tabular-nums">{card.event.timeLabel}</dd>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin
                          size={18}
                          weight="regular"
                          className="mt-0.5 shrink-0 text-[#B45309]"
                        />
                        <div>
                          <dt className="sr-only">Lokasi</dt>
                          <dd className="font-semibold text-[#7F1D1D]">
                            {card.event.venueName}
                          </dd>
                          <dd className="mt-0.5 leading-relaxed text-[#1F1716]/80">
                            {card.event.address}
                          </dd>
                        </div>
                      </div>
                    </dl>
                  </div>

                  <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
                    <a
                      href={card.event.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#7F1D1D] px-4 py-2.5 text-xs font-semibold text-[#FFFDF9] transition-colors hover:bg-[#661414]"
                    >
                      <MapPin size={15} weight="regular" />
                      <span>Buka Google Maps</span>
                      <ArrowSquareOut size={14} weight="regular" />
                    </a>
                    <a
                      href={card.calendarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#B45309]/50 bg-[#FFFDF9] px-4 py-2.5 text-xs font-semibold text-[#7F1D1D] transition-colors hover:bg-[#FAF3E8]"
                    >
                      <CalendarPlus size={15} weight="regular" />
                      <span>Simpan ke Calendar</span>
                    </a>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Songket Dresscode Swatches */}
            {data.dresscode && data.dresscode.colors.length > 0 && (
              <motion.div
                initial={fadeUpInitial}
                whileInView={fadeUpTarget}
                viewport={VIEWPORT_ONCE}
                transition={{ duration: 0.6, delay: 0.1, ease: MINANG_EASE }}
                className="mt-10 rounded-2xl border border-[#B45309]/40 bg-[#FAF3E8] p-6 sm:p-8"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-xl">
                    <div className="flex items-center gap-2 text-[#B45309]">
                      <Palette size={17} weight="regular" />
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em]">
                        Panduan Busana Songket
                      </p>
                    </div>
                    <h3 className="mt-2 font-serif-editorial text-2xl font-medium italic leading-[1.15] pb-1 text-[#7F1D1D] sm:text-3xl">
                      Nuansa Songket Minang
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#1F1716]/80">
                      {data.dresscode.note}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:shrink-0">
                    {data.dresscode.colors.map((color) => (
                      <div
                        key={color.label}
                        className="flex flex-col items-center rounded-xl border border-[#B45309]/30 bg-[#FFFDF9] p-3 text-center"
                      >
                        <span
                          aria-hidden="true"
                          style={{ backgroundColor: color.hex }}
                          className="h-11 w-full rounded-lg border border-[#1F1716]/15"
                        />
                        <span className="mt-2.5 text-xs font-semibold text-[#1F1716]">
                          {color.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        <PucukRebungBand className="bg-[#FAF3E8]" />

        {/* 4. Jejak Pertemuan (storyTimeline) */}
        <section className="bg-[#FAF3E8] py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-6 sm:px-10">
            <motion.div
              initial={fadeUpInitial}
              whileInView={fadeUpTarget}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.6, ease: MINANG_EASE }}
              className="mx-auto max-w-2xl text-center"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#B45309]">
                Kisah Dua Keluarga
              </p>
              <h2 className="mt-3 font-serif-editorial text-4xl font-medium italic leading-[1.15] pb-1 text-[#7F1D1D] sm:text-5xl">
                Jejak Pertemuan
              </h2>
            </motion.div>

            <div className="mx-auto mt-12 max-w-2xl">
              <ol className="relative space-y-8 pl-7 sm:pl-9">
                <motion.span
                  aria-hidden="true"
                  initial={
                    prefersReducedMotion || embedded ? false : { scaleY: 0 }
                  }
                  whileInView={{ scaleY: 1 }}
                  viewport={VIEWPORT_ONCE}
                  transition={{ duration: 0.85, ease: MINANG_EASE }}
                  className="absolute left-0 top-2 bottom-2 w-px origin-top bg-[#7F1D1D]/30"
                />
                {data.storyTimeline.map((item, idx) => (
                  <motion.li
                    key={`${item.year}-${item.title}`}
                    initial={
                      prefersReducedMotion || embedded
                        ? false
                        : { opacity: 1, x: -12 }
                    }
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={VIEWPORT_ONCE}
                    transition={{
                      duration: 0.55,
                      delay: idx * 0.08,
                      ease: MINANG_EASE,
                    }}
                    className="relative"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute -left-[33px] top-1.5 h-2.5 w-2.5 rounded-full border border-[#7F1D1D] bg-[#B45309] sm:-left-[41px]"
                    />
                    <div className="rounded-2xl border border-[#B45309]/35 bg-[#FFFDF9] p-6">
                      <p className="tabular-nums text-xs font-semibold uppercase tracking-[0.2em] text-[#B45309]">
                        {item.year}
                      </p>
                      <h3 className="mt-1.5 font-serif-editorial text-2xl font-medium italic leading-[1.15] pb-1 text-[#7F1D1D]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#1F1716]/80">
                        {item.description}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <PucukRebungBand className="bg-[#FFFDF9]" />

        {/* 5. Galeri Foto Adat (grid-cols-2 md:grid-cols-3) + Lightbox */}
        <section className="bg-[#FFFDF9] py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-6 sm:px-10">
            <motion.div
              initial={fadeUpInitial}
              whileInView={fadeUpTarget}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.6, ease: MINANG_EASE }}
              className="mx-auto max-w-2xl text-center"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#B45309]">
                Potret Adat &amp; Kebersamaan
              </p>
              <h2 className="mt-3 font-serif-editorial text-4xl font-medium italic leading-[1.15] pb-1 text-[#7F1D1D] sm:text-5xl">
                Galeri Foto Adat
              </h2>
            </motion.div>

            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5">
              {data.gallery.map((photoUrl, index) => (
                <motion.figure
                  key={`${photoUrl}-${index}`}
                  initial={fadeUpInitial}
                  whileInView={fadeUpTarget}
                  viewport={VIEWPORT_ONCE}
                  transition={{
                    duration: 0.55,
                    delay: (index % 3) * 0.07,
                    ease: MINANG_EASE,
                  }}
                  className="overflow-hidden rounded-2xl border border-[#B45309]/35 bg-[#FAF3E8] p-2"
                >
                  <button
                    type="button"
                    onClick={() => openLightbox(index)}
                    aria-label={`Lihat foto adat ${index + 1}`}
                    className="group block w-full cursor-pointer overflow-hidden rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7F1D1D]"
                  >
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl">
                      <img
                        src={photoUrl}
                        alt={`Potret Adat Minangkabau ${coupleTitle} foto ${index + 1}`}
                        loading="eager"
                        className="absolute inset-0 block h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </button>
                </motion.figure>
              ))}
            </div>
          </div>
        </section>

        <PucukRebungBand className="bg-[#FAF3E8]" />

        {/* 6. Tanda Kasih (1-click Copy Rekening & Alamat Kado) */}
        <section className="bg-[#FAF3E8] py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-6 sm:px-10">
            <motion.div
              initial={fadeUpInitial}
              whileInView={fadeUpTarget}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.6, ease: MINANG_EASE }}
              className="mx-auto max-w-2xl text-center"
            >
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-[#B45309]/45 bg-[#FFFDF9] text-[#B45309]">
                <Gift size={20} weight="regular" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.26em] text-[#B45309]">
                Amplop Digital &amp; Kado
              </p>
              <h2 className="mt-2 font-serif-editorial text-4xl font-medium italic leading-[1.15] pb-1 text-[#7F1D1D] sm:text-5xl">
                Tanda Kasih
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#1F1716]/80 sm:text-base">
                Doa restu Bapak/Ibu/Dunsanak merupakan karunia terindah bagi kami. Namun apabila hendak mengirimkan tanda kasih, dapat disalurkan melalui rekening atau alamat berikut.
              </p>
            </motion.div>

            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
              {data.digitalEnvelopes.map((envelope, idx) => {
                const isCopied = copiedAccount === envelope.accountNumber;
                return (
                  <motion.div
                    key={`${envelope.bankName}-${envelope.accountNumber}`}
                    initial={fadeUpInitial}
                    whileInView={fadeUpTarget}
                    viewport={VIEWPORT_ONCE}
                    transition={{
                      duration: 0.55,
                      delay: idx * 0.08,
                      ease: MINANG_EASE,
                    }}
                    className="flex flex-col justify-between rounded-2xl border border-[#B45309]/40 bg-[#FFFDF9] p-6"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B45309]">
                        Bank {envelope.bankName}
                      </p>
                      <p className="tabular-nums mt-3 text-2xl font-semibold tracking-tight text-[#7F1D1D]">
                        {envelope.accountNumber}
                      </p>
                      <p className="mt-1 text-sm text-[#1F1716]/80">
                        a.n. {envelope.accountHolder}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyAccount(envelope.accountNumber)}
                      className={cn(
                        "mt-6 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition-colors",
                        isCopied
                          ? "border-[#7F1D1D] bg-[#7F1D1D] text-[#FFFDF9]"
                          : "border-[#B45309]/45 bg-[#FAF3E8] text-[#7F1D1D] hover:bg-[#7F1D1D] hover:text-[#FFFDF9]"
                      )}
                    >
                      {isCopied ? (
                        <>
                          <Check size={15} weight="bold" />
                          <span>Rekening Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy size={15} weight="regular" />
                          <span>Salin Nomor Rekening</span>
                        </>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {data.giftAddress && (
              <motion.div
                initial={fadeUpInitial}
                whileInView={fadeUpTarget}
                viewport={VIEWPORT_ONCE}
                transition={{ duration: 0.55, delay: 0.14, ease: MINANG_EASE }}
                className="mt-6 flex flex-col justify-between gap-5 rounded-2xl border border-[#B45309]/40 bg-[#FFFDF9] p-6 sm:flex-row sm:items-center sm:p-7"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[#B45309]">
                    <Package size={16} weight="regular" />
                    <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                      Kirim Kado Fisik
                    </p>
                  </div>
                  <p className="text-base font-semibold text-[#7F1D1D]">
                    {data.giftAddress.recipient}
                  </p>
                  <p className="text-sm leading-relaxed text-[#1F1716]/80">
                    {data.giftAddress.address}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleCopyAddress(
                      `${data.giftAddress?.recipient}\n${data.giftAddress?.address}`
                    )
                  }
                  className={cn(
                    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-xs font-semibold transition-colors",
                    copiedAddress
                      ? "border-[#7F1D1D] bg-[#7F1D1D] text-[#FFFDF9]"
                      : "border-[#B45309]/45 bg-[#FAF3E8] text-[#7F1D1D] hover:bg-[#7F1D1D] hover:text-[#FFFDF9]"
                  )}
                >
                  {copiedAddress ? (
                    <>
                      <Check size={15} weight="bold" />
                      <span>Alamat Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy size={15} weight="regular" />
                      <span>Salin Alamat</span>
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </div>
        </section>

        <PucukRebungBand className="bg-[#FFFDF9]" />

        {/* 7. Buku Tamu Dunsanak, RSVP WhatsApp & Bulk Guest Link Generator */}
        <section id="buku-tamu-dunsanak" className="bg-[#FFFDF9] py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-6 sm:px-10">
            <motion.div
              initial={fadeUpInitial}
              whileInView={fadeUpTarget}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.6, ease: MINANG_EASE }}
              className="text-center"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#B45309]">
                Buku Tamu &amp; RSVP
              </p>
              <h2 className="mt-3 font-serif-editorial text-4xl font-medium italic leading-[1.15] pb-1 text-[#7F1D1D] sm:text-5xl">
                Buku Tamu Dunsanak
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#1F1716]/80 sm:text-base">
                Kehadiran serta doa restu Bapak/Ibu/Dunsanak menjadi kebahagiaan tersendiri bagi keluarga besar kami. Silakan tuliskan ucapan atau konfirmasi kehadiran melalui WhatsApp.
              </p>
            </motion.div>

            <motion.form
              onSubmit={handleRsvpSubmit}
              initial={fadeUpInitial}
              whileInView={fadeUpTarget}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.6, delay: 0.08, ease: MINANG_EASE }}
              className="mt-10 rounded-2xl border border-[#B45309]/35 bg-[#FAF3E8]/75 p-6 sm:p-8"
            >
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="minang-rsvp-name"
                    className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#7F1D1D]"
                  >
                    Nama Tamu / Dunsanak
                  </label>
                  <input
                    id="minang-rsvp-name"
                    type="text"
                    value={rsvpName}
                    onChange={(event) => {
                      setRsvpName(event.target.value);
                      if (rsvpError) setRsvpError("");
                      if (rsvpFeedback) setRsvpFeedback("");
                    }}
                    placeholder="Tuliskan nama lengkap Bapak/Ibu/Dunsanak"
                    className="mt-2 w-full rounded-xl border border-[#B45309]/35 bg-[#FFFDF9] px-4 py-3 text-sm text-[#1F1716] placeholder:text-[#1F1716]/45 focus:border-[#7F1D1D] focus:outline-none"
                  />
                  {rsvpError && (
                    <p className="mt-1.5 text-xs font-medium text-[#7F1D1D]">
                      {rsvpError}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#7F1D1D]">
                      Status Kehadiran
                    </span>
                    <div className="mt-2 grid grid-cols-2 gap-2.5">
                      {(["Hadir", "Berhalangan"] as const).map((status) => {
                        const active = rsvpStatus === status;
                        return (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setRsvpStatus(status)}
                            className={cn(
                              "cursor-pointer rounded-xl border px-3 py-3 text-xs font-semibold transition-colors",
                              active
                                ? "border-[#7F1D1D] bg-[#7F1D1D] text-[#FFFDF9]"
                                : "border-[#B45309]/35 bg-[#FFFDF9] text-[#7F1D1D] hover:bg-[#FAF3E8]"
                            )}
                          >
                            {status}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="minang-rsvp-count"
                      className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#7F1D1D]"
                    >
                      Jumlah Tamu
                    </label>
                    <div className="relative mt-2">
                      <Users
                        size={16}
                        weight="regular"
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7F1D1D]/65"
                      />
                      <select
                        id="minang-rsvp-count"
                        value={rsvpCount}
                        disabled={rsvpStatus === "Berhalangan"}
                        onChange={(event) => setRsvpCount(event.target.value)}
                        className="w-full rounded-xl border border-[#B45309]/35 bg-[#FFFDF9] py-3 pl-10 pr-4 text-sm text-[#1F1716] focus:border-[#7F1D1D] focus:outline-none disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400"
                      >
                        <option value="1">1 Orang</option>
                        <option value="2">2 Orang</option>
                        <option value="3">3 Orang</option>
                        <option value="4">4 Orang</option>
                        <option value="5">5 Orang</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="minang-rsvp-wish"
                    className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#7F1D1D]"
                  >
                    Doa &amp; Ucapan
                  </label>
                  <textarea
                    id="minang-rsvp-wish"
                    rows={3}
                    value={rsvpWish}
                    onChange={(event) => {
                      setRsvpWish(event.target.value);
                      if (rsvpFeedback) setRsvpFeedback("");
                    }}
                    placeholder="Tuliskan doa restu untuk Anak Daro & Marapulai"
                    className="mt-2 w-full rounded-xl border border-[#B45309]/35 bg-[#FFFDF9] px-4 py-3 text-sm text-[#1F1716] placeholder:text-[#1F1716]/45 focus:border-[#7F1D1D] focus:outline-none"
                  />
                </div>

                {rsvpFeedback && (
                  <p className="rounded-xl border border-[#B45309]/40 bg-[#FFFDF9] px-4 py-3 text-xs font-medium text-[#7F1D1D]">
                    {rsvpFeedback}
                  </p>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#7F1D1D] px-6 py-3.5 text-sm font-semibold text-[#FFFDF9] transition-colors hover:bg-[#661414] active:scale-[0.99]"
                  >
                    <Heart size={18} weight="regular" />
                    <span>Kirim Ucapan</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSendWhatsapp}
                    className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#B45309]/50 bg-[#FFFDF9] px-6 py-3.5 text-sm font-semibold text-[#7F1D1D] transition-colors hover:bg-[#FAF3E8] active:scale-[0.99]"
                  >
                    <WhatsappLogo size={18} weight="regular" />
                    <span>Kirim RSVP ke WhatsApp</span>
                  </button>
                </div>
              </div>
            </motion.form>

            {/* Daftar Doa Dunsanak */}
            {allPrayers.length > 0 && (
              <div className="mt-12">
                <div className="flex items-baseline justify-between border-b border-[#B45309]/25 pb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#B45309]">
                      Doa Restu
                    </p>
                    <h3 className="mt-1 font-serif-editorial text-2xl font-medium italic leading-[1.15] pb-1 text-[#7F1D1D] sm:text-3xl">
                      Papan Doa Dunsanak
                    </h3>
                  </div>
                  <p className="tabular-nums text-xs font-semibold uppercase tracking-[0.16em] text-[#7F1D1D]/75">
                    {allPrayers.length} Ucapan
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {allPrayers.map((prayer, idx) => (
                    <motion.article
                      key={`${prayer.name}-${idx}`}
                      initial={fadeUpInitial}
                      whileInView={fadeUpTarget}
                      viewport={VIEWPORT_ONCE}
                      transition={{
                        duration: 0.45,
                        delay: Math.min(idx, 5) * 0.06,
                        ease: MINANG_EASE,
                      }}
                      className="rounded-2xl border border-[#B45309]/30 bg-[#FAF3E8]/60 p-5"
                    >
                      <p className="text-sm font-semibold text-[#7F1D1D]">
                        {prayer.name}
                      </p>
                      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B45309]">
                        {prayer.relation}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-[#1F1716]/85">
                        &ldquo;{prayer.message}&rdquo;
                      </p>
                    </motion.article>
                  ))}
                </div>
              </div>
            )}

            {/* Collapsible Bulk Guest Link Generator (?share=1) */}
            <div className="mt-10 rounded-2xl border border-[#B45309]/35 bg-[#FAF3E8]/45">
              <button
                type="button"
                aria-expanded={isShareOpen}
                onClick={() => {
                  playSfx("paper-flip");
                  setIsShareOpen((prev) => !prev);
                }}
                className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#7F1D1D]/10 text-[#7F1D1D]">
                    <ShareNetwork size={18} weight="regular" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#7F1D1D]">
                      Buat Link Undangan Khusus Tamu
                    </p>
                    <p className="text-xs text-[#1F1716]/70">
                      Siapkan link personal dengan nama tamu otomatis untuk dibagikan ke WhatsApp.
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-[#7F1D1D]">
                  {isShareOpen ? (
                    <CaretUp size={18} weight="bold" />
                  ) : (
                    <CaretDown size={18} weight="bold" />
                  )}
                </span>
              </button>

              {isShareOpen && (
                <div className="border-t border-[#B45309]/25 px-6 py-6">
                  <label
                    htmlFor="minang-guest-link-input"
                    className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#7F1D1D]"
                  >
                    Daftar Nama Tamu (1 Nama per Baris)
                  </label>
                  <textarea
                    id="minang-guest-link-input"
                    rows={4}
                    value={guestListInput}
                    onChange={(event) => setGuestListInput(event.target.value)}
                    placeholder={
                      "Datuak Rajo Alam\nKeluarga Bapak H. Darmawan\nUda Hendra & Keluarga"
                    }
                    className="mt-2 w-full rounded-xl border border-[#B45309]/35 bg-[#FFFDF9] px-4 py-3 text-sm text-[#1F1716] placeholder:text-[#1F1716]/45 focus:border-[#7F1D1D] focus:outline-none"
                  />

                  {generatedGuestLinks.length > 0 && (
                    <div className="mt-5 space-y-2.5">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B45309]">
                        Link Siap Bagikan ({generatedGuestLinks.length})
                      </p>
                      <ul className="space-y-2.5">
                        {generatedGuestLinks.map((item, idx) => {
                          const isCopied = copiedGuestLink === item.url;
                          return (
                            <li
                              key={`${item.name}-${idx}`}
                              className="flex flex-col justify-between gap-3 rounded-xl border border-[#B45309]/25 bg-[#FFFDF9] p-3.5 sm:flex-row sm:items-center"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#7F1D1D]">
                                  {item.name}
                                </p>
                                <p className="truncate text-xs text-[#1F1716]/75">
                                  {item.url}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopyGuestLink(item.url)}
                                className={cn(
                                  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
                                  isCopied
                                    ? "border-[#7F1D1D] bg-[#7F1D1D] text-[#FFFDF9]"
                                    : "border-[#B45309]/45 bg-[#FAF3E8] text-[#7F1D1D] hover:bg-[#7F1D1D] hover:text-[#FFFDF9]"
                                )}
                              >
                                {isCopied ? (
                                  <>
                                    <Check size={14} weight="bold" />
                                    <span>Tersalin</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={14} weight="regular" />
                                    <span>Salin Link</span>
                                  </>
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#B45309]/25 bg-[#FAF3E8] px-6 py-10 text-center">
        <div className="mx-auto flex max-w-xl flex-col items-center">
          <GonjongCrest variant="gold" className="h-9 sm:h-10" />
          <div className="mt-3 inline-flex items-center gap-2 text-[#B45309]">
            <Heart size={16} weight="fill" />
            <span className="font-serif-editorial text-xl font-medium italic leading-[1.15] pb-1 text-[#7F1D1D]">
              {coupleTitle}
            </span>
          </div>
          <p className="mt-3 text-xs text-[#1F1716]/70">
            Undangan digital dibuat lewat{" "}
            <Link
              href="/"
              className="font-semibold text-[#7F1D1D] underline decoration-[#B45309]/60 underline-offset-4 transition-colors hover:text-[#B45309]"
            >
              KatalogWeb
            </Link>
          </p>
        </div>
      </footer>

      <MusicPlayer
        track={site.musicTrack}
        autoPlayTrigger={isOpened}
        className={embedded ? "absolute right-4 bottom-4 z-20" : undefined}
      />

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeLightboxUrl && lightboxIndex !== null && (
          <motion.div
            key="minang-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label="Detail foto galeri adat"
            className={cn(
              embedded ? "absolute inset-0 z-50" : "fixed inset-0 z-50",
              "flex items-center justify-center bg-[#1F1716]/85 p-4 backdrop-blur-xs"
            )}
          >
            <motion.div
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.96 }
              }
              animate={{ opacity: 1, scale: 1 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.96 }
              }
              transition={{ duration: 0.2, ease: MINANG_EASE }}
              onClick={(event) => event.stopPropagation()}
              className="relative w-full max-w-2xl rounded-2xl border border-[#B45309]/45 bg-[#FFFDF9] p-4 shadow-2xl sm:p-6"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="tabular-nums text-xs font-semibold uppercase tracking-[0.16em] text-[#B45309]">
                  {lightboxIndex + 1} / {totalPhotos} - Galeri {coupleTitle}
                </span>
                <button
                  type="button"
                  onClick={closeLightbox}
                  aria-label="Tutup foto"
                  className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#B45309]/35 text-[#7F1D1D] transition-colors hover:bg-[#FAF3E8]"
                >
                  <X size={16} weight="bold" />
                </button>
              </div>

              <div className="max-h-[65dvh] overflow-hidden rounded-xl bg-[#FAF3E8]">
                <img
                  src={activeLightboxUrl}
                  alt={`Potret Adat Minangkabau ${coupleTitle} ${lightboxIndex + 1}`}
                  className="max-h-[65dvh] w-full object-contain"
                />
              </div>

              <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <p className="font-serif-editorial text-xl font-medium italic leading-[1.15] pb-1 text-[#7F1D1D]">
                  Baralek Gadang {coupleTitle}
                </p>

                {totalPhotos > 1 && (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={goPrevPhoto}
                      aria-label="Foto sebelumnya"
                      className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-[#B45309]/45 bg-[#FFFDF9] px-4 py-2 text-xs font-semibold text-[#7F1D1D] transition-colors hover:bg-[#FAF3E8]"
                    >
                      <CaretLeft size={14} weight="bold" />
                      <span>Prev</span>
                    </button>
                    <button
                      type="button"
                      onClick={goNextPhoto}
                      aria-label="Foto berikutnya"
                      className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-[#7F1D1D] px-4 py-2 text-xs font-semibold text-[#FFFDF9] transition-colors hover:bg-[#661414]"
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

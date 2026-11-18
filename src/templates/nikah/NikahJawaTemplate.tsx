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
  DoorOpen,
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

const KERATON_EASE = [0.22, 1, 0.36, 1] as const;
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
    : "20270110";
  const defaultStart = isoMatch ? `${isoMatch[4]}${isoMatch[5]}00` : "080000";

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

function GununganKayonEmblem({
  className,
  stroke = "#92400E",
}: {
  className?: string;
  stroke?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 80 112"
      fill="none"
      className={className}
    >
      <path
        d="M40 6C49 24 66 44 68 72C69 86 60 96 52 98H28C20 96 11 86 12 72C14 44 31 24 40 6Z"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M40 16C46 31 58 48 59 71C60 81 54 88 48 90H32C26 88 20 81 21 71C22 48 34 31 40 16Z"
        stroke={stroke}
        strokeWidth="1"
        strokeOpacity="0.6"
        strokeLinejoin="round"
      />
      <line
        x1="40"
        y1="26"
        x2="40"
        y2="98"
        stroke={stroke}
        strokeWidth="1.3"
      />
      <path
        d="M40 50C33 46 28 48 25 53M40 50C47 46 52 48 55 53M40 65C31 61 25 64 22 70M40 65C49 61 55 64 58 70M40 80C33 77 28 80 26 85M40 80C47 77 52 80 54 85"
        stroke={stroke}
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <rect
        x="26"
        y="98"
        width="28"
        height="6"
        rx="1.5"
        stroke={stroke}
        strokeWidth="1.4"
      />
      <circle cx="40" cy="40" r="2.2" fill={stroke} />
    </svg>
  );
}

function KawungDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "mx-auto flex w-full max-w-xs items-center justify-center gap-3",
        className
      )}
    >
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#92400E]/45" />
      <svg viewBox="0 0 64 20" fill="none" className="h-5 w-16 shrink-0">
        <circle cx="8" cy="10" r="1.6" fill="#92400E" fillOpacity="0.65" />
        <path
          d="M32 3L39 10L32 17L25 10L32 3Z"
          stroke="#92400E"
          strokeWidth="1.2"
        />
        <circle cx="32" cy="10" r="1.8" fill="#92400E" />
        <path
          d="M21 10C22.8 8.2 24.8 8.2 26.2 10C24.8 11.8 22.8 11.8 21 10Z"
          stroke="#92400E"
          strokeOpacity="0.7"
          strokeWidth="1"
        />
        <path
          d="M37.8 10C39.2 8.2 41.2 8.2 43 10C41.2 11.8 39.2 11.8 37.8 10Z"
          stroke="#92400E"
          strokeOpacity="0.7"
          strokeWidth="1"
        />
        <circle cx="56" cy="10" r="1.6" fill="#92400E" fillOpacity="0.65" />
      </svg>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#92400E]/45" />
    </div>
  );
}

export function NikahJawaTemplate({
  site,
  embedded = false,
}: {
  site: NikahSiteConfig;
  embedded?: boolean;
}) {
  const { data } = site;
  const prefersReducedMotion = useReducedMotion();

  const [isOpened, setIsOpened] = useState(embedded);
  const [guestName, setGuestName] = useState("Para Tamu Kinurmatan");
  const [countdown, setCountdown] = useState<CountdownState | null>(null);

  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const copyTimerRef = useRef<number | null>(null);

  const [copiedAddress, setCopiedAddress] = useState(false);
  const addressTimerRef = useRef<number | null>(null);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const [rsvpName, setRsvpName] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState<"Hadir" | "Berhalangan">(
    "Hadir"
  );
  const [rsvpCount, setRsvpCount] = useState("2");
  const [rsvpWish, setRsvpWish] = useState("");
  const [rsvpError, setRsvpError] = useState("");
  const [rsvpFeedback, setRsvpFeedback] = useState("");
  const [submittedPrayers, setSubmittedPrayers] = useState<PrayerEntry[]>([]);

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [guestListInput, setGuestListInput] = useState(
    "Kanjeng Bapak Haryono\nIbu Endang Kusuma & Keluarga\nMas Pratama & Partner"
  );
  const [copiedGuestLink, setCopiedGuestLink] = useState<string | null>(null);
  const guestCopyTimerRef = useRef<number | null>(null);

  const { scrollYProgress } = useScroll();
  const progressScaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
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
    if (typeof window === "undefined") return;
    data.gallery.forEach((src) => {
      const img = new Image();
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
    setLightboxIndex((prev) => {
      if (prev === null || totalPhotos === 0) return null;
      return (prev - 1 + totalPhotos) % totalPhotos;
    });
  }, [totalPhotos]);

  const goNextPhoto = useCallback(() => {
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
  const heroVenueBg = "/demo/nikah-jawa-venue.webp";
  const heroPortrait = data.gallery[0] ?? "/demo/nikah-jawa-couple.webp";
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
        title: `Ijab Qabul & Panggih ${coupleTitle}`,
        weddingDateIso: data.weddingDateIso,
        timeLabel: data.akad.timeLabel,
        venueName: data.akad.venueName,
        address: data.akad.address,
        details: `Serat Ulem Ijab Qabul ${data.groom.fullName} & ${data.bride.fullName}.`,
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
        title: `Pahargyan Pawiwahan ${coupleTitle}`,
        weddingDateIso: data.weddingDateIso,
        timeLabel: data.resepsi.timeLabel,
        venueName: data.resepsi.venueName,
        address: data.resepsi.address,
        details: `Serat Ulem Pahargyan Pawiwahan ${data.groom.fullName} & ${data.bride.fullName}.`,
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

  const handleOpenPendopo = () => {
    playSfx("gong-jawa");
    setIsOpened(true);
  };

  const handleCopyAccount = async (accountNumber: string) => {
    try {
      await navigator.clipboard.writeText(accountNumber);
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
      `Sugeng rawuh ${coupleTitle}, kula badhe ngaturaken konfirmasi kehadiran:`,
      "",
      `Nama Tamu: ${cleanedName}`,
      `Kehadiran: ${rsvpStatus}`,
    ];

    if (rsvpStatus === "Hadir") {
      lines.push(`Jumlah Tamu: ${rsvpCount || "1"} tiyang`);
    }

    if (cleanedWish) {
      lines.push(`Pangestu & Doa: ${cleanedWish}`);
    }

    return buildWhatsAppUrl(data.rsvpWhatsapp, lines.join("\n"));
  };

  const recordLocalPrayer = (cleanedName: string, cleanedWish: string) => {
    if (!cleanedWish) return false;
    setSubmittedPrayers((prev) => [
      {
        name: cleanedName,
        relation:
          rsvpStatus === "Hadir" ? "Konfirmasi Rawuh" : "Berhalangan Rawuh",
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
      setRsvpError("Mohon menuliskan nama Bapak/Ibu/Saudara/i terlebih dahulu.");
      return;
    }

    setRsvpError("");
    const addedPrayer = recordLocalPrayer(cleanedName, cleanedWish);
    if (addedPrayer) {
      setRsvpWish("");
      setRsvpFeedback(
        "Matur nuwun, doa pangestu lan konfirmasi rawuh sampun kacathet ing Papan Pangestu."
      );
    } else {
      setRsvpFeedback(
        `Matur nuwun, konfirmasi rawuh atas nama ${cleanedName} (${rsvpStatus}) sampun kacathet.`
      );
    }
  };

  const handleSendWhatsapp = () => {
    const cleanedName = rsvpName.trim();
    const cleanedWish = rsvpWish.trim();
    if (!cleanedName) {
      setRsvpError("Mohon menuliskan nama Bapak/Ibu/Saudara/i terlebih dahulu.");
      return;
    }

    setRsvpError("");
    const addedPrayer = recordLocalPrayer(cleanedName, cleanedWish);
    if (addedPrayer) {
      setRsvpWish("");
      setRsvpFeedback(
        "Matur nuwun, pangestu sampun kacathet lan pesan WhatsApp siap dikirim."
      );
    }
    const whatsappUrl = buildRsvpWhatsappLink(cleanedName, cleanedWish);
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const fadeUpInitial =
    prefersReducedMotion || embedded ? false : { opacity: 1, y: 14 };
  const fadeUpTarget = { opacity: 1, y: 0 };

  return (
    <div
      className={cn(
        "font-jakarta bg-[#FCF9F2] text-[#3E2723] antialiased selection:bg-[#3E2723] selection:text-[#FCF9F2]",
        embedded && "relative min-h-[760px] overflow-hidden"
      )}
    >
      {/* Top Keraton Gold Reading Progress Bar */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX: progressScaleX }}
        className={cn(
          embedded ? "sticky top-0 left-0 right-0" : "fixed top-0 left-0 right-0",
          "z-40 h-1 origin-left bg-[#92400E]"
        )}
      />

      {/* Pendopo Split-Door Cover (!embedded) */}
      <AnimatePresence>
        {!embedded && !isOpened && (
          <motion.div
            key="pendopo-split-door"
            role="dialog"
            aria-modal="true"
            aria-label={`Serat Ulem Pawiwahan ${coupleTitle}`}
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: {
                duration: prefersReducedMotion ? 0.2 : 0.35,
                delay: prefersReducedMotion ? 0 : 0.55,
              },
            }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          >
            {/* Left Carved Sogan Door Panel */}
            <motion.div
              aria-hidden="true"
              initial={{ x: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { x: "-100%" }}
              transition={{
                duration: prefersReducedMotion ? 0.2 : 0.85,
                ease: KERATON_EASE,
              }}
              className="absolute inset-y-0 left-0 w-1/2 border-r border-[#92400E]/60 bg-[#2C1A17]"
            >
              <div className="absolute inset-4 border border-[#92400E]/30 sm:inset-7" />
              <div className="absolute inset-8 border border-[#92400E]/15 sm:inset-11" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(146,64,14,0.18),transparent_65%)]" />
            </motion.div>

            {/* Right Carved Sogan Door Panel */}
            <motion.div
              aria-hidden="true"
              initial={{ x: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { x: "100%" }}
              transition={{
                duration: prefersReducedMotion ? 0.2 : 0.85,
                ease: KERATON_EASE,
              }}
              className="absolute inset-y-0 right-0 w-1/2 border-l border-[#92400E]/60 bg-[#2C1A17]"
            >
              <div className="absolute inset-4 border border-[#92400E]/30 sm:inset-7" />
              <div className="absolute inset-8 border border-[#92400E]/15 sm:inset-11" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(146,64,14,0.18),transparent_65%)]" />
            </motion.div>

            {/* Center Invitation Card */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.96 }
              }
              transition={{ duration: 0.45, ease: KERATON_EASE }}
              className="relative z-10 mx-4 flex w-full max-w-md flex-col items-center rounded-2xl border border-[#92400E]/55 bg-[#3E2723]/95 px-6 py-9 text-center text-[#FCF9F2] shadow-2xl sm:px-9 sm:py-11"
            >
              <GununganKayonEmblem
                className="h-20 w-14"
                stroke="#E2C08D"
              />

              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#E2C08D]">
                Serat Ulem Pawiwahan
              </p>

              <h1 className="mt-3 font-serif-editorial text-4xl font-medium italic leading-[1.15] pb-1 text-[#FCF9F2] sm:text-5xl">
                {coupleTitle}
              </h1>

              <p className="mt-2 text-xs font-medium tracking-wider text-[#F5EFE4]/80">
                {data.akad.dateLabel}
              </p>

              <div className="mt-6 w-full rounded-xl border border-[#92400E]/45 bg-[#2C1A17]/75 px-5 py-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E2C08D]">
                  Katur Dhumateng
                </p>
                <p className="mt-2 font-serif-editorial text-2xl font-medium italic leading-[1.2] text-[#FCF9F2] sm:text-3xl">
                  {guestName}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-[#F5EFE4]/75">
                  Kanthi kurmat, kula ngaturi rawuh panjenengan ing adicara suci pawiwahan putra-putri kula.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenPendopo}
                className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full border border-[#E2C08D]/40 bg-[#92400E] px-6 py-3.5 text-sm font-semibold text-[#FCF9F2] shadow-md transition-colors hover:bg-[#78350F] active:scale-[0.99]"
              >
                <DoorOpen size={18} weight="regular" />
                <span>Buka Regol Pendopo</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main>
        {/* 1. Hero Section with Venue Ambience, Atur Pambagya & Countdown */}
        <section className="relative overflow-hidden border-b border-[#92400E]/20 bg-[#FCF9F2]">
          <div className="pointer-events-none absolute inset-0">
            <img
              src={heroVenueBg}
              alt="Suasana Pendopo Agung Joglo Keraton"
              className="h-full w-full object-cover opacity-15"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#FCF9F2]/92 via-[#FCF9F2]/85 to-[#FCF9F2]" />
          </div>

          <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-16 sm:px-10 lg:grid-cols-12 lg:gap-12 lg:py-24">
            <div className="lg:col-span-7">
              <motion.div
                initial={fadeUpInitial}
                whileInView={fadeUpTarget}
                viewport={VIEWPORT_ONCE}
                transition={{ duration: 0.55, ease: KERATON_EASE }}
                className="flex items-center gap-3"
              >
                <GununganKayonEmblem className="h-11 w-8" stroke="#92400E" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#92400E]">
                    Pawiwahan Adat Jawa Keraton
                  </p>
                  <p className="mt-0.5 text-xs text-[#3E2723]/75">
                    {data.akad.dateLabel}
                  </p>
                </div>
              </motion.div>

              <motion.h2
                initial={fadeUpInitial}
                whileInView={fadeUpTarget}
                viewport={VIEWPORT_ONCE}
                transition={{ duration: 0.65, delay: 0.08, ease: KERATON_EASE }}
                className="mt-5 font-serif-editorial text-5xl font-medium italic leading-[1.12] pb-1 text-[#3E2723] sm:text-6xl lg:text-7xl"
              >
                {coupleTitle}
              </motion.h2>

              <motion.p
                initial={fadeUpInitial}
                whileInView={fadeUpTarget}
                viewport={VIEWPORT_ONCE}
                transition={{ duration: 0.6, delay: 0.14, ease: KERATON_EASE }}
                className="mt-3 text-sm font-medium text-[#3E2723]/80 sm:text-base"
              >
                {data.akad.venueName}, {data.akad.address}
              </motion.p>

              {data.culturalNote && (
                <motion.p
                  initial={fadeUpInitial}
                  whileInView={fadeUpTarget}
                  viewport={VIEWPORT_ONCE}
                  transition={{ duration: 0.6, delay: 0.18, ease: KERATON_EASE }}
                  className="mt-6 rounded-xl border border-[#92400E]/25 bg-[#F5EFE4]/80 px-5 py-4 text-sm italic leading-relaxed text-[#3E2723]"
                >
                  &ldquo;{data.culturalNote}&rdquo;
                </motion.p>
              )}

              <motion.blockquote
                initial={fadeUpInitial}
                whileInView={fadeUpTarget}
                viewport={VIEWPORT_ONCE}
                transition={{ duration: 0.65, delay: 0.22, ease: KERATON_EASE }}
                className="mt-6 border-l-2 border-[#92400E] pl-5"
              >
                <p className="text-sm leading-relaxed text-[#3E2723]/90 sm:text-base">
                  &ldquo;{data.blessingQuote.text}&rdquo;
                </p>
                <footer className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#92400E]">
                  {data.blessingQuote.source}
                </footer>
              </motion.blockquote>

              {/* Live Countdown */}
              <div className="mt-8">
                {countdown?.isPast ? (
                  <div className="rounded-xl border border-[#92400E]/30 bg-[#F5EFE4] px-5 py-4">
                    <p className="font-serif-editorial text-2xl font-medium italic text-[#3E2723]">
                      Dinten Agung Sampun Dumugi
                    </p>
                    <p className="mt-1 text-xs text-[#3E2723]/75">
                      Matur nuwun awit rawuh lan donga pangestunipun.
                    </p>
                  </div>
                ) : (
                  <div className="grid max-w-lg grid-cols-4 gap-2.5 sm:gap-3.5">
                    {[
                      {
                        label: "Dinten",
                        sub: "Hari",
                        value: countdown ? padTwo(countdown.days) : "--",
                      },
                      {
                        label: "Tabuh",
                        sub: "Jam",
                        value: countdown ? padTwo(countdown.hours) : "--",
                      },
                      {
                        label: "Menit",
                        sub: "Menit",
                        value: countdown ? padTwo(countdown.minutes) : "--",
                      },
                      {
                        label: "Detik",
                        sub: "Detik",
                        value: countdown ? padTwo(countdown.seconds) : "--",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl border border-[#92400E]/25 bg-[#F5EFE4] px-2.5 py-3.5 text-center"
                      >
                        <p className="tabular-nums font-serif-editorial text-2xl font-semibold text-[#3E2723] sm:text-3xl">
                          {item.value}
                        </p>
                        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#92400E]">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <motion.div
                initial={fadeUpInitial}
                whileInView={fadeUpTarget}
                viewport={VIEWPORT_ONCE}
                transition={{ duration: 0.6, delay: 0.26, ease: KERATON_EASE }}
                className="mt-7 flex flex-wrap items-center gap-3"
              >
                <a
                  href="#tata-cara"
                  className="inline-flex items-center gap-2 rounded-full bg-[#3E2723] px-5 py-2.5 text-xs font-semibold tracking-wide text-[#FCF9F2] transition-colors hover:bg-[#52342F]"
                >
                  <CalendarPlus size={16} weight="regular" />
                  <span>Tata Cara &amp; Jadwal</span>
                </a>
                <a
                  href="#pangestu-rsvp"
                  className="inline-flex items-center gap-2 rounded-full border border-[#92400E]/40 bg-[#FCF9F2] px-5 py-2.5 text-xs font-semibold tracking-wide text-[#3E2723] transition-colors hover:bg-[#F5EFE4]"
                >
                  <WhatsappLogo size={16} weight="regular" />
                  <span>Atur Pangestu &amp; RSVP</span>
                </a>
              </motion.div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-[#92400E]/35 bg-[#F5EFE4] p-3 shadow-sm">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-[#92400E]/20">
                  <motion.img
                    src={heroPortrait}
                    alt={`Potret pawiwahan ${data.groom.fullName} dan ${data.bride.fullName}`}
                    loading="eager"
                    initial={
                      prefersReducedMotion || embedded
                        ? false
                        : { scale: 1.03, opacity: 1 }
                    }
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={VIEWPORT_ONCE}
                    transition={{ duration: 0.9, ease: KERATON_EASE }}
                    className="absolute inset-0 block h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Profil Mempelai Putri (Paes Ageng) & Mempelai Kakung (Beskap Blangkon) */}
        <section className="border-b border-[#92400E]/20 bg-[#F5EFE4] py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-6 sm:px-10">
            <motion.div
              initial={fadeUpInitial}
              whileInView={fadeUpTarget}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.6, ease: KERATON_EASE }}
              className="mx-auto max-w-2xl text-center"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#92400E]">
                Calon Pengantin
              </p>
              <h2 className="mt-3 font-serif-editorial text-4xl font-medium italic leading-[1.15] pb-1 text-[#3E2723] sm:text-5xl">
                Mempelai Berbahagia
              </h2>
              <KawungDivider className="mt-4" />
              <p className="mt-4 text-sm leading-relaxed text-[#3E2723]/80 sm:text-base">
                Kanthi nyuwun rahmat lan berkahing Gusti Kang Murbeng Dumadi, keparenga kula ngaturaken pawarta kabingahan pawiwahan putra-putri kula.
              </p>
            </motion.div>

            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
              {/* Mempelai Putri - Paes Ageng */}
              <motion.article
                initial={fadeUpInitial}
                whileInView={fadeUpTarget}
                viewport={VIEWPORT_ONCE}
                transition={{ duration: 0.65, delay: 0.08, ease: KERATON_EASE }}
                className="rounded-2xl border border-[#92400E]/35 bg-[#FCF9F2] p-6 shadow-xs sm:p-8"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-[#92400E]/25 bg-[#F5EFE4]">
                  <img
                    src={data.bride.photoUrl}
                    alt={`Potret mempelai putri ${data.bride.fullName}`}
                    loading="eager"
                    className="absolute inset-0 block h-full w-full object-cover"
                  />
                </div>
                <div className="mt-6 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#92400E]">
                    Mempelai Putri / Paes Ageng
                  </p>
                  <h3 className="mt-2 font-serif-editorial text-3xl font-medium italic leading-[1.15] pb-1 text-[#3E2723] sm:text-4xl">
                    {data.bride.nickname}
                  </h3>
                  <p className="mt-1 text-base font-semibold text-[#3E2723]">
                    {data.bride.fullName}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#3E2723]/80">
                    {data.bride.parents}
                  </p>
                </div>
              </motion.article>

              {/* Mempelai Kakung - Beskap Blangkon */}
              <motion.article
                initial={fadeUpInitial}
                whileInView={fadeUpTarget}
                viewport={VIEWPORT_ONCE}
                transition={{ duration: 0.65, delay: 0.16, ease: KERATON_EASE }}
                className="rounded-2xl border border-[#92400E]/35 bg-[#FCF9F2] p-6 shadow-xs sm:p-8"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-[#92400E]/25 bg-[#F5EFE4]">
                  <img
                    src={data.groom.photoUrl}
                    alt={`Potret mempelai kakung ${data.groom.fullName}`}
                    loading="eager"
                    className="absolute inset-0 block h-full w-full object-cover"
                  />
                </div>
                <div className="mt-6 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#92400E]">
                    Mempelai Kakung / Beskap Blangkon
                  </p>
                  <h3 className="mt-2 font-serif-editorial text-3xl font-medium italic leading-[1.15] pb-1 text-[#3E2723] sm:text-4xl">
                    {data.groom.nickname}
                  </h3>
                  <p className="mt-1 text-base font-semibold text-[#3E2723]">
                    {data.groom.fullName}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#3E2723]/80">
                    {data.groom.parents}
                  </p>
                </div>
              </motion.article>
            </div>
          </div>
        </section>

        {/* 3. Tata Cara Adat & Jadwal + Dresscode Batik */}
        <section
          id="tata-cara"
          className="border-b border-[#92400E]/20 bg-[#FCF9F2] py-16 sm:py-24"
        >
          <div className="mx-auto max-w-5xl px-6 sm:px-10">
            <motion.div
              initial={fadeUpInitial}
              whileInView={fadeUpTarget}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.6, ease: KERATON_EASE }}
              className="mx-auto max-w-2xl text-center"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#92400E]">
                Rangkaian Adicara
              </p>
              <h2 className="mt-3 font-serif-editorial text-4xl font-medium italic leading-[1.15] pb-1 text-[#3E2723] sm:text-5xl">
                Tata Cara Adat &amp; Jadwal
              </h2>
              <KawungDivider className="mt-4" />
            </motion.div>

            {/* Ceremony Extras (Midodareni & Siraman, Upacara Panggih) */}
            {data.ceremonyExtras && data.ceremonyExtras.length > 0 && (
              <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
                {data.ceremonyExtras.map((extra, idx) => (
                  <motion.article
                    key={extra.label}
                    initial={fadeUpInitial}
                    whileInView={fadeUpTarget}
                    viewport={VIEWPORT_ONCE}
                    transition={{
                      duration: 0.55,
                      delay: idx * 0.08,
                      ease: KERATON_EASE,
                    }}
                    className="rounded-2xl border border-[#92400E]/30 bg-[#F5EFE4] p-6"
                  >
                    <p className="tabular-nums text-[11px] font-semibold uppercase tracking-[0.22em] text-[#92400E]">
                      Tahap {padTwo(idx + 1)} / Prosesi Adat
                    </p>
                    <h3 className="mt-2 font-serif-editorial text-2xl font-medium italic leading-[1.15] pb-1 text-[#3E2723]">
                      {extra.label}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#3E2723]/85">
                      {extra.detail}
                    </p>
                  </motion.article>
                ))}
              </div>
            )}

            {/* Main Schedule Cards: Ijab Qabul & Pahargyan */}
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
              {[
                {
                  key: "ijab-qabul",
                  step: padTwo((data.ceremonyExtras?.length ?? 0) + 1),
                  subtitle: "Prosesi Utama",
                  title: "Ijab Qabul",
                  event: data.akad,
                  calendarUrl: akadCalendarUrl,
                },
                {
                  key: "pahargyan",
                  step: padTwo((data.ceremonyExtras?.length ?? 0) + 2),
                  subtitle: "Resepsi Agung",
                  title: "Pahargyan",
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
                    ease: KERATON_EASE,
                  }}
                  className="flex flex-col justify-between rounded-2xl border border-[#92400E]/35 bg-[#F5EFE4]/75 p-6 sm:p-8"
                >
                  <div>
                    <p className="tabular-nums text-[11px] font-semibold uppercase tracking-[0.22em] text-[#92400E]">
                      Tahap {card.step} / {card.subtitle}
                    </p>
                    <h3 className="mt-2 font-serif-editorial text-3xl font-medium italic leading-[1.15] pb-1 text-[#3E2723]">
                      {card.title}
                    </h3>

                    <dl className="mt-6 space-y-3 border-t border-[#92400E]/20 pt-5 text-sm text-[#3E2723]">
                      <div className="flex items-start gap-3">
                        <CalendarPlus
                          size={18}
                          weight="regular"
                          className="mt-0.5 shrink-0 text-[#92400E]"
                        />
                        <div>
                          <dt className="sr-only">Tanggal</dt>
                          <dd className="font-semibold text-[#3E2723]">
                            {card.event.dateLabel}
                          </dd>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock
                          size={18}
                          weight="regular"
                          className="mt-0.5 shrink-0 text-[#92400E]"
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
                          className="mt-0.5 shrink-0 text-[#92400E]"
                        />
                        <div>
                          <dt className="sr-only">Lokasi</dt>
                          <dd className="font-semibold text-[#3E2723]">
                            {card.event.venueName}
                          </dd>
                          <dd className="mt-0.5 leading-relaxed text-[#3E2723]/80">
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
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#3E2723] px-4 py-2.5 text-xs font-semibold text-[#FCF9F2] transition-colors hover:bg-[#52342F]"
                    >
                      <MapPin size={15} weight="regular" />
                      <span>Buka Google Maps</span>
                      <ArrowSquareOut size={14} weight="regular" />
                    </a>
                    <a
                      href={card.calendarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#92400E]/40 bg-[#FCF9F2] px-4 py-2.5 text-xs font-semibold text-[#3E2723] transition-colors hover:bg-[#F5EFE4]"
                    >
                      <CalendarPlus size={15} weight="regular" />
                      <span>Google Calendar</span>
                    </a>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Batik Dresscode Swatches */}
            {data.dresscode && data.dresscode.colors.length > 0 && (
              <motion.div
                initial={fadeUpInitial}
                whileInView={fadeUpTarget}
                viewport={VIEWPORT_ONCE}
                transition={{ duration: 0.6, delay: 0.12, ease: KERATON_EASE }}
                className="mt-10 rounded-2xl border border-[#92400E]/30 bg-[#F5EFE4] p-6 sm:p-8"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-xl">
                    <div className="flex items-center gap-2 text-[#92400E]">
                      <Palette size={17} weight="regular" />
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em]">
                        Ageman Busana Tamu
                      </p>
                    </div>
                    <h3 className="mt-2 font-serif-editorial text-2xl font-medium italic leading-[1.15] pb-1 text-[#3E2723] sm:text-3xl">
                      Nuansa Sogan &amp; Batik Keraton
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#3E2723]/80">
                      {data.dresscode.note}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:shrink-0">
                    {data.dresscode.colors.map((color) => (
                      <div
                        key={color.label}
                        className="flex flex-col items-center rounded-xl border border-[#92400E]/25 bg-[#FCF9F2] p-3 text-center"
                      >
                        <span
                          aria-hidden="true"
                          style={{ backgroundColor: color.hex }}
                          className="h-11 w-full rounded-lg border border-[#3E2723]/15"
                        />
                        <span className="mt-2.5 text-xs font-semibold text-[#3E2723]">
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

        {/* 4. Jejak Asmara */}
        <section className="border-b border-[#92400E]/20 bg-[#F5EFE4] py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-6 sm:px-10">
            <motion.div
              initial={fadeUpInitial}
              whileInView={fadeUpTarget}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.6, ease: KERATON_EASE }}
              className="mx-auto max-w-2xl text-center"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#92400E]">
                Carita Tresna
              </p>
              <h2 className="mt-3 font-serif-editorial text-4xl font-medium italic leading-[1.15] pb-1 text-[#3E2723] sm:text-5xl">
                Jejak Asmara
              </h2>
              <KawungDivider className="mt-4" />
            </motion.div>

            <div className="mx-auto mt-12 max-w-2xl">
              <ol className="relative space-y-8 pl-7 sm:pl-9">
                <motion.span
                  aria-hidden="true"
                  initial={prefersReducedMotion ? false : { scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={VIEWPORT_ONCE}
                  transition={{ duration: 0.85, ease: KERATON_EASE }}
                  className="absolute left-0 top-2 bottom-2 w-px origin-top bg-[#92400E]/35"
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
                      delay: idx * 0.1,
                      ease: KERATON_EASE,
                    }}
                    className="relative"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute -left-[33px] top-2 h-2.5 w-2.5 rotate-45 border border-[#92400E] bg-[#FCF9F2] sm:-left-[41px]"
                    />
                    <div className="rounded-2xl border border-[#92400E]/25 bg-[#FCF9F2] p-6">
                      <p className="tabular-nums text-xs font-semibold uppercase tracking-[0.2em] text-[#92400E]">
                        {item.year}
                      </p>
                      <h3 className="mt-1.5 font-serif-editorial text-2xl font-medium italic leading-[1.15] pb-1 text-[#3E2723]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#3E2723]/85">
                        {item.description}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* 5. Galeri Foto Adat (CSS Grid + Lightbox with Camera Shutter SFX) */}
        <section className="border-b border-[#92400E]/20 bg-[#FCF9F2] py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-6 sm:px-10">
            <motion.div
              initial={fadeUpInitial}
              whileInView={fadeUpTarget}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.6, ease: KERATON_EASE }}
              className="mx-auto max-w-2xl text-center"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#92400E]">
                Dokumentasi Adat
              </p>
              <h2 className="mt-3 font-serif-editorial text-4xl font-medium italic leading-[1.15] pb-1 text-[#3E2723] sm:text-5xl">
                Galeri Foto Adat
              </h2>
              <KawungDivider className="mt-4" />
            </motion.div>

            <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.gallery.map((photoUrl, index) => (
                <motion.figure
                  key={`${photoUrl}-${index}`}
                  initial={fadeUpInitial}
                  whileInView={fadeUpTarget}
                  viewport={VIEWPORT_ONCE}
                  transition={{
                    duration: 0.55,
                    delay: (index % 3) * 0.08,
                    ease: KERATON_EASE,
                  }}
                  className="overflow-hidden rounded-2xl border border-[#92400E]/25 bg-[#F5EFE4] p-2.5"
                >
                  <button
                    type="button"
                    onClick={() => openLightbox(index)}
                    aria-label={`Lihat foto adat ${index + 1}`}
                    className="group block w-full cursor-pointer overflow-hidden rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#92400E]"
                  >
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl">
                      <img
                        src={photoUrl}
                        alt={`Potret adat Jawa ${data.groom.nickname} dan ${data.bride.nickname} foto ${index + 1}`}
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

        {/* 6. Tanda Tresna (1-click Copy Rekening & Alamat Kado) */}
        <section className="border-b border-[#92400E]/20 bg-[#F5EFE4] py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-6 sm:px-10">
            <motion.div
              initial={fadeUpInitial}
              whileInView={fadeUpTarget}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.6, ease: KERATON_EASE }}
              className="mx-auto max-w-2xl text-center"
            >
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-[#92400E]/40 bg-[#FCF9F2] text-[#92400E]">
                <Gift size={20} weight="regular" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.26em] text-[#92400E]">
                Tali Asih
              </p>
              <h2 className="mt-2 font-serif-editorial text-4xl font-medium italic leading-[1.15] pb-1 text-[#3E2723] sm:text-5xl">
                Tanda Tresna
              </h2>
              <KawungDivider className="mt-4" />
              <p className="mt-4 text-sm leading-relaxed text-[#3E2723]/80 sm:text-base">
                Doa pangestu panjenengan sampun dados kado paling endah tumrap kula. Bilih kepareng ngaturaken tanda tresna, saged lumantar rekening utawi alamat ing ngandhap punika.
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
                      ease: KERATON_EASE,
                    }}
                    className="flex flex-col justify-between rounded-2xl border border-[#92400E]/30 bg-[#FCF9F2] p-6"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#92400E]">
                        Bank {envelope.bankName}
                      </p>
                      <p className="tabular-nums mt-3 text-2xl font-semibold tracking-tight text-[#3E2723]">
                        {envelope.accountNumber}
                      </p>
                      <p className="mt-1 text-sm text-[#3E2723]/80">
                        a.n. {envelope.accountHolder}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyAccount(envelope.accountNumber)}
                      className={cn(
                        "mt-6 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition-colors",
                        isCopied
                          ? "border-[#3E2723] bg-[#3E2723] text-[#FCF9F2]"
                          : "border-[#92400E]/35 bg-[#F5EFE4] text-[#3E2723] hover:bg-[#3E2723] hover:text-[#FCF9F2]"
                      )}
                    >
                      {isCopied ? (
                        <>
                          <Check size={15} weight="bold" />
                          <span>Tersalin</span>
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
                transition={{ duration: 0.55, delay: 0.14, ease: KERATON_EASE }}
                className="mt-6 flex flex-col justify-between gap-5 rounded-2xl border border-[#92400E]/30 bg-[#FCF9F2] p-6 sm:flex-row sm:items-center sm:p-7"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[#92400E]">
                    <Package size={16} weight="regular" />
                    <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                      Kirim Kado Fisik
                    </p>
                  </div>
                  <p className="text-base font-semibold text-[#3E2723]">
                    {data.giftAddress.recipient}
                  </p>
                  <p className="text-sm leading-relaxed text-[#3E2723]/80">
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
                      ? "border-[#3E2723] bg-[#3E2723] text-[#FCF9F2]"
                      : "border-[#92400E]/35 bg-[#F5EFE4] text-[#3E2723] hover:bg-[#3E2723] hover:text-[#FCF9F2]"
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

        {/* 7. Pangestu Tamu & RSVP WhatsApp + Collapsible ?share=1 Guest Link Generator */}
        <section id="pangestu-rsvp" className="bg-[#FCF9F2] py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-6 sm:px-10">
            <motion.div
              initial={fadeUpInitial}
              whileInView={fadeUpTarget}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.6, ease: KERATON_EASE }}
              className="text-center"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#92400E]">
                Buku Tamu &amp; RSVP
              </p>
              <h2 className="mt-3 font-serif-editorial text-4xl font-medium italic leading-[1.15] pb-1 text-[#3E2723] sm:text-5xl">
                Pangestu Tamu &amp; Konfirmasi
              </h2>
              <KawungDivider className="mt-4" />
              <p className="mt-4 text-sm leading-relaxed text-[#3E2723]/80 sm:text-base">
                Rawuh saha donga pangestu panjenengan dados kabagyan tumrap kula lan kulawarga. Sumangga ngaturaken ucapan utawi konfirmasi lumantar WhatsApp.
              </p>
            </motion.div>

            <motion.form
              onSubmit={handleRsvpSubmit}
              initial={fadeUpInitial}
              whileInView={fadeUpTarget}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.6, delay: 0.08, ease: KERATON_EASE }}
              className="mt-10 rounded-2xl border border-[#92400E]/30 bg-[#F5EFE4]/80 p-6 sm:p-8"
            >
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="jawa-rsvp-name"
                    className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#3E2723]"
                  >
                    Asma Tamu
                  </label>
                  <input
                    id="jawa-rsvp-name"
                    type="text"
                    value={rsvpName}
                    onChange={(event) => {
                      setRsvpName(event.target.value);
                      if (rsvpError) setRsvpError("");
                      if (rsvpFeedback) setRsvpFeedback("");
                    }}
                    placeholder="Tuliskan nama lengkap Bapak/Ibu/Saudara/i"
                    className="mt-2 w-full rounded-xl border border-[#92400E]/30 bg-[#FCF9F2] px-4 py-3 text-sm text-[#3E2723] placeholder:text-[#3E2723]/45 focus:border-[#92400E] focus:outline-none"
                  />
                  {rsvpError && (
                    <p className="mt-1.5 text-xs font-medium text-red-800">
                      {rsvpError}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#3E2723]">
                      Status Rawuh
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
                                ? "border-[#3E2723] bg-[#3E2723] text-[#FCF9F2]"
                                : "border-[#92400E]/30 bg-[#FCF9F2] text-[#3E2723] hover:bg-[#F5EFE4]"
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
                      htmlFor="jawa-rsvp-count"
                      className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#3E2723]"
                    >
                      Jumlah Tamu
                    </label>
                    <div className="relative mt-2">
                      <Users
                        size={16}
                        weight="regular"
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#92400E]"
                      />
                      <select
                        id="jawa-rsvp-count"
                        value={rsvpCount}
                        disabled={rsvpStatus === "Berhalangan"}
                        onChange={(event) => setRsvpCount(event.target.value)}
                        className="w-full rounded-xl border border-[#92400E]/30 bg-[#FCF9F2] py-3 pl-10 pr-4 text-sm text-[#3E2723] focus:border-[#92400E] focus:outline-none disabled:cursor-not-allowed disabled:bg-stone-200/70 disabled:text-stone-400"
                      >
                        <option value="1">1 Tiyang (Orang)</option>
                        <option value="2">2 Tiyang (Orang)</option>
                        <option value="3">3 Tiyang (Orang)</option>
                        <option value="4">4 Tiyang (Orang)</option>
                        <option value="5">5 Tiyang (Orang)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="jawa-rsvp-wish"
                    className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#3E2723]"
                  >
                    Donga Pangestu &amp; Ucapan
                  </label>
                  <textarea
                    id="jawa-rsvp-wish"
                    rows={3}
                    value={rsvpWish}
                    onChange={(event) => {
                      setRsvpWish(event.target.value);
                      if (rsvpFeedback) setRsvpFeedback("");
                    }}
                    placeholder="Tuliskan doa restu atau ucapan hangat untuk kedua mempelai"
                    className="mt-2 w-full rounded-xl border border-[#92400E]/30 bg-[#FCF9F2] px-4 py-3 text-sm text-[#3E2723] placeholder:text-[#3E2723]/45 focus:border-[#92400E] focus:outline-none"
                  />
                </div>

                {rsvpFeedback && (
                  <p className="rounded-xl border border-[#92400E]/30 bg-[#FCF9F2] px-4 py-3 text-xs font-medium text-[#3E2723]">
                    {rsvpFeedback}
                  </p>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#3E2723] px-6 py-3.5 text-sm font-semibold text-[#FCF9F2] transition-colors hover:bg-[#52342F] active:scale-[0.99]"
                  >
                    <Heart size={18} weight="regular" />
                    <span>Kirim Pangestu</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSendWhatsapp}
                    className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#92400E]/40 bg-[#FCF9F2] px-6 py-3.5 text-sm font-semibold text-[#3E2723] transition-colors hover:bg-[#F5EFE4] active:scale-[0.99]"
                  >
                    <WhatsappLogo size={18} weight="regular" />
                    <span>Kirim RSVP WhatsApp</span>
                  </button>
                </div>
              </div>
            </motion.form>

            {/* Papan Pangestu Tamu */}
            {allPrayers.length > 0 && (
              <div className="mt-12">
                <div className="flex items-baseline justify-between border-b border-[#92400E]/20 pb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#92400E]">
                      Doa Restu
                    </p>
                    <h3 className="mt-1 font-serif-editorial text-2xl font-medium italic leading-[1.15] pb-1 text-[#3E2723] sm:text-3xl">
                      Papan Pangestu Tamu
                    </h3>
                  </div>
                  <p className="tabular-nums text-xs font-semibold uppercase tracking-[0.16em] text-[#3E2723]/75">
                    {allPrayers.length} Pangestu
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
                        ease: KERATON_EASE,
                      }}
                      className="rounded-2xl border border-[#92400E]/25 bg-[#F5EFE4]/75 p-5"
                    >
                      <p className="text-sm font-semibold text-[#3E2723]">
                        {prayer.name}
                      </p>
                      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#92400E]">
                        {prayer.relation}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-[#3E2723]/85">
                        &ldquo;{prayer.message}&rdquo;
                      </p>
                    </motion.article>
                  ))}
                </div>
              </div>
            )}

            {/* Collapsible ?share=1 Bulk Guest Link Generator */}
            <div className="mt-10 rounded-2xl border border-[#92400E]/30 bg-[#F5EFE4]/60">
              <button
                type="button"
                aria-expanded={isShareOpen}
                onClick={() => setIsShareOpen((prev) => !prev)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#92400E]/30 bg-[#FCF9F2] text-[#92400E]">
                    <ShareNetwork size={18} weight="regular" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#3E2723]">
                      Buat Link Serat Ulem Khusus Tamu
                    </p>
                    <p className="text-xs text-[#3E2723]/75">
                      Siapkan link personal dengan nama tamu otomatis untuk dibagikan ke WhatsApp.
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-[#3E2723]">
                  {isShareOpen ? (
                    <CaretUp size={18} weight="bold" />
                  ) : (
                    <CaretDown size={18} weight="bold" />
                  )}
                </span>
              </button>

              {isShareOpen && (
                <div className="border-t border-[#92400E]/20 px-6 py-6">
                  <label
                    htmlFor="jawa-guest-link-input"
                    className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#3E2723]"
                  >
                    Daftar Asma Tamu (1 Nama per Baris)
                  </label>
                  <textarea
                    id="jawa-guest-link-input"
                    rows={4}
                    value={guestListInput}
                    onChange={(event) => setGuestListInput(event.target.value)}
                    placeholder={
                      "Kanjeng Bapak Haryono\nIbu Endang Kusuma & Keluarga\nMas Pratama & Partner"
                    }
                    className="mt-2 w-full rounded-xl border border-[#92400E]/30 bg-[#FCF9F2] px-4 py-3 text-sm text-[#3E2723] placeholder:text-[#3E2723]/45 focus:border-[#92400E] focus:outline-none"
                  />

                  {generatedGuestLinks.length > 0 && (
                    <div className="mt-5 space-y-2.5">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#92400E]">
                        Link Siap Bagikan ({generatedGuestLinks.length})
                      </p>
                      <ul className="space-y-2.5">
                        {generatedGuestLinks.map((item, idx) => {
                          const isCopied = copiedGuestLink === item.url;
                          return (
                            <li
                              key={`${item.name}-${idx}`}
                              className="flex flex-col justify-between gap-3 rounded-xl border border-[#92400E]/20 bg-[#FCF9F2] p-3.5 sm:flex-row sm:items-center"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#3E2723]">
                                  {item.name}
                                </p>
                                <p className="truncate text-xs text-[#3E2723]/75">
                                  {item.url}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopyGuestLink(item.url)}
                                className={cn(
                                  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
                                  isCopied
                                    ? "border-[#3E2723] bg-[#3E2723] text-[#FCF9F2]"
                                    : "border-[#92400E]/35 bg-[#F5EFE4] text-[#3E2723] hover:bg-[#3E2723] hover:text-[#FCF9F2]"
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
      <footer className="border-t border-[#92400E]/25 bg-[#3E2723] px-6 py-11 text-center text-[#FCF9F2]">
        <div className="mx-auto flex max-w-xl flex-col items-center">
          <GununganKayonEmblem className="h-12 w-9" stroke="#E2C08D" />
          <div className="mt-3 inline-flex items-center gap-2 text-[#E2C08D]">
            <Heart size={15} weight="fill" />
            <span className="font-serif-editorial text-2xl font-medium italic leading-[1.15] pb-1 text-[#FCF9F2]">
              {coupleTitle}
            </span>
          </div>
          <p className="mt-3 text-xs text-[#F5EFE4]/75">
            Serat Ulem Digital dening{" "}
            <Link
              href="/"
              className="font-semibold text-[#E2C08D] underline decoration-[#E2C08D]/60 underline-offset-4 transition-colors hover:text-[#FCF9F2]"
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
            key="nikah-jawa-lightbox"
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
              "flex items-center justify-center bg-[#2C1A17]/85 p-4 backdrop-blur-xs"
            )}
          >
            <motion.div
              initial={
                prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }
              }
              animate={{ opacity: 1, scale: 1 }}
              exit={
                prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }
              }
              transition={{ duration: 0.2, ease: KERATON_EASE }}
              onClick={(event) => event.stopPropagation()}
              className="relative w-full max-w-2xl rounded-2xl border border-[#92400E]/40 bg-[#FCF9F2] p-4 shadow-2xl sm:p-6"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="tabular-nums text-xs font-semibold uppercase tracking-[0.16em] text-[#92400E]">
                  {lightboxIndex + 1} / {totalPhotos} - Galeri {coupleTitle}
                </span>
                <button
                  type="button"
                  onClick={closeLightbox}
                  aria-label="Tutup foto"
                  className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#92400E]/30 text-[#3E2723] transition-colors hover:bg-[#F5EFE4]"
                >
                  <X size={16} weight="bold" />
                </button>
              </div>

              <div className="max-h-[65dvh] overflow-hidden rounded-xl bg-[#F5EFE4]">
                <img
                  src={activeLightboxUrl}
                  alt={`Potret adat ${coupleTitle} ${lightboxIndex + 1}`}
                  className="max-h-[65dvh] w-full object-contain"
                />
              </div>

              <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <p className="font-serif-editorial text-xl font-medium italic leading-[1.15] pb-1 text-[#3E2723]">
                  Momen Pawiwahan {coupleTitle}
                </p>

                {totalPhotos > 1 && (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={goPrevPhoto}
                      aria-label="Foto sebelumnya"
                      className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-[#92400E]/35 bg-[#FCF9F2] px-4 py-2 text-xs font-semibold text-[#3E2723] transition-colors hover:bg-[#F5EFE4]"
                    >
                      <CaretLeft size={14} weight="bold" />
                      <span>Prev</span>
                    </button>
                    <button
                      type="button"
                      onClick={goNextPhoto}
                      aria-label="Foto berikutnya"
                      className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-[#3E2723] px-4 py-2 text-xs font-semibold text-[#FCF9F2] transition-colors hover:bg-[#52342F]"
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

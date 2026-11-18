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
  FlowerLotus,
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

interface MelatiPetalSpec {
  id: number;
  leftPct: number;
  size: number;
  duration: number;
  delay: number;
  swayX: number;
  rotateStart: number;
  rotateEnd: number;
  opacityPeak: number;
}

const SUNDA_EASE = [0.22, 1, 0.36, 1] as const;
const VIEWPORT_ONCE = { once: true, amount: "some" } as const;

const MELATI_PETALS: MelatiPetalSpec[] = [
  { id: 1, leftPct: 6, size: 15, duration: 13, delay: 0, swayX: 26, rotateStart: 10, rotateEnd: 195, opacityPeak: 0.78 },
  { id: 2, leftPct: 14, size: 12, duration: 16, delay: 2.4, swayX: -22, rotateStart: -25, rotateEnd: 160, opacityPeak: 0.65 },
  { id: 3, leftPct: 23, size: 16, duration: 14, delay: 4.8, swayX: 30, rotateStart: 35, rotateEnd: 230, opacityPeak: 0.75 },
  { id: 4, leftPct: 31, size: 11, duration: 17, delay: 1.2, swayX: -18, rotateStart: 0, rotateEnd: 175, opacityPeak: 0.6 },
  { id: 5, leftPct: 42, size: 14, duration: 15, delay: 6.1, swayX: 24, rotateStart: -15, rotateEnd: 210, opacityPeak: 0.72 },
  { id: 6, leftPct: 53, size: 17, duration: 13.5, delay: 3.3, swayX: -28, rotateStart: 20, rotateEnd: 205, opacityPeak: 0.8 },
  { id: 7, leftPct: 62, size: 12, duration: 18, delay: 0.8, swayX: 20, rotateStart: -40, rotateEnd: 150, opacityPeak: 0.62 },
  { id: 8, leftPct: 71, size: 15, duration: 14.5, delay: 5.2, swayX: -24, rotateStart: 15, rotateEnd: 220, opacityPeak: 0.76 },
  { id: 9, leftPct: 80, size: 13, duration: 16.5, delay: 2.1, swayX: 22, rotateStart: -10, rotateEnd: 185, opacityPeak: 0.68 },
  { id: 10, leftPct: 89, size: 16, duration: 14, delay: 4.1, swayX: -26, rotateStart: 30, rotateEnd: 215, opacityPeak: 0.74 },
  { id: 11, leftPct: 95, size: 11, duration: 17.5, delay: 7.0, swayX: -16, rotateStart: -20, rotateEnd: 170, opacityPeak: 0.6 },
  { id: 12, leftPct: 37, size: 13, duration: 15.5, delay: 8.2, swayX: 18, rotateStart: 25, rotateEnd: 200, opacityPeak: 0.7 },
];

function getInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "S";
}

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
  const datePart = isoMatch ? `${isoMatch[1]}${isoMatch[2]}${isoMatch[3]}` : "20270124";
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

function SigerArchCrest({
  className,
  strokeColor = "#A16207",
}: {
  className?: string;
  strokeColor?: string;
}) {
  return (
    <svg
      viewBox="0 0 180 48"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 38C36 38 48 22 68 18C78 16 85 9 90 4C95 9 102 16 112 18C132 22 144 38 168 38"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M34 40C54 40 66 28 82 24C86 23 88 20 90 17C92 20 94 23 98 24C114 28 126 40 146 40"
        stroke={strokeColor}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.65"
      />
      <ellipse cx="90" cy="27" rx="3.2" ry="5.5" fill={strokeColor} fillOpacity="0.85" />
      <ellipse cx="83" cy="31" rx="2.6" ry="4.5" transform="rotate(-28 83 31)" fill={strokeColor} fillOpacity="0.55" />
      <ellipse cx="97" cy="31" rx="2.6" ry="4.5" transform="rotate(28 97 31)" fill={strokeColor} fillOpacity="0.55" />
      <circle cx="52" cy="30" r="2" fill={strokeColor} fillOpacity="0.5" />
      <circle cx="128" cy="30" r="2" fill={strokeColor} fillOpacity="0.5" />
    </svg>
  );
}

function RonceMelatiOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-20 overflow-hidden"
    >
      {MELATI_PETALS.map((petal) => (
        <motion.div
          key={petal.id}
          initial={{
            y: "-10vh",
            x: 0,
            rotate: petal.rotateStart,
            opacity: 0,
          }}
          animate={{
            y: "110vh",
            x: [0, petal.swayX, -petal.swayX * 0.65, petal.swayX * 0.45, 0],
            rotate: petal.rotateEnd,
            opacity: [0, petal.opacityPeak, petal.opacityPeak, 0],
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ left: `${petal.leftPct}%`, width: petal.size, height: petal.size * 1.35 }}
          className="absolute top-0"
        >
          <svg
            viewBox="0 0 24 32"
            fill="none"
            className="h-full w-full drop-shadow-[0_2px_4px_rgba(20,83,45,0.14)]"
          >
            <path
              d="M12 2C16.8 6.5 21 12.4 20.5 19.2C20 25.4 16.2 29.8 12 30C7.8 29.8 4 25.4 3.5 19.2C3 12.4 7.2 6.5 12 2Z"
              fill="#FFFFFF"
              stroke="#A16207"
              strokeOpacity="0.28"
              strokeWidth="1"
            />
            <path
              d="M12 7C12 13 12 21 12 26"
              stroke="#14532D"
              strokeOpacity="0.16"
              strokeWidth="0.9"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

export function NikahSundaTemplate({
  site,
  embedded = false,
}: {
  site: NikahSiteConfig;
  embedded?: boolean;
}) {
  const { data } = site;
  const prefersReducedMotion = Boolean(useReducedMotion());

  const [isOpened, setIsOpened] = useState(embedded);
  const [guestName, setGuestName] = useState("Tamu Undangan");
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
    "Kang Ridwan Kamil\nKeluarga Bapa H. Asep Suryana\nTeh Maya & Pasangan"
  );
  const [copiedGuestLink, setCopiedGuestLink] = useState<string | null>(null);
  const guestCopyTimerRef = useRef<number | null>(null);

  const { scrollYProgress } = useScroll();
  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 32,
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
    data.gallery.forEach((photoUrl) => {
      const img = new window.Image();
      img.src = photoUrl;
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

  const handleOpenInvitation = () => {
    playSfx("paper-flip");
    setIsOpened(true);
  };

  const coupleTitle = `${data.groom.nickname} & ${data.bride.nickname}`;
  const coverImage = data.gallery[0] ?? "/demo/nikah-sunda-couple.webp";
  const heroBackdrop = "/demo/nikah-sunda-venue.webp";
  const baseSubdomainUrl = getSubdomainUrl(site.slug);
  const activeLightboxUrl =
    lightboxIndex !== null ? data.gallery[lightboxIndex] ?? null : null;

  const allPrayers = useMemo<PrayerEntry[]>(
    () => [...submittedPrayers, ...(data.initialPrayers ?? [])],
    [data.initialPrayers, submittedPrayers]
  );

  const ceremonySteps = useMemo(
    () =>
      data.ceremonyExtras && data.ceremonyExtras.length > 0
        ? data.ceremonyExtras
        : [
            {
              label: "Ngeuyeuk Seureuh",
              detail:
                "Sabtu sore pukul 15.30 WIB berupa prosesi nasihat pernikahan adat Sunda di pendopo taman.",
            },
            {
              label: "Sawer Panganten & Huap Lingkung",
              detail:
                "Berlangsung seusai akad nikah pukul 10.00 WIB diiringi kacapi suling dan tembang sawer.",
            },
          ],
    [data.ceremonyExtras]
  );

  const akadCalendarUrl = useMemo(
    () =>
      buildGoogleCalendarUrl({
        title: `Akad Nikah ${coupleTitle}`,
        weddingDateIso: data.weddingDateIso,
        timeLabel: data.akad.timeLabel,
        venueName: data.akad.venueName,
        address: data.akad.address,
        details: `Ondangan Walimatul Ursy Akad Nikah ${data.groom.fullName} & ${data.bride.fullName}.`,
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
        title: `Resepsi Walimatul Ursy ${coupleTitle}`,
        weddingDateIso: data.weddingDateIso,
        timeLabel: data.resepsi.timeLabel,
        venueName: data.resepsi.venueName,
        address: data.resepsi.address,
        details: `Ondangan Resepsi Adat Sunda ${data.groom.fullName} & ${data.bride.fullName}.`,
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
      `Sampurasun ${coupleTitle}, simkuring bade konfirmasi kahadiran:`,
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
        relation: rsvpStatus === "Hadir" ? "Konfirmasi Hadir" : "Berhalangan Hadir",
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
      setRsvpError("Punten, tuliskeun nami Bapak/Ibu/Saudara/i langkung tipayun.");
      return;
    }

    setRsvpError("");
    const addedPrayer = recordLocalPrayer(cleanedName, cleanedWish);
    if (addedPrayer) {
      setRsvpWish("");
      setRsvpFeedback(
        "Hatur nuhun, doa sareng konfirmasi parantos kacatet dina Buku Tamu."
      );
    } else {
      setRsvpFeedback(
        `Hatur nuhun, konfirmasi kahadiran atas nami ${cleanedName} (${rsvpStatus}) parantos kacatet.`
      );
    }
  };

  const handleSendWhatsapp = () => {
    const cleanedName = rsvpName.trim();
    const cleanedWish = rsvpWish.trim();
    if (!cleanedName) {
      setRsvpError("Punten, tuliskeun nami Bapak/Ibu/Saudara/i langkung tipayun.");
      return;
    }

    setRsvpError("");
    const addedPrayer = recordLocalPrayer(cleanedName, cleanedWish);
    if (addedPrayer) {
      setRsvpWish("");
      setRsvpFeedback(
        "Hatur nuhun, doa parantos kacatet sareng pesen WhatsApp siap dikirim."
      );
    }
    const whatsappUrl = buildRsvpWhatsappLink(cleanedName, cleanedWish);
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const gentleLiftInitial =
    prefersReducedMotion || embedded ? false : { opacity: 1, y: 14 };
  const gentleLiftTarget = { opacity: 1, y: 0 };

  return (
    <div
      className={cn(
        "font-jakarta bg-[#FAFAF7] text-[#18241C] antialiased selection:bg-[#14532D] selection:text-white",
        embedded && "relative min-h-[760px] overflow-hidden"
      )}
    >
      {/* Top Emerald Reading Progress Bar */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX: smoothScrollProgress }}
        className={cn(
          embedded ? "sticky top-0 z-30" : "fixed top-0 right-0 left-0 z-30",
          "h-1 origin-left bg-[#14532D]"
        )}
      />

      {/* Gentle Drifting Ronce Melati Petals Overlay */}
      {isOpened && !prefersReducedMotion && !embedded && <RonceMelatiOverlay />}

      {/* Personalized Sundanese Cover Curtain */}
      <AnimatePresence>
        {!embedded && !isOpened && (
          <motion.div
            key="sunda-cover"
            role="dialog"
            aria-modal="true"
            aria-label={`Sampul Ondangan ${coupleTitle}`}
            initial={{ opacity: 1, y: 0 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { y: "-100%", opacity: 0 }
            }
            transition={{
              duration: prefersReducedMotion ? 0.15 : 0.7,
              ease: SUNDA_EASE,
            }}
            className="fixed inset-0 z-40 flex flex-col justify-between overflow-y-auto bg-[#14532D] text-[#FAFAF7]"
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <img
                src={coverImage}
                alt={`Foto sampul pernikahan ${coupleTitle}`}
                className="h-full w-full object-cover opacity-28"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#14532D]/92 via-[#14532D]/82 to-[#0F3F22]" />
            </div>

            <div className="relative z-10 mx-auto flex min-h-full w-full max-w-2xl flex-col items-center justify-between px-6 py-12 text-center sm:py-16">
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 1, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: SUNDA_EASE }}
                className="flex flex-col items-center gap-3"
              >
                <SigerArchCrest className="h-9 w-36" strokeColor="#E5C98B" />
                <div className="flex h-12 w-12 items-center justify-center rounded-t-full rounded-b-xl border border-[#E5C98B]/50 bg-[#14532D]/80 font-serif-editorial text-base tracking-widest text-[#F5E7C4]">
                  {getInitial(data.groom.nickname)}&amp;{getInitial(data.bride.nickname)}
                </div>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#E5C98B]">
                  Sampurasun / Ondangan Walimatul Ursy
                </p>
              </motion.div>

              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 1, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.06, ease: SUNDA_EASE }}
                className="my-8 space-y-4"
              >
                <h1 className="font-serif-editorial text-5xl font-medium italic leading-[1.15] pb-1 text-[#FAFAF7] sm:text-6xl md:text-7xl">
                  {coupleTitle}
                </h1>
                <p className="font-serif-editorial text-lg italic tracking-wide text-[#F5E7C4] sm:text-xl">
                  Silih Asah, Silih Asih, Silih Asuh
                </p>
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#FAFAF7]/75">
                  {data.akad.dateLabel}
                </p>
              </motion.div>

              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 1, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.12, ease: SUNDA_EASE }}
                className="w-full max-w-md rounded-t-[40px] rounded-b-2xl border border-[#E5C98B]/30 bg-[#FAFAF7]/10 px-6 py-7 backdrop-blur-sm"
              >
                <p className="text-xs font-medium tracking-wide text-[#FAFAF7]/85">
                  Kahatur Bapak/Ibu/Saudara/i
                </p>
                <p className="mt-2 font-serif-editorial text-2xl font-medium italic leading-[1.15] pb-1 text-[#F8EDD1] sm:text-3xl">
                  {guestName}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-[#FAFAF7]/75">
                  Kalayan nyuhunkeun pidua miwah pangestu, simkuring ngahaturanan sumping dina acara Walimatul Ursy putra-putri kami.
                </p>
                <button
                  type="button"
                  onClick={handleOpenInvitation}
                  className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-[#FAFAF7] px-6 py-3.5 text-sm font-semibold text-[#14532D] shadow-sm transition-colors hover:bg-[#F2F6F3] active:scale-[0.99]"
                >
                  <EnvelopeOpen size={18} weight="regular" />
                  <span>Buka Ondangan</span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main>
        {/* 1. Hero Section with Soft Venue Backdrop, Cultural Greeting, Quote & Countdown */}
        <section className="relative overflow-hidden border-b border-[#14532D]/12 bg-[#FAFAF7]">
          <div className="pointer-events-none absolute inset-0">
            <img
              src={heroBackdrop}
              alt={`Latar venue adat Sunda ${data.akad.venueName}`}
              loading="eager"
              className="h-full w-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAF7]/92 via-[#FAFAF7]/82 to-[#FAFAF7]" />
          </div>

          <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 sm:px-10 lg:grid-cols-12 lg:py-24">
            <div className="lg:col-span-7">
              <motion.p
                initial={gentleLiftInitial}
                whileInView={gentleLiftTarget}
                viewport={VIEWPORT_ONCE}
                transition={{ duration: 0.5, ease: SUNDA_EASE }}
                className="text-xs font-semibold uppercase tracking-[0.26em] text-[#A16207]"
              >
                Walimatul Ursy Adat Sunda
              </motion.p>

              <motion.h2
                initial={gentleLiftInitial}
                whileInView={gentleLiftTarget}
                viewport={VIEWPORT_ONCE}
                transition={{ duration: 0.6, delay: 0.06, ease: SUNDA_EASE }}
                className="mt-3 font-serif-editorial text-5xl font-medium italic leading-[1.15] pb-1 text-[#14532D] sm:text-6xl lg:text-7xl"
              >
                {coupleTitle}
              </motion.h2>

              <motion.p
                initial={gentleLiftInitial}
                whileInView={gentleLiftTarget}
                viewport={VIEWPORT_ONCE}
                transition={{ duration: 0.55, delay: 0.1, ease: SUNDA_EASE }}
                className="mt-2.5 text-sm font-semibold tracking-wide text-[#18241C]/80 sm:text-base"
              >
                {data.akad.dateLabel} - {data.akad.venueName}
              </motion.p>

              {data.culturalNote && (
                <motion.p
                  initial={gentleLiftInitial}
                  whileInView={gentleLiftTarget}
                  viewport={VIEWPORT_ONCE}
                  transition={{ duration: 0.55, delay: 0.14, ease: SUNDA_EASE }}
                  className="mt-5 rounded-2xl border border-[#14532D]/12 bg-[#F2F6F3]/90 px-5 py-4 text-sm leading-relaxed text-[#18241C]"
                >
                  {data.culturalNote}
                </motion.p>
              )}

              <motion.blockquote
                initial={gentleLiftInitial}
                whileInView={gentleLiftTarget}
                viewport={VIEWPORT_ONCE}
                transition={{ duration: 0.6, delay: 0.18, ease: SUNDA_EASE }}
                className="mt-6 border-l-2 border-[#A16207] pl-5"
              >
                <p className="text-sm leading-relaxed text-[#18241C]/90 sm:text-base">
                  &ldquo;{data.blessingQuote.text}&rdquo;
                </p>
                <footer className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#A16207]">
                  {data.blessingQuote.source}
                </footer>
              </motion.blockquote>

              {/* Live Countdown */}
              <motion.div
                initial={gentleLiftInitial}
                whileInView={gentleLiftTarget}
                viewport={VIEWPORT_ONCE}
                transition={{ duration: 0.6, delay: 0.22, ease: SUNDA_EASE }}
                className="mt-8"
              >
                {countdown?.isPast ? (
                  <div className="rounded-2xl border border-[#14532D]/15 bg-[#F2F6F3] px-5 py-4">
                    <p className="font-serif-editorial text-2xl font-medium italic leading-[1.15] pb-1 text-[#14532D]">
                      Dinten Bagja Parantos Sumping
                    </p>
                    <p className="mt-1 text-xs text-[#18241C]/75">
                      Hatur nuhun kana kahadiran sareng pidua restu ti sadaya tamu.
                    </p>
                  </div>
                ) : (
                  <div className="grid max-w-lg grid-cols-4 gap-2.5 sm:gap-3.5">
                    {[
                      { label: "Hari", value: countdown ? padTwo(countdown.days) : "--" },
                      { label: "Jam", value: countdown ? padTwo(countdown.hours) : "--" },
                      { label: "Menit", value: countdown ? padTwo(countdown.minutes) : "--" },
                      { label: "Detik", value: countdown ? padTwo(countdown.seconds) : "--" },
                    ].map((tile) => (
                      <div
                        key={tile.label}
                        className="rounded-2xl border border-[#14532D]/15 bg-white/90 px-2.5 py-3.5 text-center shadow-xs"
                      >
                        <p className="tabular-nums font-serif-editorial text-2xl font-semibold text-[#14532D] sm:text-3xl">
                          {tile.value}
                        </p>
                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A16207]">
                          {tile.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={gentleLiftInitial}
                whileInView={gentleLiftTarget}
                viewport={VIEWPORT_ONCE}
                transition={{ duration: 0.55, delay: 0.26, ease: SUNDA_EASE }}
                className="mt-7 flex flex-wrap items-center gap-3"
              >
                <a
                  href="#jadwal-acara"
                  className="inline-flex items-center gap-2 rounded-full bg-[#14532D] px-5 py-2.5 text-xs font-semibold tracking-wide text-white transition-colors hover:bg-[#166534]"
                >
                  <CalendarPlus size={16} weight="regular" />
                  <span>Runtuyan Acara</span>
                </a>
                <a
                  href="#rsvp-ucapan"
                  className="inline-flex items-center gap-2 rounded-full border border-[#14532D]/25 bg-white px-5 py-2.5 text-xs font-semibold tracking-wide text-[#14532D] transition-colors hover:bg-[#F2F6F3]"
                >
                  <WhatsappLogo size={16} weight="regular" />
                  <span>Konfirmasi RSVP</span>
                </a>
              </motion.div>
            </div>

            <div className="lg:col-span-5">
              <div className="mx-auto max-w-md">
                <div className="mb-2 flex justify-center">
                  <SigerArchCrest className="h-8 w-36" strokeColor="#A16207" />
                </div>
                <div className="rounded-t-[190px] rounded-b-2xl border border-[#A16207]/35 bg-[#F2F6F3] p-3 shadow-sm">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-t-[178px] rounded-b-xl border border-[#14532D]/10">
                    <motion.img
                      src={coverImage}
                      alt={`Potret pengantin adat Sunda ${data.groom.fullName} dan ${data.bride.fullName}`}
                      loading="eager"
                      initial={
                        prefersReducedMotion || embedded
                          ? false
                          : { scale: 1.03, opacity: 1 }
                      }
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={VIEWPORT_ONCE}
                      transition={{ duration: 0.85, ease: SUNDA_EASE }}
                      className="absolute inset-0 block h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Asymmetrical Staggered Portrait Layout: Mojang Siger Sunda & Jajaka */}
        <section className="border-b border-[#14532D]/12 bg-[#F2F6F3] py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-6 sm:px-10">
            <motion.div
              initial={gentleLiftInitial}
              whileInView={gentleLiftTarget}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.55, ease: SUNDA_EASE }}
              className="mx-auto max-w-2xl text-center"
            >
              <SigerArchCrest className="mx-auto mb-3 h-8 w-36" strokeColor="#A16207" />
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#A16207]">
                Panganten Bagja
              </p>
              <h2 className="mt-2 font-serif-editorial text-4xl font-medium italic leading-[1.15] pb-1 text-[#14532D] sm:text-5xl">
                Mojang &amp; Jajaka Sunda
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#18241C]/80 sm:text-base">
                Kalayan nyuhunkeun rahmat sareng ridho Gusti Allah SWT, simkuring ngahaturanan Bapak/Ibu/Saudara/i dina acara Walimatul Ursy putra-putri kami.
              </p>
            </motion.div>

            <div className="mt-12 grid grid-cols-1 items-start gap-10 md:grid-cols-2 md:gap-14">
              {/* Mojang Siger Sunda (Bride) */}
              <motion.article
                initial={gentleLiftInitial}
                whileInView={gentleLiftTarget}
                viewport={VIEWPORT_ONCE}
                transition={{ duration: 0.6, delay: 0.06, ease: SUNDA_EASE }}
                className="rounded-t-[180px] rounded-b-2xl border border-[#14532D]/12 bg-[#FAFAF7] p-6 sm:p-8"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-t-[155px] rounded-b-xl border border-[#A16207]/30 bg-[#F2F6F3]">
                  <img
                    src={data.bride.photoUrl}
                    alt={`Potret Mojang Siger Sunda ${data.bride.fullName}`}
                    loading="eager"
                    className="absolute inset-0 block h-full w-full object-cover"
                  />
                </div>
                <div className="mt-6 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#A16207]">
                    Mojang Siger Sunda
                  </p>
                  <h3 className="mt-2 font-serif-editorial text-3xl font-medium italic leading-[1.15] pb-1 text-[#14532D] sm:text-4xl">
                    {data.bride.nickname}
                  </h3>
                  <p className="mt-1 text-base font-semibold text-[#18241C]">
                    {data.bride.fullName}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#18241C]/75">
                    {data.bride.parents}
                  </p>
                </div>
              </motion.article>

              {/* Jajaka (Groom) - Staggered Asymmetrical Offset */}
              <motion.article
                initial={gentleLiftInitial}
                whileInView={gentleLiftTarget}
                viewport={VIEWPORT_ONCE}
                transition={{ duration: 0.6, delay: 0.14, ease: SUNDA_EASE }}
                className="rounded-t-[180px] rounded-b-2xl border border-[#14532D]/12 bg-[#FAFAF7] p-6 sm:p-8 md:mt-16"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-t-[155px] rounded-b-xl border border-[#A16207]/30 bg-[#F2F6F3]">
                  <img
                    src={data.groom.photoUrl}
                    alt={`Potret Jajaka Sunda ${data.groom.fullName}`}
                    loading="eager"
                    className="absolute inset-0 block h-full w-full object-cover"
                  />
                </div>
                <div className="mt-6 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#A16207]">
                    Jajaka Sunda
                  </p>
                  <h3 className="mt-2 font-serif-editorial text-3xl font-medium italic leading-[1.15] pb-1 text-[#14532D] sm:text-4xl">
                    {data.groom.nickname}
                  </h3>
                  <p className="mt-1 text-base font-semibold text-[#18241C]">
                    {data.groom.fullName}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#18241C]/75">
                    {data.groom.parents}
                  </p>
                </div>
              </motion.article>
            </div>
          </div>
        </section>

        {/* 3. Runtuyan Adat & Waktos (ceremonyExtras + Akad & Resepsi + Dresscode) */}
        <section
          id="jadwal-acara"
          className="border-b border-[#14532D]/12 bg-[#FAFAF7] py-16 sm:py-24"
        >
          <div className="mx-auto max-w-5xl px-6 sm:px-10">
            <motion.div
              initial={gentleLiftInitial}
              whileInView={gentleLiftTarget}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.55, ease: SUNDA_EASE }}
              className="mx-auto max-w-2xl text-center"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#A16207]">
                Runtuyan Adat &amp; Waktos
              </p>
              <h2 className="mt-3 font-serif-editorial text-4xl font-medium italic leading-[1.15] pb-1 text-[#14532D] sm:text-5xl">
                Prosesi Adat &amp; Jadwal Acara
              </h2>
            </motion.div>

            {/* Stepped Adat Procession Cards */}
            <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
              {ceremonySteps.map((step, idx) => (
                <motion.article
                  key={`${step.label}-${idx}`}
                  initial={gentleLiftInitial}
                  whileInView={gentleLiftTarget}
                  viewport={VIEWPORT_ONCE}
                  transition={{
                    duration: 0.55,
                    delay: idx * 0.08,
                    ease: SUNDA_EASE,
                  }}
                  className="relative flex items-start gap-4 rounded-2xl border border-[#A16207]/25 bg-[#F2F6F3] p-6"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-t-full rounded-b-lg border border-[#A16207]/40 bg-[#FAFAF7] tabular-nums font-serif-editorial text-lg font-semibold text-[#A16207]">
                    {padTwo(idx + 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-[#14532D]">
                      <FlowerLotus size={16} weight="regular" className="text-[#A16207]" />
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A16207]">
                        Runtuyan Adat
                      </p>
                    </div>
                    <h3 className="mt-1.5 font-serif-editorial text-2xl font-medium italic leading-[1.15] pb-1 text-[#14532D]">
                      {step.label}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#18241C]/85">
                      {step.detail}
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Akad Nikah & Resepsi Cards */}
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
              {[
                {
                  key: "akad",
                  stepNumber: "03",
                  eyebrow: "Ijab Qabul",
                  title: "Akad Nikah",
                  event: data.akad,
                  calendarUrl: akadCalendarUrl,
                },
                {
                  key: "resepsi",
                  stepNumber: "04",
                  eyebrow: "Walimatul Ursy",
                  title: "Resepsi Pernikahan",
                  event: data.resepsi,
                  calendarUrl: resepsiCalendarUrl,
                },
              ].map((card, idx) => (
                <motion.article
                  key={card.key}
                  initial={gentleLiftInitial}
                  whileInView={gentleLiftTarget}
                  viewport={VIEWPORT_ONCE}
                  transition={{
                    duration: 0.6,
                    delay: idx * 0.1,
                    ease: SUNDA_EASE,
                  }}
                  className="flex flex-col justify-between rounded-2xl border border-[#14532D]/15 bg-white p-6 shadow-xs sm:p-8"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#A16207]">
                        {card.eyebrow}
                      </p>
                      <span className="tabular-nums font-serif-editorial text-lg font-semibold text-[#14532D]/60">
                        {card.stepNumber}
                      </span>
                    </div>
                    <h3 className="mt-2 font-serif-editorial text-3xl font-medium italic leading-[1.15] pb-1 text-[#14532D]">
                      {card.title}
                    </h3>

                    <dl className="mt-6 space-y-3 border-t border-[#14532D]/10 pt-5 text-sm text-[#18241C]">
                      <div className="flex items-start gap-3">
                        <CalendarPlus
                          size={18}
                          weight="regular"
                          className="mt-0.5 shrink-0 text-[#A16207]"
                        />
                        <div>
                          <dt className="sr-only">Tanggal</dt>
                          <dd className="font-semibold text-[#14532D]">
                            {card.event.dateLabel}
                          </dd>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock
                          size={18}
                          weight="regular"
                          className="mt-0.5 shrink-0 text-[#A16207]"
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
                          className="mt-0.5 shrink-0 text-[#A16207]"
                        />
                        <div>
                          <dt className="sr-only">Lokasi</dt>
                          <dd className="font-semibold text-[#14532D]">
                            {card.event.venueName}
                          </dd>
                          <dd className="mt-0.5 leading-relaxed text-[#18241C]/80">
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
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#14532D] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#166534]"
                    >
                      <MapPin size={15} weight="regular" />
                      <span>Buka Google Maps</span>
                      <ArrowSquareOut size={14} weight="regular" />
                    </a>
                    <a
                      href={card.calendarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#14532D]/25 bg-[#FAFAF7] px-4 py-2.5 text-xs font-semibold text-[#14532D] transition-colors hover:bg-[#F2F6F3]"
                    >
                      <CalendarPlus size={15} weight="regular" />
                      <span>Simpan ke Google Calendar</span>
                    </a>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Dresscode Swatches */}
            {data.dresscode && data.dresscode.colors.length > 0 && (
              <motion.div
                initial={gentleLiftInitial}
                whileInView={gentleLiftTarget}
                viewport={VIEWPORT_ONCE}
                transition={{ duration: 0.55, delay: 0.1, ease: SUNDA_EASE }}
                className="mt-10 rounded-2xl border border-[#14532D]/15 bg-[#F2F6F3] p-6 sm:p-8"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-xl">
                    <div className="flex items-center gap-2 text-[#A16207]">
                      <Palette size={17} weight="regular" />
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em]">
                        Panduan Warna Busana
                      </p>
                    </div>
                    <h3 className="mt-2 font-serif-editorial text-2xl font-medium italic leading-[1.15] pb-1 text-[#14532D] sm:text-3xl">
                      Nuansa Melati &amp; Daun Priangan
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#18241C]/80">
                      {data.dresscode.note}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:shrink-0">
                    {data.dresscode.colors.map((color) => (
                      <div
                        key={color.label}
                        className="flex flex-col items-center rounded-xl border border-[#14532D]/15 bg-[#FAFAF7] p-3 text-center"
                      >
                        <span
                          aria-hidden="true"
                          style={{ backgroundColor: color.hex }}
                          className="h-11 w-full rounded-lg border border-[#14532D]/15"
                        />
                        <span className="mt-2.5 text-xs font-semibold text-[#14532D]">
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

        {/* 4. Lalakon Cinta (storyTimeline) */}
        <section className="border-b border-[#14532D]/12 bg-[#F2F6F3] py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-6 sm:px-10">
            <motion.div
              initial={gentleLiftInitial}
              whileInView={gentleLiftTarget}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.55, ease: SUNDA_EASE }}
              className="mx-auto max-w-2xl text-center"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#A16207]">
                Jejak Langkah Kami
              </p>
              <h2 className="mt-3 font-serif-editorial text-4xl font-medium italic leading-[1.15] pb-1 text-[#14532D] sm:text-5xl">
                Lalakon Cinta
              </h2>
            </motion.div>

            <div className="mx-auto mt-12 max-w-2xl">
              <ol className="relative space-y-8 pl-7 sm:pl-9">
                <motion.span
                  aria-hidden="true"
                  initial={prefersReducedMotion ? false : { scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={VIEWPORT_ONCE}
                  transition={{ duration: 0.85, ease: SUNDA_EASE }}
                  className="absolute left-0 top-2 bottom-2 w-px origin-top bg-[#14532D]/25"
                />
                {data.storyTimeline.map((item, idx) => (
                  <motion.li
                    key={`${item.year}-${item.title}`}
                    initial={
                      prefersReducedMotion || embedded
                        ? false
                        : { opacity: 1, x: -10 }
                    }
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={VIEWPORT_ONCE}
                    transition={{
                      duration: 0.5,
                      delay: idx * 0.08,
                      ease: SUNDA_EASE,
                    }}
                    className="relative"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute -left-[33px] top-1.5 h-2.5 w-2.5 rounded-full border border-[#A16207] bg-[#FAFAF7] sm:-left-[41px]"
                    />
                    <div className="rounded-2xl border border-[#14532D]/12 bg-[#FAFAF7] p-6">
                      <p className="tabular-nums text-xs font-semibold uppercase tracking-[0.2em] text-[#A16207]">
                        {item.year}
                      </p>
                      <h3 className="mt-1.5 font-serif-editorial text-2xl font-medium italic leading-[1.15] pb-1 text-[#14532D]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#18241C]/85">
                        {item.description}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* 5. Galeri Foto Adat Sunda (grid-cols-2 md:grid-cols-3 + Lightbox) */}
        <section className="border-b border-[#14532D]/12 bg-[#FAFAF7] py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-6 sm:px-10">
            <motion.div
              initial={gentleLiftInitial}
              whileInView={gentleLiftTarget}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.55, ease: SUNDA_EASE }}
              className="mx-auto max-w-2xl text-center"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#A16207]">
                Potret Panganten
              </p>
              <h2 className="mt-3 font-serif-editorial text-4xl font-medium italic leading-[1.15] pb-1 text-[#14532D] sm:text-5xl">
                Galeri Foto Adat Sunda
              </h2>
            </motion.div>

            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
              {data.gallery.map((photoUrl, index) => (
                <motion.figure
                  key={`${photoUrl}-${index}`}
                  initial={gentleLiftInitial}
                  whileInView={gentleLiftTarget}
                  viewport={VIEWPORT_ONCE}
                  transition={{
                    duration: 0.5,
                    delay: (index % 3) * 0.07,
                    ease: SUNDA_EASE,
                  }}
                  className="overflow-hidden rounded-t-[70px] rounded-b-2xl border border-[#14532D]/12 bg-[#F2F6F3] p-2 sm:rounded-t-[100px]"
                >
                  <button
                    type="button"
                    onClick={() => openLightbox(index)}
                    aria-label={`Lihat foto prewedding ${index + 1}`}
                    className="group block w-full cursor-pointer overflow-hidden rounded-t-[62px] rounded-b-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14532D] sm:rounded-t-[90px]"
                  >
                    <div className="relative aspect-[4/5] w-full overflow-hidden">
                      <img
                        src={photoUrl}
                        alt={`Momen adat Sunda ${data.groom.nickname} dan ${data.bride.nickname} foto ${index + 1}`}
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

        {/* 6. Tanda Kasih (1-click Copy Rekening & Alamat Kado) */}
        <section className="border-b border-[#14532D]/12 bg-[#F2F6F3] py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-6 sm:px-10">
            <motion.div
              initial={gentleLiftInitial}
              whileInView={gentleLiftTarget}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.55, ease: SUNDA_EASE }}
              className="mx-auto max-w-2xl text-center"
            >
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-[#A16207]/40 bg-[#FAFAF7] text-[#A16207]">
                <Gift size={20} weight="regular" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.26em] text-[#A16207]">
                Tanda Kasih
              </p>
              <h2 className="mt-2 font-serif-editorial text-4xl font-medium italic leading-[1.15] pb-1 text-[#14532D] sm:text-5xl">
                Amplop Digital &amp; Kado
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#18241C]/80 sm:text-base">
                Doa restu Bapak/Ibu/Saudara/i mangrupikeun karunia pangendahna pikeun kami. Nanging upami bade ngintunkeun tanda kasih, tiasa ngalangkungan rekening atanapi alamat di handap ieu.
              </p>
            </motion.div>

            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
              {data.digitalEnvelopes.map((envelope, idx) => {
                const isCopied = copiedAccount === envelope.accountNumber;
                return (
                  <motion.div
                    key={`${envelope.bankName}-${envelope.accountNumber}`}
                    initial={gentleLiftInitial}
                    whileInView={gentleLiftTarget}
                    viewport={VIEWPORT_ONCE}
                    transition={{
                      duration: 0.5,
                      delay: idx * 0.08,
                      ease: SUNDA_EASE,
                    }}
                    className="flex flex-col justify-between rounded-2xl border border-[#14532D]/15 bg-[#FAFAF7] p-6"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A16207]">
                        Bank {envelope.bankName}
                      </p>
                      <p className="tabular-nums mt-3 text-2xl font-semibold tracking-tight text-[#14532D]">
                        {envelope.accountNumber}
                      </p>
                      <p className="mt-1 text-sm text-[#18241C]/80">
                        a.n. {envelope.accountHolder}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyAccount(envelope.accountNumber)}
                      className={cn(
                        "mt-6 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition-colors",
                        isCopied
                          ? "border-[#14532D] bg-[#14532D] text-white"
                          : "border-[#14532D]/25 bg-[#F2F6F3] text-[#14532D] hover:bg-[#14532D] hover:text-white"
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
                initial={gentleLiftInitial}
                whileInView={gentleLiftTarget}
                viewport={VIEWPORT_ONCE}
                transition={{ duration: 0.5, delay: 0.14, ease: SUNDA_EASE }}
                className="mt-6 flex flex-col justify-between gap-5 rounded-2xl border border-[#14532D]/15 bg-[#FAFAF7] p-6 sm:flex-row sm:items-center sm:p-7"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[#A16207]">
                    <Package size={16} weight="regular" />
                    <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                      Alamat Kado Fisik
                    </p>
                  </div>
                  <p className="text-base font-semibold text-[#14532D]">
                    {data.giftAddress.recipient}
                  </p>
                  <p className="text-sm leading-relaxed text-[#18241C]/80">
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
                      ? "border-[#14532D] bg-[#14532D] text-white"
                      : "border-[#14532D]/25 bg-[#F2F6F3] text-[#14532D] hover:bg-[#14532D] hover:text-white"
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

        {/* 7. Buku Tamu, Konfirmasi RSVP WhatsApp & Collapsible Generator Link Tamu */}
        <section id="rsvp-ucapan" className="bg-[#FAFAF7] py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-6 sm:px-10">
            <motion.div
              initial={gentleLiftInitial}
              whileInView={gentleLiftTarget}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.55, ease: SUNDA_EASE }}
              className="text-center"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#A16207]">
                Buku Tamu &amp; RSVP
              </p>
              <h2 className="mt-3 font-serif-editorial text-4xl font-medium italic leading-[1.15] pb-1 text-[#14532D] sm:text-5xl">
                Kintun Pidua &amp; Konfirmasi Kahadiran
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#18241C]/80 sm:text-base">
                Kahadiran sareng pidua restu Bapak/Ibu/Saudara/i janten kabagjaan pikeun kami sakulawargi. Mangga tuliskeun ucapan dina buku tamu atanapi konfirmasi langsung ngalangkungan WhatsApp.
              </p>
            </motion.div>

            <motion.form
              onSubmit={handleRsvpSubmit}
              initial={gentleLiftInitial}
              whileInView={gentleLiftTarget}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.55, delay: 0.08, ease: SUNDA_EASE }}
              className="mt-10 rounded-2xl border border-[#14532D]/15 bg-[#F2F6F3]/80 p-6 sm:p-8"
            >
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="sunda-rsvp-guest-name"
                    className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#14532D]"
                  >
                    Nama Tamu
                  </label>
                  <input
                    id="sunda-rsvp-guest-name"
                    type="text"
                    value={rsvpName}
                    onChange={(event) => {
                      setRsvpName(event.target.value);
                      if (rsvpError) setRsvpError("");
                      if (rsvpFeedback) setRsvpFeedback("");
                    }}
                    placeholder="Tuliskeun nami lengkep Bapak/Ibu/Saudara/i"
                    className="mt-2 w-full rounded-xl border border-[#14532D]/25 bg-white px-4 py-3 text-sm text-[#18241C] placeholder:text-[#18241C]/45 focus:border-[#14532D] focus:outline-none"
                  />
                  {rsvpError && (
                    <p className="mt-1.5 text-xs font-medium text-red-700">
                      {rsvpError}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#14532D]">
                      Status Kahadiran
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
                                ? "border-[#14532D] bg-[#14532D] text-white"
                                : "border-[#14532D]/25 bg-white text-[#14532D] hover:bg-[#F2F6F3]"
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
                      htmlFor="sunda-rsvp-guest-count"
                      className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#14532D]"
                    >
                      Jumlah Tamu
                    </label>
                    <div className="relative mt-2">
                      <Users
                        size={16}
                        weight="regular"
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#14532D]/60"
                      />
                      <select
                        id="sunda-rsvp-guest-count"
                        value={rsvpCount}
                        disabled={rsvpStatus === "Berhalangan"}
                        onChange={(event) => setRsvpCount(event.target.value)}
                        className="w-full rounded-xl border border-[#14532D]/25 bg-white py-3 pl-10 pr-4 text-sm text-[#18241C] focus:border-[#14532D] focus:outline-none disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
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
                    htmlFor="sunda-rsvp-wish"
                    className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#14532D]"
                  >
                    Ucapan &amp; Pidua
                  </label>
                  <textarea
                    id="sunda-rsvp-wish"
                    rows={3}
                    value={rsvpWish}
                    onChange={(event) => {
                      setRsvpWish(event.target.value);
                      if (rsvpFeedback) setRsvpFeedback("");
                    }}
                    placeholder="Tuliskeun pidua restu atanapi ucapan wilujeng kanggo panganten"
                    className="mt-2 w-full rounded-xl border border-[#14532D]/25 bg-white px-4 py-3 text-sm text-[#18241C] placeholder:text-[#18241C]/45 focus:border-[#14532D] focus:outline-none"
                  />
                </div>

                {rsvpFeedback && (
                  <p className="rounded-xl border border-[#14532D]/15 bg-white px-4 py-3 text-xs font-medium text-[#14532D]">
                    {rsvpFeedback}
                  </p>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#14532D] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#166534] active:scale-[0.99]"
                  >
                    <Heart size={18} weight="regular" />
                    <span>Kirim Ucapan</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSendWhatsapp}
                    className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#14532D]/25 bg-white px-6 py-3.5 text-sm font-semibold text-[#14532D] transition-colors hover:bg-[#F2F6F3] active:scale-[0.99]"
                  >
                    <WhatsappLogo size={18} weight="regular" />
                    <span>Kirim RSVP ke WhatsApp</span>
                  </button>
                </div>
              </div>
            </motion.form>

            {/* Buku Tamu / Papan Pidua */}
            {allPrayers.length > 0 && (
              <div className="mt-12">
                <div className="flex items-baseline justify-between border-b border-[#14532D]/12 pb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A16207]">
                      Pidua Restu
                    </p>
                    <h3 className="mt-1 font-serif-editorial text-2xl font-medium italic leading-[1.15] pb-1 text-[#14532D] sm:text-3xl">
                      Papan Pidua &amp; Ucapan Tamu
                    </h3>
                  </div>
                  <p className="tabular-nums text-xs font-semibold uppercase tracking-[0.16em] text-[#14532D]/70">
                    {allPrayers.length} Ucapan
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {allPrayers.map((prayer, idx) => (
                    <motion.article
                      key={`${prayer.name}-${idx}`}
                      initial={gentleLiftInitial}
                      whileInView={gentleLiftTarget}
                      viewport={VIEWPORT_ONCE}
                      transition={{
                        duration: 0.45,
                        delay: Math.min(idx, 5) * 0.06,
                        ease: SUNDA_EASE,
                      }}
                      className="rounded-2xl border border-[#14532D]/12 bg-[#F2F6F3]/60 p-5"
                    >
                      <p className="text-sm font-semibold text-[#14532D]">
                        {prayer.name}
                      </p>
                      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A16207]">
                        {prayer.relation}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-[#18241C]/85">
                        &ldquo;{prayer.message}&rdquo;
                      </p>
                    </motion.article>
                  ))}
                </div>
              </div>
            )}

            {/* Collapsible Generator Link Tamu (?share=1) */}
            <div className="mt-10 rounded-2xl border border-[#14532D]/15 bg-white">
              <button
                type="button"
                aria-expanded={isShareOpen}
                onClick={() => setIsShareOpen((prev) => !prev)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F2F6F3] text-[#14532D]">
                    <ShareNetwork size={18} weight="regular" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#14532D]">
                      Buat Link Ondangan Khusus Tamu
                    </p>
                    <p className="text-xs text-[#18241C]/70">
                      Siapkeun link personal kalayan nami tamu otomatis kanggo disebarkeun kana WhatsApp.
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-[#14532D]">
                  {isShareOpen ? (
                    <CaretUp size={18} weight="bold" />
                  ) : (
                    <CaretDown size={18} weight="bold" />
                  )}
                </span>
              </button>

              {isShareOpen && (
                <div className="border-t border-[#14532D]/10 px-6 py-6">
                  <label
                    htmlFor="sunda-guest-link-generator-input"
                    className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#14532D]"
                  >
                    Daftar Nami Tamu (1 Nami per Baris)
                  </label>
                  <textarea
                    id="sunda-guest-link-generator-input"
                    rows={4}
                    value={guestListInput}
                    onChange={(event) => setGuestListInput(event.target.value)}
                    placeholder={"Kang Ridwan Kamil\nKeluarga Bapa H. Asep Suryana\nTeh Maya & Pasangan"}
                    className="mt-2 w-full rounded-xl border border-[#14532D]/25 bg-[#FAFAF7] px-4 py-3 text-sm text-[#18241C] placeholder:text-[#18241C]/45 focus:border-[#14532D] focus:outline-none"
                  />

                  {generatedGuestLinks.length > 0 && (
                    <div className="mt-5 space-y-2.5">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A16207]">
                        Link Siap Bagikan ({generatedGuestLinks.length})
                      </p>
                      <ul className="space-y-2.5">
                        {generatedGuestLinks.map((item, idx) => {
                          const isCopied = copiedGuestLink === item.url;
                          return (
                            <li
                              key={`${item.name}-${idx}`}
                              className="flex flex-col justify-between gap-3 rounded-xl border border-[#14532D]/10 bg-[#F2F6F3] p-3.5 sm:flex-row sm:items-center"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#14532D]">
                                  {item.name}
                                </p>
                                <p className="truncate text-xs text-[#18241C]/75">
                                  {item.url}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopyGuestLink(item.url)}
                                className={cn(
                                  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
                                  isCopied
                                    ? "border-[#14532D] bg-[#14532D] text-white"
                                    : "border-[#14532D]/25 bg-white text-[#14532D] hover:bg-[#14532D] hover:text-white"
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
      <footer className="border-t border-[#14532D]/12 bg-[#F2F6F3] px-6 py-10 text-center">
        <div className="mx-auto max-w-xl">
          <SigerArchCrest className="mx-auto mb-3 h-7 w-28" strokeColor="#A16207" />
          <div className="inline-flex items-center gap-2 text-[#A16207]">
            <Heart size={16} weight="fill" />
            <span className="font-serif-editorial text-xl font-medium italic leading-[1.15] pb-1 text-[#14532D]">
              {coupleTitle}
            </span>
          </div>
          <p className="mt-3 text-xs text-[#18241C]/70">
            Undangan digital adat Sunda dibuat lewat{" "}
            <Link
              href="/"
              className="font-semibold text-[#14532D] underline decoration-[#A16207]/60 underline-offset-4 transition-colors hover:text-[#A16207]"
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
            key="sunda-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label="Detail foto galeri adat Sunda"
            className={cn(
              embedded ? "absolute inset-0 z-50" : "fixed inset-0 z-50",
              "flex items-center justify-center bg-[#14532D]/80 p-4 backdrop-blur-xs"
            )}
          >
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease: SUNDA_EASE }}
              onClick={(event) => event.stopPropagation()}
              className="relative w-full max-w-2xl rounded-2xl border border-[#14532D]/15 bg-[#FAFAF7] p-4 shadow-2xl sm:p-6"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="tabular-nums text-xs font-semibold uppercase tracking-[0.16em] text-[#A16207]">
                  {lightboxIndex + 1} / {totalPhotos} - Galeri {coupleTitle}
                </span>
                <button
                  type="button"
                  onClick={closeLightbox}
                  aria-label="Tutup foto"
                  className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#14532D]/20 text-[#14532D] transition-colors hover:bg-[#F2F6F3]"
                >
                  <X size={16} weight="bold" />
                </button>
              </div>

              <div className="max-h-[65dvh] overflow-hidden rounded-xl bg-[#F2F6F3]">
                <img
                  src={activeLightboxUrl}
                  alt={`Potret prewedding adat Sunda ${coupleTitle} ${lightboxIndex + 1}`}
                  className="max-h-[65dvh] w-full object-contain"
                />
              </div>

              <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <p className="font-serif-editorial text-xl font-medium italic leading-[1.15] pb-1 text-[#14532D]">
                  Momen Kabagjaan {coupleTitle}
                </p>

                {totalPhotos > 1 && (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={goPrevPhoto}
                      aria-label="Foto sebelumnya"
                      className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-[#14532D]/25 bg-white px-4 py-2 text-xs font-semibold text-[#14532D] transition-colors hover:bg-[#F2F6F3]"
                    >
                      <CaretLeft size={14} weight="bold" />
                      <span>Prev</span>
                    </button>
                    <button
                      type="button"
                      onClick={goNextPhoto}
                      aria-label="Foto berikutnya"
                      className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-[#14532D] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#166534]"
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

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  ArrowSquareOut,
  CalendarHeart,
  CalendarPlus,
  Check,
  Clock,
  Copy,
  DoorOpen,
  Gift,
  Heart,
  Images,
  MapPin,
  Play,
  Users,
  WhatsappLogo,
  X,
} from "@phosphor-icons/react";
import { MusicPlayer } from "@/components/MusicPlayer";
import type { NikahSiteConfig } from "@/lib/schema";
import { playSfx } from "@/lib/sfx";
import { buildWhatsAppUrl, cn } from "@/lib/utils";

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

interface WishEntry {
  name: string;
  attendance: string;
  message: string;
}

const MOTION_EASE = [0.22, 1, 0.36, 1] as const;
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
    : "20270214";
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

function FloralClusterSvg({
  className,
  variant = "maroon",
}: {
  className?: string;
  variant?: "maroon" | "blush" | "leaf";
}) {
  const mainPetal = variant === "blush" ? "#D48894" : "#7A1C2C";
  const midPetal = variant === "blush" ? "#EBB5BE" : "#9E2A3B";
  const lightPetal = variant === "blush" ? "#F7DCE1" : "#E6B4BC";
  const centerGold = "#D4A359";

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 220 220"
      fill="none"
      className={className}
    >
      {/* Banana & tropical leaves */}
      <path
        d="M16 198C20 132 54 78 118 46C96 98 68 150 28 202Z"
        fill="#4E6B50"
        opacity="0.92"
      />
      <path
        d="M36 206C62 152 108 118 176 96C142 140 98 178 44 210Z"
        fill="#6A8969"
        opacity="0.88"
      />
      <path
        d="M10 154C24 102 52 58 84 22C82 68 58 118 20 162Z"
        fill="#7E9B79"
        opacity="0.85"
      />
      {/* Leaf veins */}
      <path
        d="M24 192C48 142 74 100 108 58"
        stroke="#A4BE9E"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.65"
      />
      <path
        d="M46 200C86 164 124 134 164 106"
        stroke="#A4BE9E"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.65"
      />

      {/* Main Peony / Rose */}
      <g transform="translate(88 124)">
        <circle cx="0" cy="0" r="34" fill={mainPetal} />
        <ellipse cx="-16" cy="-12" rx="18" ry="14" transform="rotate(-24 -16 -12)" fill={midPetal} />
        <ellipse cx="16" cy="-10" rx="18" ry="13" transform="rotate(28 16 -10)" fill={midPetal} />
        <ellipse cx="-12" cy="14" rx="17" ry="13" transform="rotate(18 -12 14)" fill={midPetal} />
        <ellipse cx="14" cy="14" rx="16" ry="12" transform="rotate(-20 14 14)" fill={midPetal} />
        <circle cx="0" cy="0" r="14" fill={lightPetal} opacity="0.72" />
        <circle cx="0" cy="0" r="6" fill={centerGold} />
      </g>

      {/* Secondary Blush Orchid */}
      <g transform="translate(148 156)">
        <ellipse cx="-14" cy="-6" rx="14" ry="10" transform="rotate(-30 -14 -6)" fill="#F3D6DB" />
        <ellipse cx="14" cy="-6" rx="14" ry="10" transform="rotate(30 14 -6)" fill="#F3D6DB" />
        <ellipse cx="0" cy="-16" rx="10" ry="14" fill="#FAF0F2" />
        <ellipse cx="-10" cy="12" rx="11" ry="13" transform="rotate(15 -10 12)" fill="#E7B3BC" />
        <ellipse cx="10" cy="12" rx="11" ry="13" transform="rotate(-15 10 12)" fill="#E7B3BC" />
        <circle cx="0" cy="2" r="5.5" fill={mainPetal} />
        <circle cx="0" cy="2" r="2.2" fill={centerGold} />
      </g>

      {/* Upper Jasmine / Melati Sprig */}
      <g transform="translate(52 68)">
        <circle cx="0" cy="0" r="11" fill="#FBF6EE" />
        <circle cx="16" cy="-14" r="9" fill="#FBF6EE" />
        <circle cx="-12" cy="18" r="8" fill="#F5E9D6" />
        <circle cx="0" cy="0" r="3" fill={centerGold} />
        <circle cx="16" cy="-14" r="2.5" fill={centerGold} />
        <circle cx="-12" cy="18" r="2.2" fill={centerGold} />
      </g>

      {/* Accent Buds */}
      <circle cx="176" cy="118" r="6" fill={midPetal} />
      <circle cx="188" cy="108" r="4" fill={lightPetal} />
      <circle cx="114" cy="54" r="5.5" fill="#F6E8EC" />
    </svg>
  );
}

function WayangSilhouetteSvg({
  className,
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 220"
      fill="none"
      className={cn(flip && "-scale-x-100", className)}
    >
      {/* Ornate Gunungan / Wayang profile silhouette */}
      <path
        d="M28 214C28 176 34 148 44 126C36 114 38 92 50 80C46 66 54 50 66 44C62 32 70 18 82 14C78 30 84 44 92 56C104 70 100 94 88 108C98 132 102 168 96 214H28Z"
        fill="#704B28"
        opacity="0.88"
      />
      <path
        d="M42 206C44 174 50 148 58 132C68 148 74 176 76 206H42Z"
        fill="#D6B67D"
        opacity="0.45"
      />
      <circle cx="72" cy="64" r="5" fill="#F3ECE1" opacity="0.6" />
      <path
        d="M52 104C62 96 76 96 86 104"
        stroke="#E4C892"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

function ButterflySvg({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 40"
      fill="none"
      className={className}
    >
      <path
        d="M24 20C17 7 4 4 3 14C2 22 12 24 22 22Z"
        fill="#B95D6D"
        className="origin-right animate-[wingFlap_0.45s_ease-in-out_infinite_alternate]"
      />
      <path
        d="M24 20C31 7 44 4 45 14C46 22 36 24 26 22Z"
        fill="#D48491"
        className="origin-left animate-[wingFlap_0.45s_ease-in-out_infinite_alternate]"
      />
      <path
        d="M23 22C15 24 8 30 12 35C16 38 22 31 23 24Z"
        fill="#8A2B3D"
      />
      <path
        d="M25 22C33 24 40 30 36 35C32 38 26 31 25 24Z"
        fill="#A43D50"
      />
      <rect x="23" y="13" width="2" height="14" rx="1" fill="#4A2C2A" />
    </svg>
  );
}

function KawungWatermarkSvg({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 160 160"
      fill="none"
      className={className}
    >
      <defs>
        <pattern
          id="kawung-motion-pattern"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <ellipse cx="20" cy="10" rx="6" ry="9" stroke="#8C6D46" strokeWidth="1" opacity="0.35" />
          <ellipse cx="20" cy="30" rx="6" ry="9" stroke="#8C6D46" strokeWidth="1" opacity="0.35" />
          <ellipse cx="10" cy="20" rx="9" ry="6" stroke="#8C6D46" strokeWidth="1" opacity="0.35" />
          <ellipse cx="30" cy="20" rx="9" ry="6" stroke="#8C6D46" strokeWidth="1" opacity="0.35" />
          <circle cx="20" cy="20" r="2" fill="#8C6D46" opacity="0.4" />
        </pattern>
      </defs>
      <rect width="160" height="160" fill="url(#kawung-motion-pattern)" />
    </svg>
  );
}

export function NikahMotionTemplate({
  site,
  embedded = false,
}: {
  site: NikahSiteConfig;
  embedded?: boolean;
}) {
  const { data } = site;
  const shouldReduceMotion = useReducedMotion();

  const [isOpen, setIsOpen] = useState(false);
  const [gateBurstKey, setGateBurstKey] = useState(0);
  const [isGateVisible, setIsGateVisible] = useState(false);
  const [guestName, setGuestName] = useState("Tamu Undangan");
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const [rsvpName, setRsvpName] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState("Hadir, 2 Orang");
  const [rsvpMessage, setRsvpMessage] = useState("");
  const [wishes, setWishes] = useState<WishEntry[]>([
    {
      name: "Keluarga Besar Bapak Hendra",
      attendance: "Hadir",
      message: "Selamat menempuh hidup baru, semoga menjadi keluarga sakinah mawaddah warahmah.",
    },
    {
      name: "Nadia & Raka",
      attendance: "Hadir",
      message: "Lancar sampai hari H! Turut berbahagia melihat kalian bersatu.",
    },
  ]);

  const [countdown, setCountdown] = useState<CountdownState>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const to = params.get("to")?.trim();
    if (to) {
      setGuestName(to);
      setRsvpName(to);
    }
  }, []);

  useEffect(() => {
    const targetMs = new Date(data.weddingDateIso).getTime();
    if (Number.isNaN(targetMs)) return;

    const tick = () => {
      const diff = targetMs - Date.now();
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        isPast: false,
      });
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [data.weddingDateIso]);

  const triggerEntrance = useCallback(() => {
    playSfx("gong-jawa");
    setIsOpen(true);
    setGateBurstKey((k) => k + 1);
    setIsGateVisible(true);
  }, []);

  useEffect(() => {
    if (!isGateVisible) return;
    const timer = window.setTimeout(() => {
      setIsGateVisible(false);
    }, 1750);
    return () => window.clearTimeout(timer);
  }, [isGateVisible, gateBurstKey]);

  const heroVenueBg = "/demo/nikah-jawa-venue.webp";
  const coverPortrait = data.gallery[0] ?? data.bride.photoUrl ?? "/demo/nikah-jawa-couple.webp";

  const calendarUrl = useMemo(
    () =>
      buildGoogleCalendarUrl({
        title: `Pernikahan ${data.bride.nickname} & ${data.groom.nickname}`,
        weddingDateIso: data.weddingDateIso,
        timeLabel: data.akad.timeLabel,
        venueName: data.akad.venueName,
        address: data.akad.address,
        details: data.culturalNote ?? "",
      }),
    [data]
  );

  const handleCopyAccount = async (accountNumber: string) => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopiedBank(accountNumber);
      window.setTimeout(() => setCopiedBank(null), 2000);
    } catch {
      setCopiedBank(accountNumber);
    }
  };

  const handleWishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = rsvpName.trim() || guestName;
    const cleanMsg = rsvpMessage.trim();
    if (!cleanMsg) return;
    setWishes((prev) => [
      { name: cleanName, attendance: rsvpStatus, message: cleanMsg },
      ...prev,
    ]);
    setRsvpMessage("");
  };

  const whatsappRsvpUrl = useMemo(() => {
    const cleanName = rsvpName.trim() || guestName;
    const msg = `Halo, saya *${cleanName}* ingin konfirmasi kehadiran di pernikahan *${data.bride.nickname} & ${data.groom.nickname}*.\nStatus: *${rsvpStatus}*${
      rsvpMessage.trim() ? `\nUcapan: "${rsvpMessage.trim()}"` : ""
    }`;
    return buildWhatsAppUrl(data.rsvpWhatsapp, msg);
  }, [data.bride.nickname, data.groom.nickname, data.rsvpWhatsapp, guestName, rsvpMessage, rsvpName, rsvpStatus]);

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-[#F3ECE1] text-[#3B1F1E] selection:bg-[#7A1C2C] selection:text-white">
      {/* Custom lightweight CSS keyframes for organic wind sway & wing flap */}
      <style>{`
        @keyframes floralSwayLeft {
          0% { transform: rotate(-2.8deg) translateY(0px); }
          100% { transform: rotate(2.6deg) translateY(-3px); }
        }
        @keyframes floralSwayRight {
          0% { transform: rotate(2.6deg) translateY(0px); }
          100% { transform: rotate(-2.8deg) translateY(-3px); }
        }
        @keyframes wingFlap {
          0% { transform: scaleX(1); }
          100% { transform: scaleX(0.32); }
        }
        @media (prefers-reduced-motion: reduce) {
          .motion-sway-left, .motion-sway-right { animation: none !important; }
        }
        .motion-sway-left {
          transform-origin: bottom left;
          animation: floralSwayLeft 5.2s ease-in-out infinite alternate;
        }
        .motion-sway-right {
          transform-origin: bottom right;
          animation: floralSwayRight 5.8s ease-in-out infinite alternate;
        }
      `}</style>

      {/* Music Player */}
      <MusicPlayer
        track={site.musicTrack}
        autoPlayTrigger={isOpen}
        className={embedded ? "bottom-16 right-3" : "bottom-20 right-4"}
      />

      {/* COVER GATE (!isOpen) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.section
            key="cover-gate"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.7, ease: MOTION_EASE } }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#EFE6D8] px-5 py-8"
          >
            {/* Subtle Kawung Background */}
            <KawungWatermarkSvg className="pointer-events-none absolute inset-0 h-full w-full opacity-35" />

            {/* Cover Swaying Florals */}
            <FloralClusterSvg
              variant="maroon"
              className="motion-sway-left pointer-events-none absolute -bottom-8 -left-10 h-56 w-56 sm:h-72 sm:w-72"
            />
            <FloralClusterSvg
              variant="blush"
              className="motion-sway-right pointer-events-none absolute -bottom-8 -right-10 h-56 w-56 -scale-x-100 sm:h-72 sm:w-72"
            />
            <FloralClusterSvg
              variant="blush"
              className="motion-sway-left pointer-events-none absolute -left-12 -top-10 h-44 w-44 rotate-90 opacity-90 sm:h-56 sm:w-56"
            />
            <FloralClusterSvg
              variant="maroon"
              className="motion-sway-right pointer-events-none absolute -right-12 -top-10 h-44 w-44 -rotate-90 -scale-x-100 opacity-90 sm:h-56 sm:w-56"
            />

            {/* Center Cover Card */}
            <motion.div
              initial={shouldReduceMotion ? false : { y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: MOTION_EASE }}
              className="relative z-10 flex w-full max-w-sm flex-col items-center rounded-[2rem] border border-[#C6A77D]/60 bg-[#FAF6EE]/95 px-6 py-8 text-center shadow-xl backdrop-blur-sm"
            >
              {/* Arched Couple Portrait */}
              <div className="mb-5 h-52 w-40 overflow-hidden rounded-t-full rounded-b-2xl border-4 border-[#7A1C2C]/85 bg-[#E6DAC8] p-1 shadow-md">
                <img
                  src={coverPortrait}
                  alt={`${data.bride.nickname} & ${data.groom.nickname}`}
                  className="h-full w-full rounded-t-full rounded-b-xl object-cover"
                />
              </div>

              <p className="text-[11px] font-semibold tracking-[0.28em] text-[#7A1C2C] uppercase">
                Wedding Invitation
              </p>
              <h1 className="mt-2 font-serif text-3xl italic tracking-wide text-[#4A0E19] sm:text-4xl">
                {data.bride.nickname} &amp; {data.groom.nickname}
              </h1>

              <div className="mt-4 w-full rounded-xl border border-[#D8C5A8] bg-[#F4ECE0] px-4 py-3">
                <p className="text-xs text-[#6E4F45]">Kepada Bapak/Ibu/Saudara/i:</p>
                <p className="mt-0.5 font-serif text-lg font-semibold text-[#4A0E19]">
                  {guestName}
                </p>
              </div>

              <button
                type="button"
                onClick={triggerEntrance}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#7A1C2C] px-7 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#5E1320] active:scale-95"
              >
                <DoorOpen size={18} weight="fill" />
                Buka Undangan
              </button>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* FLORAL CURTAIN GATE TRANSITION (Plays when opening or replaying!) */}
      <AnimatePresence>
        {isGateVisible && !shouldReduceMotion && (
          <div
            key={`floral-gate-${gateBurstKey}`}
            className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
          >
            {/* Top floral arch parting upward */}
            <motion.div
              initial={{ y: "0%", scale: 1.05, opacity: 1 }}
              animate={{ y: "-110%", scale: 1.35, opacity: 0 }}
              transition={{ duration: 1.45, ease: MOTION_EASE }}
              className="absolute inset-x-0 -top-12 flex justify-between"
            >
              <FloralClusterSvg variant="maroon" className="h-64 w-64 rotate-90 sm:h-80 sm:w-80" />
              <FloralClusterSvg variant="blush" className="h-64 w-64 -rotate-90 -scale-x-100 sm:h-80 sm:w-80" />
            </motion.div>

            {/* Left floral curtain parting left & zooming past camera */}
            <motion.div
              initial={{ x: "-5%", y: "0%", scale: 1.1, opacity: 1 }}
              animate={{ x: "-115%", y: "10%", scale: 1.55, opacity: 0 }}
              transition={{ duration: 1.55, ease: MOTION_EASE }}
              className="absolute inset-y-0 -left-12 flex flex-col justify-center"
            >
              <FloralClusterSvg variant="maroon" className="h-80 w-80 sm:h-[26rem] sm:w-[26rem]" />
              <FloralClusterSvg variant="blush" className="-mt-32 h-72 w-72 sm:h-96 sm:w-96" />
            </motion.div>

            {/* Right floral curtain parting right & zooming past camera */}
            <motion.div
              initial={{ x: "5%", y: "0%", scale: 1.1, opacity: 1 }}
              animate={{ x: "115%", y: "10%", scale: 1.55, opacity: 0 }}
              transition={{ duration: 1.55, ease: MOTION_EASE }}
              className="absolute inset-y-0 -right-12 flex flex-col justify-center"
            >
              <FloralClusterSvg variant="maroon" className="h-80 w-80 -scale-x-100 sm:h-[26rem] sm:w-[26rem]" />
              <FloralClusterSvg variant="blush" className="-mt-32 h-72 w-72 -scale-x-100 sm:h-96 sm:w-96" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MAIN INVITATION CONTENT */}
      <div className="mx-auto max-w-md bg-[#FAF5EC] pb-24 shadow-2xl sm:my-6 sm:rounded-[2rem] sm:border sm:border-[#DFCFB6]">
        {/* SECTION 1: PENDOPO HERO STAGE */}
        <section
          id="hero"
          className="relative flex min-h-[86vh] flex-col items-center justify-between overflow-hidden bg-[#EFE5D4] px-5 pt-14 pb-10 text-center sm:rounded-t-[2rem]"
        >
          {/* Pendopo Backdrop with Gentle Zoom-Out */}
          <motion.div
            key={`pendopo-${gateBurstKey}`}
            initial={shouldReduceMotion ? false : { scale: 1.16 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2.2, ease: MOTION_EASE }}
            className="pointer-events-none absolute inset-0"
          >
            <img
              src={heroVenueBg}
              alt="Pendopo Joglo"
              className="h-full w-full object-cover object-bottom opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#F4ECE0] via-[#F4ECE0]/70 to-transparent" />
          </motion.div>

          {/* Drifting Cloud Layer */}
          {!shouldReduceMotion && (
            <motion.div
              animate={{ x: [-18, 18, -18] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", type: "tween" }}
              className="pointer-events-none absolute inset-x-0 top-10 h-32 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.65)_0%,transparent_70%)] opacity-75"
            />
          )}

          {/* Batik Kawung Fade-In */}
          <motion.div
            key={`kawung-${gateBurstKey}`}
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 1.8, delay: 0.4 }}
            className="pointer-events-none absolute inset-x-0 top-0 h-72"
          >
            <KawungWatermarkSvg className="h-full w-full" />
          </motion.div>

          {/* Animated Butterflies */}
          {!shouldReduceMotion && (
            <>
              <motion.div
                animate={{
                  x: [0, 36, 12, -24, 0],
                  y: [0, -28, -48, -18, 0],
                }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", type: "tween" }}
                className="pointer-events-none absolute left-1/4 top-1/3 z-20"
              >
                <ButterflySvg className="h-7 w-7" />
              </motion.div>
              <motion.div
                animate={{
                  x: [0, -32, -8, 22, 0],
                  y: [0, -22, -40, -14, 0],
                }}
                transition={{ duration: 11, delay: 1.2, repeat: Infinity, ease: "easeInOut", type: "tween" }}
                className="pointer-events-none absolute right-1/4 top-1/2 z-20"
              >
                <ButterflySvg className="h-6 w-6" />
              </motion.div>
            </>
          )}

          {/* Staggered Wayang Left & Right */}
          <motion.div
            key={`wayang-l-${gateBurstKey}`}
            initial={shouldReduceMotion ? false : { x: -70, opacity: 0 }}
            animate={{ x: 0, opacity: 0.9 }}
            transition={{ duration: 1.1, delay: 0.55, ease: MOTION_EASE }}
            className="motion-sway-left pointer-events-none absolute bottom-12 -left-4 z-10"
          >
            <WayangSilhouetteSvg className="h-44 w-24 sm:h-52 sm:w-28" />
          </motion.div>

          <motion.div
            key={`wayang-r-${gateBurstKey}`}
            initial={shouldReduceMotion ? false : { x: 70, opacity: 0 }}
            animate={{ x: 0, opacity: 0.9 }}
            transition={{ duration: 1.1, delay: 0.55, ease: MOTION_EASE }}
            className="motion-sway-right pointer-events-none absolute bottom-12 -right-4 z-10"
          >
            <WayangSilhouetteSvg flip className="h-44 w-24 sm:h-52 sm:w-28" />
          </motion.div>

          {/* Swaying Corner Florals Framing Hero */}
          <FloralClusterSvg
            variant="maroon"
            className="motion-sway-left pointer-events-none absolute -bottom-6 -left-8 z-20 h-44 w-44"
          />
          <FloralClusterSvg
            variant="maroon"
            className="motion-sway-right pointer-events-none absolute -bottom-6 -right-8 z-20 h-44 w-44 -scale-x-100"
          />
          <FloralClusterSvg
            variant="blush"
            className="motion-sway-left pointer-events-none absolute -left-10 -top-8 z-20 h-36 w-36 rotate-90"
          />
          <FloralClusterSvg
            variant="blush"
            className="motion-sway-right pointer-events-none absolute -right-10 -top-8 z-20 h-36 w-36 -rotate-90 -scale-x-100"
          />

          {/* Replay Entrance Button */}
          <div className="relative z-30 flex w-full justify-end">
            <button
              type="button"
              onClick={triggerEntrance}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#7A1C2C]/30 bg-white/80 px-3 py-1.5 text-[11px] font-medium text-[#7A1C2C] shadow-sm backdrop-blur-sm transition hover:bg-white"
            >
              <Play size={12} weight="fill" />
              Putar Ulang Animasi
            </button>
          </div>

          {/* Staggered Hero Title */}
          <motion.div
            key={`title-${gateBurstKey}`}
            initial={shouldReduceMotion ? false : { y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.95, delay: 0.8, ease: MOTION_EASE }}
            className="relative z-20 my-auto pt-4"
          >
            <p className="text-[11px] font-semibold tracking-[0.28em] text-[#7A1C2C] uppercase">
              The Wedding Of
            </p>
            <h2 className="mt-3 font-serif text-4xl italic leading-tight text-[#4A0E19]">
              {data.bride.nickname}
              <span className="my-1 block text-2xl not-italic text-[#9E783B]">&amp;</span>
              {data.groom.nickname}
            </h2>
            <p className="mt-4 inline-block rounded-full border border-[#C6A77D] bg-[#FAF5EC]/90 px-4 py-1 text-xs font-medium tracking-widest text-[#5E3A2E]">
              {data.akad.dateLabel}
            </p>
          </motion.div>

          <div className="relative z-20 h-16" />
        </section>

        {/* SECTION 2: QUOTE / DOA */}
        <motion.section
          initial={shouldReduceMotion ? false : { y: 24, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: 0.7, ease: MOTION_EASE }}
          className="relative mx-4 mt-6 overflow-hidden rounded-3xl border border-[#DFCFB6] bg-[#6B1826] px-6 py-8 text-center text-[#FAF5EC] shadow-md"
        >
          <p className="font-serif text-sm italic leading-relaxed text-[#F7E8EC]">
            &ldquo;{data.blessingQuote.text}&rdquo;
          </p>
          <p className="mt-3 text-xs font-semibold tracking-wider text-[#E6C58B] uppercase">
            {data.blessingQuote.source}
          </p>
        </motion.section>

        {/* SECTION 3: BRIDE & GROOM */}
        <section id="mempelai" className="relative px-4 pt-10">
          <div className="text-center">
            <p className="text-[11px] font-semibold tracking-[0.24em] text-[#7A1C2C] uppercase">
              Mempelai Berbahagia
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[#6E4F45]">
              {data.culturalNote}
            </p>
          </div>

          <div className="mt-6 space-y-5">
            {[
              { role: "Mempelai Putri", person: data.bride },
              { role: "Mempelai Putra", person: data.groom },
            ].map((item, idx) => (
              <motion.div
                key={item.role}
                initial={shouldReduceMotion ? false : { y: 22, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={VIEWPORT_ONCE}
                transition={{ duration: 0.65, delay: idx * 0.1, ease: MOTION_EASE }}
                className="relative overflow-hidden rounded-3xl border border-[#DFCFB6] bg-white px-5 py-7 text-center shadow-sm"
              >
                <FloralClusterSvg
                  variant={idx === 0 ? "blush" : "maroon"}
                  className="motion-sway-left pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 opacity-75"
                />
                <div className="mx-auto h-40 w-32 overflow-hidden rounded-t-full rounded-b-xl border-2 border-[#C6A77D] bg-[#EFE5D4] p-1">
                  <img
                    src={item.person.photoUrl}
                    alt={item.person.fullName}
                    className="h-full w-full rounded-t-full rounded-b-lg object-cover"
                  />
                </div>
                <p className="mt-4 text-[10px] font-semibold tracking-[0.2em] text-[#9E783B] uppercase">
                  {item.role}
                </p>
                <h3 className="mt-1 font-serif text-2xl italic text-[#4A0E19]">
                  {item.person.fullName}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#6E4F45]">
                  {item.person.parents}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECTION 4: SAVE THE DATE & COUNTDOWN */}
        <motion.section
          initial={shouldReduceMotion ? false : { y: 22, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: 0.65, ease: MOTION_EASE }}
          className="relative mx-4 mt-8 overflow-hidden rounded-3xl border border-[#DFCFB6] bg-[#6B1826] px-5 py-7 text-center text-white shadow-md"
        >
          <p className="text-[11px] font-semibold tracking-[0.25em] text-[#E6C58B] uppercase">
            Save The Date
          </p>
          <h3 className="mt-1 font-serif text-2xl italic">Menuju Hari Bahagia</h3>

          {countdown.isPast ? (
            <p className="mt-4 rounded-xl bg-white/10 py-3 text-sm font-medium text-[#F7E8EC]">
              Acara Pernikahan Telah Berlangsung
            </p>
          ) : (
            <div className="mt-5 grid grid-cols-4 gap-2">
              {[
                { label: "Hari", value: padTwo(countdown.days) },
                { label: "Jam", value: padTwo(countdown.hours) },
                { label: "Menit", value: padTwo(countdown.minutes) },
                { label: "Detik", value: padTwo(countdown.seconds) },
              ].map((unit) => (
                <div
                  key={unit.label}
                  className="rounded-2xl border border-white/15 bg-white/10 py-3"
                >
                  <p className="font-serif text-2xl font-bold">{unit.value}</p>
                  <p className="text-[10px] tracking-wider text-[#F3D6DB] uppercase">
                    {unit.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          <a
            href={calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#FAF5EC] px-5 py-2.5 text-xs font-semibold text-[#6B1826] shadow transition hover:bg-white"
          >
            <CalendarPlus size={16} weight="bold" />
            Simpan ke Google Calendar
          </a>
        </motion.section>

        {/* SECTION 5: AKAD & RESEPSI */}
        <section id="acara" className="px-4 pt-10">
          <div className="text-center">
            <p className="text-[11px] font-semibold tracking-[0.24em] text-[#7A1C2C] uppercase">
              Rangkaian Acara
            </p>
            <h3 className="mt-1 font-serif text-2xl italic text-[#4A0E19]">
              Akad Nikah &amp; Resepsi
            </h3>
          </div>

          <div className="mt-6 space-y-5">
            {[
              { title: "Akad Nikah", event: data.akad, dark: true },
              { title: "Resepsi Pernikahan", event: data.resepsi, dark: false },
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                initial={shouldReduceMotion ? false : { y: 22, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={VIEWPORT_ONCE}
                transition={{ duration: 0.65, delay: idx * 0.1, ease: MOTION_EASE }}
                className={cn(
                  "relative overflow-hidden rounded-3xl border px-6 py-7 text-center shadow-sm",
                  item.dark
                    ? "border-[#5E1320] bg-[#4A0E19] text-[#FAF5EC]"
                    : "border-[#DFCFB6] bg-white text-[#3B1F1E]"
                )}
              >
                <FloralClusterSvg
                  variant={item.dark ? "blush" : "maroon"}
                  className="motion-sway-right pointer-events-none absolute -right-8 -top-8 h-28 w-28 -rotate-90 -scale-x-100 opacity-75"
                />
                <h4 className="font-serif text-2xl italic">{item.title}</h4>
                <div className="mt-4 space-y-2 text-xs">
                  <p className="inline-flex items-center justify-center gap-1.5 font-semibold">
                    <CalendarHeart size={15} weight="fill" />
                    {item.event.dateLabel}
                  </p>
                  <p className="flex items-center justify-center gap-1.5 opacity-90">
                    <Clock size={15} />
                    {item.event.timeLabel}
                  </p>
                  <p className="pt-2 font-semibold">{item.event.venueName}</p>
                  <p className="mx-auto max-w-xs leading-relaxed opacity-85">
                    {item.event.address}
                  </p>
                </div>

                <a
                  href={item.event.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "mt-5 inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-semibold transition",
                    item.dark
                      ? "bg-[#FAF5EC] text-[#4A0E19] hover:bg-white"
                      : "bg-[#7A1C2C] text-white hover:bg-[#5E1320]"
                  )}
                >
                  <MapPin size={14} weight="fill" />
                  Petunjuk Lokasi
                  <ArrowSquareOut size={13} />
                </a>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECTION 6: LOVE STORY */}
        {data.storyTimeline.length > 0 && (
          <section className="px-4 pt-10">
            <div className="rounded-3xl border border-[#DFCFB6] bg-white px-5 py-7 shadow-sm">
              <div className="text-center">
                <p className="text-[11px] font-semibold tracking-[0.24em] text-[#7A1C2C] uppercase">
                  Love Story
                </p>
                <h3 className="mt-1 font-serif text-2xl italic text-[#4A0E19]">
                  Perjalanan Cinta Kami
                </h3>
              </div>

              <div className="mt-6 space-y-5 border-l-2 border-[#DFCFB6] pl-5">
                {data.storyTimeline.map((story) => (
                  <div key={`${story.year}-${story.title}`} className="relative">
                    <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white bg-[#7A1C2C]" />
                    <p className="text-[11px] font-bold tracking-wider text-[#9E783B]">
                      {story.year}
                    </p>
                    <h4 className="font-serif text-base font-semibold text-[#4A0E19]">
                      {story.title}
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-[#6E4F45]">
                      {story.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SECTION 7: GALLERY */}
        {data.gallery.length > 0 && (
          <section id="galeri" className="px-4 pt-10">
            <div className="text-center">
              <p className="text-[11px] font-semibold tracking-[0.24em] text-[#7A1C2C] uppercase">
                Gallery
              </p>
              <h3 className="mt-1 font-serif text-2xl italic text-[#4A0E19]">
                Momen Kebersamaan
              </h3>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {data.gallery.map((photo, idx) => (
                <button
                  key={`${photo}-${idx}`}
                  type="button"
                  onClick={() => setLightboxSrc(photo)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border border-[#DFCFB6] bg-[#EFE5D4]",
                    idx === 0 ? "col-span-2 aspect-[16/10]" : "aspect-[3/4]"
                  )}
                >
                  <img
                    src={photo}
                    alt={`Galeri ${idx + 1}`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 8: RSVP & WISHES */}
        <section id="rsvp" className="px-4 pt-10">
          <div className="relative overflow-hidden rounded-3xl border border-[#DFCFB6] bg-white px-5 py-7 shadow-sm">
            <div className="text-center">
              <p className="text-[11px] font-semibold tracking-[0.24em] text-[#7A1C2C] uppercase">
                RSVP &amp; Ucapan
              </p>
              <h3 className="mt-1 font-serif text-2xl italic text-[#4A0E19]">
                Konfirmasi Kehadiran
              </h3>
            </div>

            <form onSubmit={handleWishSubmit} className="mt-5 space-y-3 text-left">
              <div>
                <label className="text-xs font-semibold text-[#5E3A2E]">Nama Tamu</label>
                <input
                  type="text"
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  placeholder={guestName}
                  className="mt-1 w-full rounded-xl border border-[#DFCFB6] bg-[#FAF5EC] px-3.5 py-2.5 text-sm text-[#3B1F1E] outline-none focus:border-[#7A1C2C]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#5E3A2E]">Kehadiran</label>
                <select
                  value={rsvpStatus}
                  onChange={(e) => setRsvpStatus(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#DFCFB6] bg-[#FAF5EC] px-3.5 py-2.5 text-sm text-[#3B1F1E] outline-none focus:border-[#7A1C2C]"
                >
                  <option value="Hadir, 1 Orang">Hadir, 1 Orang</option>
                  <option value="Hadir, 2 Orang">Hadir, 2 Orang</option>
                  <option value="Tidak Hadir">Maaf, Tidak Hadir</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#5E3A2E]">Doa &amp; Ucapan</label>
                <textarea
                  rows={3}
                  value={rsvpMessage}
                  onChange={(e) => setRsvpMessage(e.target.value)}
                  placeholder="Tulis doa terbaik untuk kedua mempelai..."
                  className="mt-1 w-full rounded-xl border border-[#DFCFB6] bg-[#FAF5EC] px-3.5 py-2.5 text-sm text-[#3B1F1E] outline-none focus:border-[#7A1C2C]"
                />
              </div>

              <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                <button
                  type="submit"
                  className="flex-1 rounded-full bg-[#7A1C2C] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#5E1320]"
                >
                  Kirim Ucapan
                </button>
                <a
                  href={whatsappRsvpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[#7A1C2C] px-4 py-2.5 text-xs font-semibold text-[#7A1C2C] transition hover:bg-[#7A1C2C]/5"
                >
                  <WhatsappLogo size={16} weight="fill" />
                  Kirim via WA
                </a>
              </div>
            </form>

            {/* Wishes List */}
            <div className="mt-6 max-h-60 space-y-2.5 overflow-y-auto pr-1">
              {wishes.map((w, i) => (
                <div
                  key={`${w.name}-${i}`}
                  className="rounded-2xl border border-[#EFE5D4] bg-[#FAF5EC] px-4 py-3 text-left"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-[#4A0E19]">{w.name}</p>
                    <span className="text-[10px] font-medium text-[#7A1C2C]">
                      {w.attendance}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#6E4F45]">
                    {w.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 9: WEDDING GIFT */}
        {data.digitalEnvelopes.length > 0 && (
          <section className="px-4 pt-10">
            <div className="rounded-3xl border border-[#DFCFB6] bg-white px-5 py-7 text-center shadow-sm">
              <Gift size={28} className="mx-auto text-[#7A1C2C]" weight="duotone" />
              <h3 className="mt-2 font-serif text-2xl italic text-[#4A0E19]">
                Wedding Gift
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#6E4F45]">
                Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Jika ingin mengirimkan tanda kasih, dapat melalui rekening berikut:
              </p>

              <div className="mt-5 space-y-3">
                {data.digitalEnvelopes.map((env) => (
                  <div
                    key={env.accountNumber}
                    className="rounded-2xl border border-[#DFCFB6] bg-[#FAF5EC] p-4"
                  >
                    <p className="text-xs font-bold tracking-wider text-[#7A1C2C] uppercase">
                      {env.bankName}
                    </p>
                    <p className="mt-1 font-mono text-base font-bold text-[#3B1F1E]">
                      {env.accountNumber}
                    </p>
                    <p className="text-xs text-[#6E4F45]">a.n. {env.accountHolder}</p>
                    <button
                      type="button"
                      onClick={() => handleCopyAccount(env.accountNumber)}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#7A1C2C] px-4 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#5E1320]"
                    >
                      {copiedBank === env.accountNumber ? (
                        <>
                          <Check size={13} weight="bold" />
                          Tersalin
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          Salin No. Rekening
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CLOSING */}
        <footer className="relative mt-10 overflow-hidden px-6 pb-8 pt-6 text-center">
          <p className="text-xs leading-relaxed text-[#6E4F45]">
            Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
          </p>
          <p className="mt-4 font-serif text-2xl italic text-[#4A0E19]">
            {data.bride.nickname} &amp; {data.groom.nickname}
          </p>
        </footer>
      </div>

      {/* STICKY BOTTOM NAVIGATION */}
      {isOpen && (
        <nav
          aria-label="Navigasi Undangan"
          className={cn(
            "fixed bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full border border-[#DFCFB6] bg-[#4A0E19]/95 px-3 py-2 text-white shadow-xl backdrop-blur-md",
            embedded && "bottom-2"
          )}
        >
          {[
            { href: "#hero", icon: Heart, label: "Beranda" },
            { href: "#mempelai", icon: Users, label: "Mempelai" },
            { href: "#acara", icon: CalendarHeart, label: "Acara" },
            { href: "#galeri", icon: Images, label: "Galeri" },
            { href: "#rsvp", icon: WhatsappLogo, label: "RSVP" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className="flex flex-col items-center rounded-full px-3 py-1 text-[10px] text-[#F3D6DB] transition hover:bg-white/10 hover:text-white"
              >
                <Icon size={16} weight="fill" />
                <span className="mt-0.5">{item.label}</span>
              </a>
            );
          })}
        </nav>
      )}

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightboxSrc && (
          <motion.div
            key="nikah-motion-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
            onClick={() => setLightboxSrc(null)}
          >
            <button
              type="button"
              aria-label="Tutup foto"
              onClick={() => setLightboxSrc(null)}
              className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white hover:bg-white/25"
            >
              <X size={20} />
            </button>
            <img
              src={lightboxSrc}
              alt="Preview Galeri"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

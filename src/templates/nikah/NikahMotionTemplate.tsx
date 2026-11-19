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

const CINEMATIC_EASE = [0.22, 1, 0.36, 1] as const;
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

/* Rimbun semak bunga Bougainvillea / Mawar Maroon bertumpuk */
function LushBougainvilleaSvg({
  className,
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  const clusters = [
    { cx: 48, cy: 52, r: 22, c: "#6A1B2B" },
    { cx: 74, cy: 38, r: 19, c: "#882438" },
    { cx: 34, cy: 84, r: 24, c: "#7B1E30" },
    { cx: 68, cy: 76, r: 26, c: "#9A3045" },
    { cx: 102, cy: 62, r: 21, c: "#B5485D" },
    { cx: 52, cy: 118, r: 28, c: "#6E1828" },
    { cx: 92, cy: 104, r: 25, c: "#A4384E" },
    { cx: 128, cy: 92, r: 18, c: "#C76B7D" },
    { cx: 36, cy: 152, r: 26, c: "#832134" },
    { cx: 76, cy: 142, r: 24, c: "#B1475B" },
    { cx: 112, cy: 132, r: 19, c: "#D48897" },
    { cx: 58, cy: 180, r: 22, c: "#6B1929" },
    { cx: 94, cy: 168, r: 18, c: "#C97283" },
  ];

  const blossoms = [
    { x: 64, y: 46, s: 1.0, c: "#E8B7C0" },
    { x: 96, y: 74, s: 0.9, c: "#F2D2D8" },
    { x: 46, y: 108, s: 1.1, c: "#DF9AA6" },
    { x: 84, y: 128, s: 0.95, c: "#F5DFE3" },
    { x: 118, y: 108, s: 0.85, c: "#EBBAC3" },
    { x: 66, y: 162, s: 1.0, c: "#E6A8B4" },
    { x: 40, y: 66, s: 0.8, c: "#F3D7DC" },
  ];

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 240"
      fill="none"
      className={cn(flip && "-scale-x-100", className)}
    >
      {/* Branches & back foliage */}
      <path
        d="M8 220C22 162 46 108 112 36"
        stroke="#5A4336"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M32 150C68 134 102 122 146 94"
        stroke="#5A4336"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <ellipse cx="96" cy="48" rx="22" ry="11" transform="rotate(-32 96 48)" fill="#557256" opacity="0.88" />
      <ellipse cx="132" cy="78" rx="24" ry="12" transform="rotate(-14 132 78)" fill="#6B8A6B" opacity="0.85" />
      <ellipse cx="122" cy="144" rx="22" ry="11" transform="rotate(18 122 144)" fill="#4D6B4F" opacity="0.88" />
      <ellipse cx="26" cy="118" rx="20" ry="10" transform="rotate(-48 26 118)" fill="#5D7B5E" opacity="0.85" />

      {/* Dense Bougainvillea clusters */}
      {clusters.map((cl, idx) => (
        <g key={idx}>
          <circle cx={cl.cx} cy={cl.cy} r={cl.r} fill={cl.c} opacity="0.93" />
          <circle cx={cl.cx - 4} cy={cl.cy - 4} r={cl.r * 0.55} fill="#C45C70" opacity="0.35" />
        </g>
      ))}

      {/* Highlight petal blossoms */}
      {blossoms.map((b, idx) => (
        <g key={idx} transform={`translate(${b.x} ${b.y}) scale(${b.s})`}>
          <ellipse cx="-6" cy="-4" rx="7" ry="5" transform="rotate(-25 -6 -4)" fill={b.c} />
          <ellipse cx="6" cy="-4" rx="7" ry="5" transform="rotate(25 6 -4)" fill={b.c} />
          <ellipse cx="0" cy="6" rx="6" ry="7" fill={b.c} />
          <circle cx="0" cy="0" r="2.2" fill="#F8E7B9" />
        </g>
      ))}
    </svg>
  );
}

/* Daun Pisang Tropis Lebar */
function TropicalBananaLeafSvg({
  className,
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 220 220"
      fill="none"
      className={cn(flip && "-scale-x-100", className)}
    >
      {/* Back large banana leaf */}
      <path
        d="M12 208C18 142 52 72 132 18C144 46 130 92 98 134C138 112 164 82 184 54C166 116 112 178 24 214Z"
        fill="#5E7B5F"
        opacity="0.94"
      />
      {/* Mid rib */}
      <path
        d="M16 208C48 150 90 92 142 32"
        stroke="#A3BF9B"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* Front lighter banana leaf */}
      <path
        d="M6 196C42 152 104 126 196 114C168 152 118 188 18 208Z"
        fill="#799777"
        opacity="0.9"
      />
      <path
        d="M16 200C70 168 124 146 184 126"
        stroke="#B9D1B1"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* Subtle leaf ribs */}
      <path d="M56 156L84 114" stroke="#93B08D" strokeWidth="1.1" opacity="0.55" />
      <path d="M74 134L108 92" stroke="#93B08D" strokeWidth="1.1" opacity="0.55" />
      <path d="M88 168L134 152" stroke="#93B08D" strokeWidth="1.1" opacity="0.55" />
    </svg>
  );
}

/* Garland Rangkaian Mawar Maroon, Anggrek Bulan & Melati untuk Border Penuh */
function OrchidRoseGarlandSvg({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 420 150"
      fill="none"
      className={className}
    >
      {/* Sage & olive leaves base */}
      <ellipse cx="48" cy="108" rx="34" ry="14" transform="rotate(-28 48 108)" fill="#526F53" />
      <ellipse cx="104" cy="118" rx="36" ry="15" transform="rotate(-10 104 118)" fill="#6C8B6C" />
      <ellipse cx="210" cy="122" rx="44" ry="16" fill="#4D6A4F" />
      <ellipse cx="316" cy="118" rx="36" ry="15" transform="rotate(10 316 118)" fill="#6C8B6C" />
      <ellipse cx="372" cy="108" rx="34" ry="14" transform="rotate(28 372 108)" fill="#526F53" />

      {/* Left Orchid */}
      <g transform="translate(56 82)">
        <ellipse cx="-18" cy="-8" rx="18" ry="12" transform="rotate(-24 -18 -8)" fill="#F3DCE0" />
        <ellipse cx="18" cy="-8" rx="18" ry="12" transform="rotate(24 18 -8)" fill="#F3DCE0" />
        <ellipse cx="0" cy="-20" rx="12" ry="17" fill="#FCF6F7" />
        <ellipse cx="-12" cy="14" rx="13" ry="15" transform="rotate(15 -12 14)" fill="#E7BAC2" />
        <ellipse cx="12" cy="14" rx="13" ry="15" transform="rotate(-15 12 14)" fill="#E7BAC2" />
        <circle cx="0" cy="2" r="7" fill="#7D1E2E" />
        <circle cx="0" cy="2" r="3" fill="#E6BE74" />
      </g>

      {/* Left-Center Maroon Peony */}
      <g transform="translate(132 94)">
        <circle cx="0" cy="0" r="32" fill="#6D1727" />
        <ellipse cx="-14" cy="-10" rx="16" ry="12" transform="rotate(-20 -14 -10)" fill="#8E2438" />
        <ellipse cx="14" cy="-10" rx="16" ry="12" transform="rotate(20 14 -10)" fill="#8E2438" />
        <ellipse cx="-10" cy="12" rx="15" ry="11" transform="rotate(16 -10 12)" fill="#A33349" />
        <ellipse cx="12" cy="12" rx="15" ry="11" transform="rotate(-16 12 12)" fill="#A33349" />
        <circle cx="0" cy="0" r="12" fill="#D98B98" opacity="0.7" />
        <circle cx="0" cy="0" r="5" fill="#E6BE74" />
      </g>

      {/* Center Cream & Gold Rose */}
      <g transform="translate(210 88)">
        <circle cx="0" cy="0" r="34" fill="#F4E7D8" />
        <ellipse cx="-14" cy="-10" rx="16" ry="12" transform="rotate(-24 -14 -10)" fill="#FAF4EC" />
        <ellipse cx="14" cy="-10" rx="16" ry="12" transform="rotate(24 14 -10)" fill="#FAF4EC" />
        <ellipse cx="0" cy="12" rx="17" ry="12" fill="#EAD4C0" />
        <circle cx="0" cy="0" r="12" fill="#D59A9E" opacity="0.65" />
        <circle cx="0" cy="0" r="5" fill="#D9A84E" />
      </g>

      {/* Right-Center Maroon Peony */}
      <g transform="translate(288 94)">
        <circle cx="0" cy="0" r="32" fill="#6D1727" />
        <ellipse cx="-14" cy="-10" rx="16" ry="12" transform="rotate(-20 -14 -10)" fill="#8E2438" />
        <ellipse cx="14" cy="-10" rx="16" ry="12" transform="rotate(20 14 -10)" fill="#8E2438" />
        <ellipse cx="-10" cy="12" rx="15" ry="11" transform="rotate(16 -10 12)" fill="#A33349" />
        <ellipse cx="12" cy="12" rx="15" ry="11" transform="rotate(-16 12 12)" fill="#A33349" />
        <circle cx="0" cy="0" r="12" fill="#D98B98" opacity="0.7" />
        <circle cx="0" cy="0" r="5" fill="#E6BE74" />
      </g>

      {/* Right Orchid */}
      <g transform="translate(364 82)">
        <ellipse cx="-18" cy="-8" rx="18" ry="12" transform="rotate(-24 -18 -8)" fill="#F3DCE0" />
        <ellipse cx="18" cy="-8" rx="18" ry="12" transform="rotate(24 18 -8)" fill="#F3DCE0" />
        <ellipse cx="0" cy="-20" rx="12" ry="17" fill="#FCF6F7" />
        <ellipse cx="-12" cy="14" rx="13" ry="15" transform="rotate(15 -12 14)" fill="#E7BAC2" />
        <ellipse cx="12" cy="14" rx="13" ry="15" transform="rotate(-15 12 14)" fill="#E7BAC2" />
        <circle cx="0" cy="2" r="7" fill="#7D1E2E" />
        <circle cx="0" cy="2" r="3" fill="#E6BE74" />
      </g>

      {/* Melati & baby buds */}
      <circle cx="94" cy="64" r="9" fill="#FFFDF8" />
      <circle cx="94" cy="64" r="3" fill="#D9A84E" />
      <circle cx="172" cy="66" r="8" fill="#FFFDF8" />
      <circle cx="172" cy="66" r="2.6" fill="#D9A84E" />
      <circle cx="248" cy="66" r="8" fill="#FFFDF8" />
      <circle cx="248" cy="66" r="2.6" fill="#D9A84E" />
      <circle cx="326" cy="64" r="9" fill="#FFFDF8" />
      <circle cx="326" cy="64" r="3" fill="#D9A84E" />
    </svg>
  );
}

function WayangSilhouetteSvg({
  className,
  flip = false,
  tone = "gold",
}: {
  className?: string;
  flip?: boolean;
  tone?: "gold" | "ivory";
}) {
  const fillBody = tone === "ivory" ? "#E8DFCE" : "#6D4724";
  const fillAccent = tone === "ivory" ? "#B89D6D" : "#DFBE82";

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 130 230"
      fill="none"
      className={cn(flip && "-scale-x-100", className)}
    >
      <path
        d="M28 224C26 184 34 152 46 130C36 116 38 92 52 78C46 62 56 46 68 38C64 24 72 10 86 8C80 26 88 42 96 54C110 70 106 96 92 112C104 138 108 176 100 224H28Z"
        fill={fillBody}
        opacity="0.92"
      />
      <path
        d="M42 214C44 180 50 154 60 136C70 154 76 180 78 214H42Z"
        fill={fillAccent}
        opacity="0.48"
      />
      <path
        d="M52 102C64 92 78 92 88 102"
        stroke={fillAccent}
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.7"
      />
      <circle cx="74" cy="60" r="5" fill={fillAccent} opacity="0.75" />
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
        className="origin-right animate-[wingFlap_0.38s_ease-in-out_infinite_alternate]"
      />
      <path
        d="M24 20C31 7 44 4 45 14C46 22 36 24 26 22Z"
        fill="#D48491"
        className="origin-left animate-[wingFlap_0.38s_ease-in-out_infinite_alternate]"
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
    }, 3600);
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
      <style>{`
        @keyframes floralSwayLeft {
          0% { transform: rotate(-2.8deg) translateY(0px); }
          100% { transform: rotate(2.6deg) translateY(-3px); }
        }
        @keyframes floralSwayRight {
          0% { transform: rotate(2.6deg) translateY(0px); }
          100% { transform: rotate(-2.8deg) translateY(-3px); }
        }
        @keyframes floralSwaySlow {
          0% { transform: rotate(-1.6deg) scale(1); }
          100% { transform: rotate(1.6deg) scale(1.015); }
        }
        @keyframes wingFlap {
          0% { transform: scaleX(1); }
          100% { transform: scaleX(0.32); }
        }
        @media (prefers-reduced-motion: reduce) {
          .motion-sway-left, .motion-sway-right, .motion-sway-slow { animation: none !important; }
        }
        .motion-sway-left {
          transform-origin: bottom left;
          animation: floralSwayLeft 5.2s ease-in-out infinite alternate;
        }
        .motion-sway-right {
          transform-origin: bottom right;
          animation: floralSwayRight 5.8s ease-in-out infinite alternate;
        }
        .motion-sway-slow {
          transform-origin: bottom center;
          animation: floralSwaySlow 6.8s ease-in-out infinite alternate;
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
            exit={{ opacity: 0, transition: { duration: 0.9, ease: CINEMATIC_EASE } }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#EFE6D8] px-5 py-8"
          >
            <KawungWatermarkSvg className="pointer-events-none absolute inset-0 h-full w-full opacity-35" />

            {/* Full Lush Cover Frame */}
            <LushBougainvilleaSvg className="motion-sway-left pointer-events-none absolute -left-8 top-6 h-64 w-56 sm:h-80 sm:w-68" />
            <LushBougainvilleaSvg flip className="motion-sway-right pointer-events-none absolute -right-8 top-6 h-64 w-56 sm:h-80 sm:w-68" />
            <TropicalBananaLeafSvg className="motion-sway-left pointer-events-none absolute -bottom-10 -left-10 h-60 w-60 sm:h-72 sm:w-72" />
            <TropicalBananaLeafSvg flip className="motion-sway-right pointer-events-none absolute -bottom-10 -right-10 h-60 w-60 sm:h-72 sm:w-72" />
            <OrchidRoseGarlandSvg className="motion-sway-slow pointer-events-none absolute -bottom-3 left-1/2 w-[118%] max-w-lg -translate-x-1/2" />
            <OrchidRoseGarlandSvg className="motion-sway-slow pointer-events-none absolute -top-5 left-1/2 w-[115%] max-w-lg -translate-x-1/2 rotate-180" />

            {/* Center Cover Card */}
            <motion.div
              initial={shouldReduceMotion ? false : { y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.75, ease: CINEMATIC_EASE }}
              className="relative z-10 flex w-full max-w-sm flex-col items-center rounded-[2rem] border border-[#C6A77D]/70 bg-[#FAF6EE]/95 px-6 py-8 text-center shadow-2xl backdrop-blur-sm"
            >
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

      {/* CINEMATIC MULTI-LAYER FLORAL CURTAIN GATE (0s -> 3.4s) */}
      <AnimatePresence>
        {isGateVisible && !shouldReduceMotion && (
          <div
            key={`floral-gate-${gateBurstKey}`}
            className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
          >
            {/* Layer 1: Midground Floral Garland parting up & down */}
            <motion.div
              initial={{ y: "0%", scale: 1.05, opacity: 1 }}
              animate={{ y: "-120%", scale: 1.65, opacity: 0 }}
              transition={{ duration: 2.7, delay: 0.35, ease: CINEMATIC_EASE }}
              className="absolute inset-x-0 top-0 flex justify-center"
            >
              <OrchidRoseGarlandSvg className="w-[140%] max-w-2xl rotate-180" />
            </motion.div>

            <motion.div
              initial={{ y: "0%", scale: 1.05, opacity: 1 }}
              animate={{ y: "120%", scale: 1.7, opacity: 0 }}
              transition={{ duration: 2.7, delay: 0.35, ease: CINEMATIC_EASE }}
              className="absolute inset-x-0 bottom-0 flex justify-center"
            >
              <OrchidRoseGarlandSvg className="w-[140%] max-w-2xl" />
            </motion.div>

            {/* Layer 2: Lush Bougainvillea Left & Right parting outward */}
            <motion.div
              initial={{ x: "8%", y: "0%", scale: 1.15, opacity: 1 }}
              animate={{ x: "-125%", y: "-8%", scale: 1.85, opacity: 0 }}
              transition={{ duration: 2.9, delay: 0.15, ease: CINEMATIC_EASE }}
              className="absolute inset-y-0 left-0 flex flex-col justify-center"
            >
              <LushBougainvilleaSvg className="h-[26rem] w-[22rem] sm:h-[34rem] sm:w-[28rem]" />
            </motion.div>

            <motion.div
              initial={{ x: "-8%", y: "0%", scale: 1.15, opacity: 1 }}
              animate={{ x: "125%", y: "-8%", scale: 1.85, opacity: 0 }}
              transition={{ duration: 2.9, delay: 0.15, ease: CINEMATIC_EASE }}
              className="absolute inset-y-0 right-0 flex flex-col justify-center"
            >
              <LushBougainvilleaSvg flip className="h-[26rem] w-[22rem] sm:h-[34rem] sm:w-[28rem]" />
            </motion.div>

            {/* Layer 3: Foreground Giant Banana Leaves sweeping past camera */}
            <motion.div
              initial={{ x: "15%", y: "10%", scale: 1.25, opacity: 1 }}
              animate={{ x: "-135%", y: "25%", scale: 2.1, opacity: 0 }}
              transition={{ duration: 2.2, ease: CINEMATIC_EASE }}
              className="absolute bottom-0 left-0"
            >
              <TropicalBananaLeafSvg className="h-80 w-80 sm:h-[28rem] sm:w-[28rem]" />
            </motion.div>

            <motion.div
              initial={{ x: "-15%", y: "10%", scale: 1.25, opacity: 1 }}
              animate={{ x: "135%", y: "25%", scale: 2.1, opacity: 0 }}
              transition={{ duration: 2.2, ease: CINEMATIC_EASE }}
              className="absolute bottom-0 right-0"
            >
              <TropicalBananaLeafSvg flip className="h-80 w-80 sm:h-[28rem] sm:w-[28rem]" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MAIN INVITATION CONTENT */}
      <div className="mx-auto max-w-md bg-[#FAF5EC] pb-24 shadow-2xl sm:my-6 sm:rounded-[2rem] sm:border sm:border-[#DFCFB6]">
        {/* SECTION 1: GRAND PENDOPO HERO STAGE (8.5s Choreographed Entrance) */}
        <section
          id="hero"
          className="relative flex min-h-[90vh] flex-col items-center justify-between overflow-hidden bg-[#EFE5D4] px-5 pt-14 pb-12 text-center sm:rounded-t-[2rem]"
        >
          {/* 1. Pendopo Backdrop: Long Cinematic Push-In (0.8s -> 6.0s) */}
          <motion.div
            key={`pendopo-${gateBurstKey}`}
            initial={shouldReduceMotion ? false : { scale: 1.28, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 5.2, delay: 0.4, ease: CINEMATIC_EASE }}
            className="pointer-events-none absolute inset-0"
          >
            <img
              src={heroVenueBg}
              alt="Pendopo Joglo"
              className="h-full w-full object-cover object-bottom opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#F4ECE0] via-[#F4ECE0]/72 to-transparent" />
          </motion.div>

          {/* 2. Drifting Cloud Mist */}
          {!shouldReduceMotion && (
            <motion.div
              animate={{ x: [-24, 24, -24] }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", type: "tween" }}
              className="pointer-events-none absolute inset-x-0 top-12 h-36 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.72)_0%,transparent_70%)] opacity-80"
            />
          )}

          {/* 3. Batik Kawung Sky Fade-In (3.4s -> 5.6s) */}
          <motion.div
            key={`kawung-${gateBurstKey}`}
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 0.34 }}
            transition={{ duration: 2.2, delay: 3.4 }}
            className="pointer-events-none absolute inset-x-0 top-0 h-80"
          >
            <KawungWatermarkSvg className="h-full w-full" />
          </motion.div>

          {/* 4. Three Butterflies Sweeping Across Scene */}
          {!shouldReduceMotion && (
            <>
              <motion.div
                key={`bf-1-${gateBurstKey}`}
                initial={{ x: -50, y: 120, opacity: 0 }}
                animate={{
                  x: [0, 48, 18, -30, 0],
                  y: [0, -34, -64, -24, 0],
                  opacity: [0, 1, 1, 1, 1],
                }}
                transition={{ duration: 10, delay: 2.4, repeat: Infinity, ease: "easeInOut", type: "tween" }}
                className="pointer-events-none absolute left-1/4 top-1/3 z-20"
              >
                <ButterflySvg className="h-8 w-8" />
              </motion.div>
              <motion.div
                key={`bf-2-${gateBurstKey}`}
                initial={{ x: 50, y: 140, opacity: 0 }}
                animate={{
                  x: [0, -40, -10, 28, 0],
                  y: [0, -28, -52, -18, 0],
                  opacity: [0, 1, 1, 1, 1],
                }}
                transition={{ duration: 12, delay: 3.0, repeat: Infinity, ease: "easeInOut", type: "tween" }}
                className="pointer-events-none absolute right-1/4 top-[42%] z-20"
              >
                <ButterflySvg className="h-7 w-7" />
              </motion.div>
              <motion.div
                key={`bf-3-${gateBurstKey}`}
                initial={{ y: 80, opacity: 0 }}
                animate={{
                  x: [0, 26, -18, 14, 0],
                  y: [0, -40, -70, -30, 0],
                  opacity: [0, 0.9, 0.9, 0.9, 0.9],
                }}
                transition={{ duration: 13, delay: 3.8, repeat: Infinity, ease: "easeInOut", type: "tween" }}
                className="pointer-events-none absolute left-1/2 top-[28%] z-20"
              >
                <ButterflySvg className="h-5 w-5" />
              </motion.div>
            </>
          )}

          {/* 5. Wayang Left & Right Dramatic Slide-In (3.6s -> 5.8s) */}
          <motion.div
            key={`wayang-l-${gateBurstKey}`}
            initial={shouldReduceMotion ? false : { x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 0.95 }}
            transition={{ duration: 2.0, delay: 3.6, ease: CINEMATIC_EASE }}
            className="motion-sway-left pointer-events-none absolute bottom-16 -left-5 z-10"
          >
            <WayangSilhouetteSvg tone="ivory" className="h-52 w-28 sm:h-60 sm:w-32" />
          </motion.div>

          <motion.div
            key={`wayang-r-${gateBurstKey}`}
            initial={shouldReduceMotion ? false : { x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 0.95 }}
            transition={{ duration: 2.0, delay: 3.6, ease: CINEMATIC_EASE }}
            className="motion-sway-right pointer-events-none absolute bottom-16 -right-5 z-10"
          >
            <WayangSilhouetteSvg flip tone="gold" className="h-52 w-28 sm:h-60 sm:w-32" />
          </motion.div>

          {/* 6. Full Lush Botanical Frame Blooming In (2.0s -> 5.2s) */}
          <motion.div
            key={`boug-l-${gateBurstKey}`}
            initial={shouldReduceMotion ? false : { x: -60, scale: 0.72, opacity: 0 }}
            animate={{ x: 0, scale: 1, opacity: 1 }}
            transition={{ duration: 2.2, delay: 2.0, ease: CINEMATIC_EASE }}
            className="motion-sway-left pointer-events-none absolute -left-8 top-12 z-20"
          >
            <LushBougainvilleaSvg className="h-60 w-48 sm:h-68 sm:w-56" />
          </motion.div>

          <motion.div
            key={`boug-r-${gateBurstKey}`}
            initial={shouldReduceMotion ? false : { x: 60, scale: 0.72, opacity: 0 }}
            animate={{ x: 0, scale: 1, opacity: 1 }}
            transition={{ duration: 2.2, delay: 2.0, ease: CINEMATIC_EASE }}
            className="motion-sway-right pointer-events-none absolute -right-8 top-12 z-20"
          >
            <LushBougainvilleaSvg flip className="h-60 w-48 sm:h-68 sm:w-56" />
          </motion.div>

          <motion.div
            key={`leaf-l-${gateBurstKey}`}
            initial={shouldReduceMotion ? false : { x: -50, y: 40, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ duration: 2.0, delay: 2.5, ease: CINEMATIC_EASE }}
            className="motion-sway-left pointer-events-none absolute -bottom-8 -left-10 z-20"
          >
            <TropicalBananaLeafSvg className="h-52 w-52" />
          </motion.div>

          <motion.div
            key={`leaf-r-${gateBurstKey}`}
            initial={shouldReduceMotion ? false : { x: 50, y: 40, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ duration: 2.0, delay: 2.5, ease: CINEMATIC_EASE }}
            className="motion-sway-right pointer-events-none absolute -bottom-8 -right-10 z-20"
          >
            <TropicalBananaLeafSvg flip className="h-52 w-52" />
          </motion.div>

          <motion.div
            key={`garland-top-${gateBurstKey}`}
            initial={shouldReduceMotion ? false : { y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 2.1, delay: 2.8, ease: CINEMATIC_EASE }}
            className="motion-sway-slow pointer-events-none absolute -top-5 left-1/2 z-20 w-[118%] -translate-x-1/2"
          >
            <OrchidRoseGarlandSvg className="w-full rotate-180" />
          </motion.div>

          <motion.div
            key={`garland-bot-${gateBurstKey}`}
            initial={shouldReduceMotion ? false : { y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 2.2, delay: 3.1, ease: CINEMATIC_EASE }}
            className="motion-sway-slow pointer-events-none absolute -bottom-3 left-1/2 z-20 w-[122%] -translate-x-1/2"
          >
            <OrchidRoseGarlandSvg className="w-full" />
          </motion.div>

          {/* Replay Entrance Button */}
          <div className="relative z-30 flex w-full justify-end">
            <button
              type="button"
              onClick={triggerEntrance}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#7A1C2C]/30 bg-white/85 px-3 py-1.5 text-[11px] font-medium text-[#7A1C2C] shadow-sm backdrop-blur-sm transition hover:bg-white"
            >
              <Play size={12} weight="fill" />
              Putar Ulang Animasi
            </button>
          </div>

          {/* 7. Final Staggered Title Reveal (5.2s -> 7.6s) */}
          <motion.div
            key={`title-${gateBurstKey}`}
            initial={shouldReduceMotion ? false : { y: 28, scale: 0.94, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 5.0, ease: CINEMATIC_EASE }}
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

          <div className="relative z-20 h-20" />
        </section>

        {/* SECTION 2: QUOTE / DOA */}
        <motion.section
          initial={shouldReduceMotion ? false : { y: 24, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: 0.7, ease: CINEMATIC_EASE }}
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
                transition={{ duration: 0.65, delay: idx * 0.1, ease: CINEMATIC_EASE }}
                className="relative overflow-hidden rounded-3xl border border-[#DFCFB6] bg-white px-5 py-7 text-center shadow-sm"
              >
                <LushBougainvilleaSvg
                  flip={idx === 1}
                  className={cn(
                    "pointer-events-none absolute -bottom-10 h-40 w-36 opacity-55",
                    idx === 0 ? "motion-sway-left -left-8" : "motion-sway-right -right-8"
                  )}
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
          transition={{ duration: 0.65, ease: CINEMATIC_EASE }}
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
                transition={{ duration: 0.65, delay: idx * 0.1, ease: CINEMATIC_EASE }}
                className={cn(
                  "relative overflow-hidden rounded-3xl border px-6 py-8 text-center shadow-sm",
                  item.dark
                    ? "border-[#5E1320] bg-[#4A0E19] text-[#FAF5EC]"
                    : "border-[#DFCFB6] bg-white text-[#3B1F1E]"
                )}
              >
                <OrchidRoseGarlandSvg className="motion-sway-slow pointer-events-none absolute -top-4 left-1/2 w-[112%] -translate-x-1/2 rotate-180 opacity-85" />
                <h4 className="pt-4 font-serif text-2xl italic">{item.title}</h4>
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

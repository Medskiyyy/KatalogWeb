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
  CaretDown,
  Check,
  Clock,
  Copy,
  DoorOpen,
  Gift,
  Heart,
  Images,
  MapPin,
  Package,
  Palette,
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
  relation: string;
  message: string;
}

const CINEMATIC_EASE = [0.22, 1, 0.36, 1] as const;
const CURTAIN_EASE = [0.42, 0, 0.2, 1] as const;
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
          id="kawung-motion-lattice"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <ellipse cx="20" cy="10" rx="6" ry="9" stroke="#9B7B4D" strokeWidth="0.9" opacity="0.32" />
          <ellipse cx="20" cy="30" rx="6" ry="9" stroke="#9B7B4D" strokeWidth="0.9" opacity="0.32" />
          <ellipse cx="10" cy="20" rx="9" ry="6" stroke="#9B7B4D" strokeWidth="0.9" opacity="0.32" />
          <ellipse cx="30" cy="20" rx="9" ry="6" stroke="#9B7B4D" strokeWidth="0.9" opacity="0.32" />
          <circle cx="20" cy="20" r="1.8" fill="#9B7B4D" opacity="0.38" />
        </pattern>
      </defs>
      <rect width="160" height="160" fill="url(#kawung-motion-lattice)" />
    </svg>
  );
}

function WatercolorButterfly({
  className,
  flapSeconds = 0.32,
}: {
  className?: string;
  flapSeconds?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("relative select-none", className)}
      style={{ perspective: 300 }}
    >
      <img
        src="/demo/motion/butterfly.webp"
        alt=""
        loading="eager"
        decoding="async"
        className="pointer-events-none absolute inset-0 h-full w-full object-contain [clip-path:inset(0_50%_0_0)]"
        style={{
          transformOrigin: "center center",
          animation: `wingFlapLeft ${flapSeconds}s ease-in-out infinite alternate`,
        }}
      />
      <img
        src="/demo/motion/butterfly.webp"
        alt=""
        loading="eager"
        decoding="async"
        className="pointer-events-none absolute inset-0 h-full w-full object-contain [clip-path:inset(0_0_0_50%)]"
        style={{
          transformOrigin: "center center",
          animation: `wingFlapRight ${flapSeconds}s ease-in-out infinite alternate`,
        }}
      />
    </div>
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
  const shouldReduceMotion = Boolean(useReducedMotion());

  const [isOpen, setIsOpen] = useState(false);
  const [gateBurstKey, setGateBurstKey] = useState(0);
  const [isGateVisible, setIsGateVisible] = useState(false);
  const [guestName, setGuestName] = useState("Tamu Undangan");
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const [rsvpName, setRsvpName] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState("Hadir, 2 Orang");
  const [rsvpMessage, setRsvpMessage] = useState("");
  const [wishes, setWishes] = useState<WishEntry[]>(() =>
    data.initialPrayers && data.initialPrayers.length > 0
      ? data.initialPrayers
      : [
          {
            name: "Keluarga Besar Bapak Hendra",
            relation: "Keluarga",
            message:
              "Selamat menempuh hidup baru, semoga menjadi keluarga sakinah mawaddah warahmah.",
          },
          {
            name: "Nadia & Raka",
            relation: "Sahabat",
            message: "Lancar sampai hari H! Turut berbahagia melihat kalian bersatu.",
          },
        ]
  );

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
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [isGateVisible, gateBurstKey]);

  const coverPortrait =
    data.gallery[0] ?? data.bride.photoUrl ?? "/demo/nikah-jawa-couple.webp";
  const featurePortrait =
    data.gallery[1] ?? data.gallery[0] ?? "/demo/nikah-gallery-1.webp";
  const saveDatePhoto =
    data.gallery[2] ?? data.gallery[0] ?? "/demo/nikah-gallery-2.webp";
  const closingPortrait =
    data.gallery[data.gallery.length - 1] ?? coverPortrait;

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
      { name: cleanName, relation: rsvpStatus, message: cleanMsg },
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
  }, [
    data.bride.nickname,
    data.groom.nickname,
    data.rsvpWhatsapp,
    guestName,
    rsvpMessage,
    rsvpName,
    rsvpStatus,
  ]);

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-[#D9D0BE] text-[#3B1F1E] font-[family-name:var(--font-jakarta)] selection:bg-[#7A1C2C] selection:text-white">
      <style>{`
        @keyframes floralSwayA {
          0% { transform: rotate(-2.2deg) translateY(0px); }
          100% { transform: rotate(2.1deg) translateY(-3px); }
        }
        @keyframes floralSwayB {
          0% { transform: rotate(2.1deg) translateY(0px); }
          100% { transform: rotate(-2.2deg) translateY(-3px); }
        }
        @keyframes floralSwayC {
          0% { transform: rotate(-1.3deg) scale(1); }
          100% { transform: rotate(1.3deg) scale(1.015); }
        }
        @keyframes wingFlapLeft {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(64deg); }
        }
        @keyframes wingFlapRight {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(-64deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .motion-sway-a, .motion-sway-b, .motion-sway-c { animation: none !important; }
        }
        .motion-sway-a {
          transform-origin: bottom left;
          animation: floralSwayA 5.4s ease-in-out infinite alternate;
        }
        .motion-sway-b {
          transform-origin: bottom right;
          animation: floralSwayB 6.3s ease-in-out infinite alternate;
        }
        .motion-sway-c {
          transform-origin: bottom center;
          animation: floralSwayC 7.5s ease-in-out infinite alternate;
        }
      `}</style>

      {/* DESKTOP AMBIENT VINTAGE BACKDROP FLANKING THE PHONE STAGE */}
      {!embedded && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 hidden overflow-hidden md:block"
        >
          <img
            src="/demo/motion/pendopo-sky.webp"
            alt=""
            loading="eager"
            className="h-full w-full scale-105 object-cover object-bottom opacity-35 blur-[2px]"
          />
          <div className="absolute inset-0 bg-[#E6DEC9]/60" />

          {/* Left ambient vintage flora & ivory wayang */}
          <img
            src="/demo/motion/floral-tree-side.webp"
            alt=""
            className="motion-sway-a absolute -left-8 top-0 h-[56vh] w-auto object-contain opacity-85"
          />
          <img
            src="/demo/motion/banana-leaves.webp"
            alt=""
            className="motion-sway-a absolute -bottom-10 -left-10 h-[44vh] w-auto object-contain opacity-90"
          />
          <img
            src="/demo/motion/wayang-left.webp"
            alt=""
            className="motion-sway-c absolute bottom-16 left-6 h-[34vh] w-auto object-contain opacity-90"
          />
          <img
            src="/demo/motion/floral-bottom-garland.webp"
            alt=""
            className="absolute -bottom-6 left-0 w-[34vw] max-w-[460px] object-contain opacity-95"
          />

          {/* Right ambient vintage flora & mahogany wayang */}
          <div className="motion-sway-b absolute -right-8 top-0 h-[56vh]">
            <img
              src="/demo/motion/floral-tree-side.webp"
              alt=""
              className="h-full w-auto -scale-x-100 object-contain opacity-85"
            />
          </div>
          <div className="motion-sway-b absolute -bottom-10 -right-10 h-[44vh]">
            <img
              src="/demo/motion/banana-leaves.webp"
              alt=""
              className="h-full w-auto -scale-x-100 object-contain opacity-90"
            />
          </div>
          <img
            src="/demo/motion/wayang-right.webp"
            alt=""
            className="motion-sway-c absolute bottom-16 right-6 h-[34vh] w-auto object-contain opacity-90"
          />
          <img
            src="/demo/motion/floral-bottom-garland.webp"
            alt=""
            className="absolute -bottom-6 right-0 w-[34vw] max-w-[460px] -scale-x-100 object-contain opacity-95"
          />
        </div>
      )}

      {/* Music Player */}
      <MusicPlayer
        track={site.musicTrack}
        autoPlayTrigger={isOpen}
        className={embedded ? "bottom-16 right-3" : "bottom-20 right-4 z-50"}
      />

      {/* STAGE-SCOPED COVER GATE (!isOpen) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.section
            key="cover-gate"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.75, ease: CINEMATIC_EASE } }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#D9D0BE]/55 backdrop-blur-[2px]"
          >
            <div className="relative flex h-full w-full max-w-[430px] flex-col items-center justify-center overflow-hidden bg-[#EFE8D9] px-6 py-8 shadow-2xl md:border-x md:border-[#C8AB78]">
              <KawungWatermarkSvg className="pointer-events-none absolute inset-0 h-full w-full opacity-30" />

              {/* Lush Edge-to-Edge Watercolor Cover Florals */}
              <img
                src="/demo/motion/floral-tree-side.webp"
                alt=""
                loading="eager"
                className="motion-sway-a pointer-events-none absolute -left-8 -top-6 z-10 w-[56%] max-w-[235px] object-contain"
              />
              <div className="motion-sway-b pointer-events-none absolute -right-8 -top-6 z-10 w-[56%] max-w-[235px]">
                <img
                  src="/demo/motion/floral-tree-side.webp"
                  alt=""
                  loading="eager"
                  className="w-full -scale-x-100 object-contain"
                />
              </div>
              <img
                src="/demo/motion/banana-leaves.webp"
                alt=""
                loading="eager"
                className="motion-sway-a pointer-events-none absolute bottom-10 -left-14 z-10 w-[58%] object-contain opacity-90"
              />
              <div className="motion-sway-b pointer-events-none absolute bottom-10 -right-14 z-10 w-[58%] opacity-90">
                <img
                  src="/demo/motion/banana-leaves.webp"
                  alt=""
                  loading="eager"
                  className="w-full -scale-x-100 object-contain"
                />
              </div>
              <img
                src="/demo/motion/floral-bottom-garland.webp"
                alt=""
                loading="eager"
                className="motion-sway-c pointer-events-none absolute -bottom-2 left-1/2 z-20 w-[112%] -translate-x-1/2 object-contain"
              />

              {/* Delicate Double-Gold Arch Card */}
              <motion.div
                initial={shouldReduceMotion ? false : { y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.75, ease: CINEMATIC_EASE }}
                className="relative z-10 mb-14 flex w-full max-w-[310px] flex-col items-center rounded-t-[190px] rounded-b-[2rem] border border-[#C8AB78] bg-[#F7F1E4]/95 px-6 pt-8 pb-9 text-center shadow-xl"
              >
                <div className="pointer-events-none absolute inset-2 rounded-t-[182px] rounded-b-[1.6rem] border border-[#C8AB78]/60" />

                <div className="relative h-48 w-36 overflow-hidden rounded-t-full rounded-b-2xl border-2 border-[#C8AB78] bg-[#E5D8C1] p-1 shadow-md">
                  <img
                    src={coverPortrait}
                    alt={`${data.bride.nickname} & ${data.groom.nickname}`}
                    loading="eager"
                    className="h-full w-full rounded-t-full rounded-b-xl object-cover"
                  />
                </div>

                <p className="mt-5 text-[10px] font-semibold tracking-[0.28em] text-[#7A1C2C] uppercase">
                  Wedding Invitation
                </p>
                <h1 className="mt-2 font-[family-name:var(--font-cormorant)] text-4xl font-semibold italic tracking-wide text-[#4A0E19]">
                  {data.bride.nickname} &amp; {data.groom.nickname}
                </h1>

                <div className="mt-4 w-full rounded-xl border border-[#DFCFB6] bg-[#EFE7D8]/85 px-3 py-2.5">
                  <p className="text-[11px] text-[#6E4F45]">
                    Kepada Bapak/Ibu/Saudara/i :
                  </p>
                  <p className="mt-0.5 font-[family-name:var(--font-cormorant)] text-xl font-semibold text-[#4A0E19]">
                    {guestName}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={triggerEntrance}
                  className="relative z-20 mt-5 inline-flex items-center gap-2 rounded-full bg-[#681624] px-6 py-2.5 text-xs font-semibold tracking-wide text-white shadow-lg transition hover:bg-[#4F101B] active:scale-95"
                >
                  <DoorOpen size={16} weight="fill" />
                  Buka Undangan
                </button>
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* STAGE-SCOPED 0s -> 2.9s THROUGH-THE-GARDEN FLORAL CURTAIN SWEEP */}
      <AnimatePresence>
        {isGateVisible && !shouldReduceMotion && (
          <div
            key={`floral-gate-${gateBurstKey}`}
            className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center"
          >
            <div className="relative h-full w-full max-w-[430px] overflow-hidden">
              {/* Top floral valance lifting upward */}
              <motion.img
                src="/demo/motion/floral-bottom-garland.webp"
                alt=""
                loading="eager"
                initial={{ y: "6%", scale: 1.35, rotate: 180, opacity: 1 }}
                animate={{ y: "-125%", scale: 1.65, rotate: 180, opacity: 0 }}
                transition={{ duration: 2.6, ease: CURTAIN_EASE }}
                className="absolute -top-6 left-1/2 w-[145%] -translate-x-1/2 object-contain"
              />

              {/* Mid-level overhanging bougainvillea covering center-left & center-right */}
              <motion.img
                src="/demo/motion/floral-tree-side.webp"
                alt=""
                loading="eager"
                initial={{ x: "18%", y: "4%", scale: 1.32, opacity: 1 }}
                animate={{ x: "-118%", y: "26%", scale: 2.05, opacity: 0 }}
                transition={{ duration: 2.8, ease: CURTAIN_EASE }}
                className="absolute left-0 top-12 w-[92%] object-contain"
              />
              <motion.img
                src="/demo/motion/floral-tree-side.webp"
                alt=""
                loading="eager"
                initial={{ x: "-18%", y: "4%", scaleX: -1.32, scaleY: 1.32, opacity: 1 }}
                animate={{ x: "118%", y: "26%", scaleX: -2.05, scaleY: 2.05, opacity: 0 }}
                transition={{ duration: 2.8, ease: CURTAIN_EASE }}
                className="absolute right-0 top-12 w-[92%] object-contain"
              />

              {/* Foreground giant banana leaves crossing center then sweeping past camera */}
              <motion.img
                src="/demo/motion/banana-leaves.webp"
                alt=""
                loading="eager"
                initial={{ x: "22%", y: "-6%", scale: 1.35, opacity: 1 }}
                animate={{ x: "-125%", y: "62%", scale: 2.2, opacity: 0 }}
                transition={{ duration: 2.5, ease: CURTAIN_EASE }}
                className="absolute bottom-14 left-0 w-[92%] object-contain"
              />
              <motion.img
                src="/demo/motion/banana-leaves.webp"
                alt=""
                loading="eager"
                initial={{ x: "-22%", y: "-6%", scaleX: -1.35, scaleY: 1.35, opacity: 1 }}
                animate={{ x: "125%", y: "62%", scaleX: -2.2, scaleY: 2.2, opacity: 0 }}
                transition={{ duration: 2.5, ease: CURTAIN_EASE }}
                className="absolute bottom-14 right-0 w-[92%] object-contain"
              />

              {/* Lower floral garland dipping down & zooming past */}
              <motion.img
                src="/demo/motion/floral-bottom-garland.webp"
                alt=""
                loading="eager"
                initial={{ y: "-12%", scale: 1.32, opacity: 1 }}
                animate={{ y: "98%", scale: 2.1, opacity: 0 }}
                transition={{ duration: 2.7, ease: CURTAIN_EASE }}
                className="absolute bottom-0 left-1/2 w-[145%] -translate-x-1/2 object-contain"
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* CENTERED MOBILE-FIRST INVITATION CANVAS */}
      <div
        className={cn(
          "relative z-10 mx-auto max-w-[430px] bg-[#52121D] pb-24 shadow-2xl md:my-6 md:rounded-[2rem] md:border md:border-[#C8AB78]/60",
          !isOpen && "h-[100dvh] overflow-hidden pb-0 md:my-0 md:rounded-none"
        )}
      >
        {/* SECTION 1: 10-SECOND CHOREOGRAPHED PENDOPO HERO STAGE */}
        <section
          id="hero"
          className="relative flex min-h-[92vh] flex-col items-center justify-between overflow-hidden bg-[#E6DEC9] px-5 pt-12 pb-12 text-center md:rounded-t-[2rem]"
        >
          {/* Stage 1 (0.2s -> 4.6s): Watercolor Joglo Pendopo Camera Pull-Back */}
          <motion.div
            key={`pendopo-${gateBurstKey}`}
            initial={shouldReduceMotion ? false : { scale: 1.55, y: "14%" }}
            animate={{ scale: 1, y: "0%" }}
            transition={{ duration: 4.4, delay: 0.2, ease: CINEMATIC_EASE }}
            className="pointer-events-none absolute inset-0"
          >
            <img
              src="/demo/motion/pendopo-sky.webp"
              alt="Pendopo Joglo Nusantara"
              loading="eager"
              className="h-full w-full object-cover object-bottom"
            />
          </motion.div>

          {/* Drifting Cloud Mist */}
          {!shouldReduceMotion && (
            <motion.div
              animate={{ x: [-26, 26, -26] }}
              transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", type: "tween" }}
              className="pointer-events-none absolute inset-x-0 top-10 h-44 bg-[radial-gradient(ellipse_at_center,rgba(255,252,244,0.68)_0%,transparent_72%)]"
            />
          )}

          {/* Stage 3 (3.2s -> 5.2s): Batik Kawung Upper Sky Fade-In */}
          <motion.div
            key={`kawung-${gateBurstKey}`}
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 0.25 }}
            transition={{ duration: 2.0, delay: 3.2 }}
            className="pointer-events-none absolute inset-x-0 top-0 h-72"
          >
            <KawungWatermarkSvg className="h-full w-full" />
          </motion.div>

          {/* Stage 2a (1.4s -> 4.2s): 3 Watercolor Butterflies Fluttering Above Joglo Roof (below typography!) */}
          {!shouldReduceMotion && (
            <>
              <motion.div
                key={`bf-1-${gateBurstKey}`}
                initial={{ x: -30, y: 80, opacity: 0 }}
                animate={{
                  x: [0, 38, 12, -22, 0],
                  y: [0, -24, -44, -14, 0],
                  opacity: [0, 1, 1, 1, 1],
                }}
                transition={{
                  duration: 10,
                  delay: 1.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  type: "tween",
                }}
                className="pointer-events-none absolute left-[18%] top-[53%] z-20"
              >
                <WatercolorButterfly className="h-9 w-9" flapSeconds={0.28} />
              </motion.div>

              <motion.div
                key={`bf-2-${gateBurstKey}`}
                initial={{ x: 40, y: 70, opacity: 0 }}
                animate={{
                  x: [0, -34, -8, 24, 0],
                  y: [0, -20, -40, -12, 0],
                  opacity: [0, 1, 1, 1, 1],
                }}
                transition={{
                  duration: 12,
                  delay: 2.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  type: "tween",
                }}
                className="pointer-events-none absolute right-[16%] top-[56%] z-20"
              >
                <WatercolorButterfly className="h-8 w-8" flapSeconds={0.34} />
              </motion.div>

              <motion.div
                key={`bf-3-${gateBurstKey}`}
                initial={{ y: 60, opacity: 0 }}
                animate={{
                  x: [0, 22, -16, 10, 0],
                  y: [0, -22, -42, -16, 0],
                  opacity: [0, 0.9, 0.9, 0.9, 0.9],
                }}
                transition={{
                  duration: 13.5,
                  delay: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  type: "tween",
                }}
                className="pointer-events-none absolute left-[46%] top-[50%] z-20"
              >
                <WatercolorButterfly className="h-6 w-6" flapSeconds={0.38} />
              </motion.div>
            </>
          )}

          {/* Stage 2b (1.8s -> 4.4s): Overhanging Watercolor Tree Canopy & Banana Leaves */}
          <motion.div
            key={`tree-l-${gateBurstKey}`}
            initial={shouldReduceMotion ? false : { x: -75, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 2.1, delay: 1.8, ease: CINEMATIC_EASE }}
            className="pointer-events-none absolute -left-8 -top-4 z-10 w-[50%]"
          >
            <img
              src="/demo/motion/floral-tree-side.webp"
              alt=""
              loading="eager"
              className="motion-sway-a w-full object-contain"
            />
          </motion.div>

          <motion.div
            key={`tree-r-${gateBurstKey}`}
            initial={shouldReduceMotion ? false : { x: 75, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 2.1, delay: 1.8, ease: CINEMATIC_EASE }}
            className="pointer-events-none absolute -right-8 -top-4 z-10 w-[50%]"
          >
            <div className="motion-sway-b w-full">
              <img
                src="/demo/motion/floral-tree-side.webp"
                alt=""
                loading="eager"
                className="w-full -scale-x-100 object-contain"
              />
            </div>
          </motion.div>

          <motion.div
            key={`leaf-l-${gateBurstKey}`}
            initial={shouldReduceMotion ? false : { x: -65, y: 35, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 0.95 }}
            transition={{ duration: 2.0, delay: 2.2, ease: CINEMATIC_EASE }}
            className="pointer-events-none absolute bottom-12 -left-14 z-10 w-[52%]"
          >
            <img
              src="/demo/motion/banana-leaves.webp"
              alt=""
              loading="eager"
              className="motion-sway-a w-full object-contain"
            />
          </motion.div>

          <motion.div
            key={`leaf-r-${gateBurstKey}`}
            initial={shouldReduceMotion ? false : { x: 65, y: 35, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 0.95 }}
            transition={{ duration: 2.0, delay: 2.2, ease: CINEMATIC_EASE }}
            className="pointer-events-none absolute bottom-12 -right-14 z-10 w-[52%]"
          >
            <div className="motion-sway-b w-full">
              <img
                src="/demo/motion/banana-leaves.webp"
                alt=""
                loading="eager"
                className="w-full -scale-x-100 object-contain"
              />
            </div>
          </motion.div>

          {/* Stage 3b (3.4s -> 5.6s): Wayang Kulit Procession Behind Bottom Garland */}
          <motion.div
            key={`wayang-l-${gateBurstKey}`}
            initial={shouldReduceMotion ? false : { x: -95, opacity: 0 }}
            animate={{ x: 0, opacity: 0.96 }}
            transition={{ duration: 2.1, delay: 3.4, ease: CINEMATIC_EASE }}
            className="pointer-events-none absolute bottom-16 -left-6 z-10 w-[33%]"
          >
            <img
              src="/demo/motion/wayang-left.webp"
              alt=""
              loading="eager"
              className="motion-sway-c w-full object-contain"
            />
          </motion.div>

          <motion.div
            key={`wayang-r-${gateBurstKey}`}
            initial={shouldReduceMotion ? false : { x: 95, opacity: 0 }}
            animate={{ x: 0, opacity: 0.96 }}
            transition={{ duration: 2.1, delay: 3.4, ease: CINEMATIC_EASE }}
            className="pointer-events-none absolute bottom-16 -right-6 z-10 w-[33%]"
          >
            <img
              src="/demo/motion/wayang-right.webp"
              alt=""
              loading="eager"
              className="motion-sway-c w-full object-contain"
            />
          </motion.div>

          {/* Stage 2c (2.5s -> 4.5s): Full-Width Bottom Floral Garland Border */}
          <motion.div
            key={`garland-bot-${gateBurstKey}`}
            initial={shouldReduceMotion ? false : { y: 75, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 2.0, delay: 2.5, ease: CINEMATIC_EASE }}
            className="pointer-events-none absolute -bottom-2 left-1/2 z-20 w-[112%] -translate-x-1/2"
          >
            <img
              src="/demo/motion/floral-bottom-garland.webp"
              alt=""
              loading="eager"
              className="motion-sway-c w-full object-contain"
            />
          </motion.div>

          {/* Replay Entrance Button */}
          <div className="relative z-30 flex w-full justify-end">
            {isOpen && (
              <button
                type="button"
                onClick={triggerEntrance}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#7A1C2C]/30 bg-[#FAF5EC]/90 px-3 py-1.5 text-[11px] font-medium text-[#7A1C2C] shadow-sm backdrop-blur-sm transition hover:bg-white"
              >
                <Play size={12} weight="fill" />
                Putar Ulang Animasi
              </button>
            )}
          </div>

          {/* Stage 4 (4.2s -> 7.0s): Line-by-Line Stately Typography in Open Upper Sky */}
          <div className="relative z-20 mt-4 mb-auto flex flex-col items-center px-4 pt-2">
            <motion.p
              key={`t-sub-${gateBurstKey}`}
              initial={shouldReduceMotion ? false : { y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, delay: 4.2, ease: CINEMATIC_EASE }}
              className="text-[11px] font-semibold tracking-[0.3em] text-[#681624] uppercase"
            >
              The Wedding Of
            </motion.p>

            <motion.h2
              key={`t-bride-${gateBurstKey}`}
              initial={shouldReduceMotion ? false : { y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.0, delay: 4.7, ease: CINEMATIC_EASE }}
              className="mt-3 font-[family-name:var(--font-cormorant)] text-[2.75rem] font-semibold italic leading-none text-[#4A0E19]"
            >
              {data.bride.nickname}
            </motion.h2>

            <motion.span
              key={`t-amp-${gateBurstKey}`}
              initial={shouldReduceMotion ? false : { scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 5.05, ease: CINEMATIC_EASE }}
              className="my-1 font-[family-name:var(--font-cormorant)] text-2xl font-medium text-[#8E6A34]"
            >
              &amp;
            </motion.span>

            <motion.h2
              key={`t-groom-${gateBurstKey}`}
              initial={shouldReduceMotion ? false : { y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.0, delay: 5.3, ease: CINEMATIC_EASE }}
              className="font-[family-name:var(--font-cormorant)] text-[2.75rem] font-semibold italic leading-none text-[#4A0E19]"
            >
              {data.groom.nickname}
            </motion.h2>

            <motion.p
              key={`t-date-${gateBurstKey}`}
              initial={shouldReduceMotion ? false : { y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, delay: 5.8, ease: CINEMATIC_EASE }}
              className="mt-4 rounded-full border border-[#C6A77D] bg-[#FAF5EC]/90 px-4 py-1 text-[11px] font-medium tracking-[0.2em] text-[#5E3A2E]"
            >
              {data.akad.dateLabel}
            </motion.p>

            <motion.a
              href="#mempelai"
              key={`t-cue-${gateBurstKey}`}
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 0.9, delay: 6.4 }}
              className="mt-4 inline-flex items-center gap-1 text-[10px] font-medium tracking-widest text-[#681624] uppercase hover:opacity-100"
            >
              Scroll ke bawah
              <CaretDown size={12} />
            </motion.a>
          </div>

          <div className="relative z-20 h-40" />
        </section>

        {/* SECTION 2: FEATURE PORTRAIT + BLESSING QUOTE */}
        <motion.section
          initial={shouldReduceMotion ? false : { y: 24, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: 0.7, ease: CINEMATIC_EASE }}
          className="relative mx-4 mt-6 overflow-hidden rounded-3xl border border-[#C8AB78]/45 bg-[#EFE7D8] p-4 text-center shadow-lg"
        >
          <div className="overflow-hidden rounded-2xl border border-[#C8AB78]/50">
            <img
              src={featurePortrait}
              alt={`${data.bride.nickname} & ${data.groom.nickname}`}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div className="px-2 pt-5 pb-3">
            <p className="font-[family-name:var(--font-cormorant)] text-base italic leading-relaxed text-[#4A0E19]">
              &ldquo;{data.blessingQuote.text}&rdquo;
            </p>
            <p className="mt-3 text-[11px] font-semibold tracking-[0.2em] text-[#7A1C2C] uppercase">
              {data.blessingQuote.source}
            </p>
          </div>
        </motion.section>

        {/* SECTION 3: BRIDE & GROOM PARCHMENT ARCH PANEL */}
        <section id="mempelai" className="px-4 pt-8">
          <div className="relative overflow-hidden rounded-t-[190px] rounded-b-3xl border border-[#C8AB78] bg-[#EFE7D8] px-5 pt-36 pb-8 text-center shadow-lg">
            <img
              src="/demo/motion/floral-bottom-garland.webp"
              alt=""
              className="pointer-events-none absolute -top-2 left-1/2 w-[104%] -translate-x-1/2 rotate-180 object-contain opacity-95"
            />

            <p className="relative z-10 text-[11px] font-semibold tracking-[0.26em] text-[#7A1C2C] uppercase">
              Bride &amp; Groom
            </p>
            <p className="relative z-10 mt-2 text-xs leading-relaxed text-[#5E3A2E]">
              {data.culturalNote}
            </p>

            <div className="relative z-10 mt-7 space-y-6">
              {[
                { role: "Mempelai Putri", person: data.bride },
                { role: "Mempelai Putra", person: data.groom },
              ].map((item, idx) => (
                <motion.div
                  key={item.role}
                  initial={shouldReduceMotion ? false : { y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={VIEWPORT_ONCE}
                  transition={{ duration: 0.65, delay: idx * 0.1, ease: CINEMATIC_EASE }}
                  className="rounded-3xl border border-[#DFCFB6] bg-[#FAF5EC] px-5 py-6 shadow-sm"
                >
                  <div className="mx-auto h-44 w-34 overflow-hidden rounded-t-full rounded-b-xl border-2 border-[#C8AB78] bg-[#EFE5D4] p-1">
                    <img
                      src={item.person.photoUrl}
                      alt={item.person.fullName}
                      className="h-full w-full rounded-t-full rounded-b-lg object-cover"
                    />
                  </div>
                  <p className="mt-4 text-[10px] font-semibold tracking-[0.22em] text-[#9E783B] uppercase">
                    {item.role}
                  </p>
                  <h3 className="mt-1 font-[family-name:var(--font-cormorant)] text-2xl font-semibold italic text-[#4A0E19]">
                    {item.person.fullName}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#6E4F45]">
                    {item.person.parents}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4: SAVE THE DATE & COUNTDOWN */}
        <motion.section
          initial={shouldReduceMotion ? false : { y: 22, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: 0.65, ease: CINEMATIC_EASE }}
          className="relative mx-4 mt-8 overflow-hidden rounded-3xl border border-[#C8AB78]/50 bg-[#3B0B14] text-center text-white shadow-lg"
        >
          <div className="relative h-56 overflow-hidden">
            <img
              src={saveDatePhoto}
              alt="Save The Date"
              className="h-full w-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3B0B14] via-[#3B0B14]/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-3 px-4">
              <p className="text-[10px] font-semibold tracking-[0.28em] text-[#E6C58B] uppercase">
                Save The Date
              </p>
              <h3 className="mt-1 font-[family-name:var(--font-cormorant)] text-3xl italic">
                Menuju Hari Bahagia
              </h3>
            </div>
          </div>

          <div className="px-5 pt-3 pb-7">
            {countdown.isPast ? (
              <p className="rounded-xl bg-white/10 py-3 text-sm font-medium text-[#F7E8EC]">
                Acara Pernikahan Telah Berlangsung
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Hari", value: padTwo(countdown.days) },
                  { label: "Jam", value: padTwo(countdown.hours) },
                  { label: "Menit", value: padTwo(countdown.minutes) },
                  { label: "Detik", value: padTwo(countdown.seconds) },
                ].map((unit) => (
                  <div
                    key={unit.label}
                    className="rounded-2xl border border-[#C8AB78]/40 bg-white/10 py-3"
                  >
                    <p className="font-[family-name:var(--font-cormorant)] text-2xl font-bold tabular-nums">
                      {unit.value}
                    </p>
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
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#EFE7D8] px-5 py-2.5 text-xs font-semibold text-[#52121D] shadow transition hover:bg-white"
            >
              <CalendarPlus size={16} weight="bold" />
              Simpan ke Google Calendar
            </a>
          </div>
        </motion.section>

        {/* SECTION 5: AKAD & RESEPSI ARCH CARDS */}
        <section id="acara" className="px-4 pt-10">
          <div className="text-center">
            <p className="text-[11px] font-semibold tracking-[0.26em] text-[#E6C58B] uppercase">
              Rangkaian Acara
            </p>
            <h3 className="mt-1 font-[family-name:var(--font-cormorant)] text-3xl italic text-[#FAF5EC]">
              Akad Nikah &amp; Resepsi
            </h3>
          </div>

          <div className="mt-6 space-y-6">
            {[
              { title: "Akad Nikah", event: data.akad },
              { title: "Resepsi Pernikahan", event: data.resepsi },
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                initial={shouldReduceMotion ? false : { y: 22, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={VIEWPORT_ONCE}
                transition={{ duration: 0.65, delay: idx * 0.1, ease: CINEMATIC_EASE }}
                className="relative overflow-hidden rounded-t-[170px] rounded-b-3xl border border-[#C8AB78] bg-[#EFE7D8] px-6 pt-40 pb-44 text-center text-[#3B1F1E] shadow-lg"
              >
                <img
                  src="/demo/motion/floral-bottom-garland.webp"
                  alt=""
                  className="pointer-events-none absolute -top-2 left-1/2 w-[104%] -translate-x-1/2 rotate-180 object-contain opacity-95"
                />
                <img
                  src="/demo/motion/floral-bottom-garland.webp"
                  alt=""
                  className="pointer-events-none absolute -bottom-2 left-1/2 w-[104%] -translate-x-1/2 object-contain opacity-95"
                />

                <div className="relative z-10">
                  <h4 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold italic text-[#4A0E19]">
                    {item.title}
                  </h4>
                  <div className="mt-4 space-y-2 text-xs">
                    <p className="inline-flex items-center justify-center gap-1.5 font-semibold text-[#681624]">
                      <CalendarHeart size={15} weight="fill" />
                      {item.event.dateLabel}
                    </p>
                    <p className="flex items-center justify-center gap-1.5 text-[#5E3A2E]">
                      <Clock size={15} />
                      {item.event.timeLabel}
                    </p>
                    <p className="pt-2 font-semibold text-[#4A0E19]">
                      {item.event.venueName}
                    </p>
                    <p className="mx-auto max-w-xs leading-relaxed text-[#6E4F45]">
                      {item.event.address}
                    </p>
                  </div>

                  <a
                    href={item.event.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#681624] px-5 py-2 text-xs font-semibold text-white shadow transition hover:bg-[#4A0E19]"
                  >
                    <MapPin size={14} weight="fill" />
                    Petunjuk Lokasi
                    <ArrowSquareOut size={13} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          {data.ceremonyExtras && data.ceremonyExtras.length > 0 && (
            <div className="mt-5 rounded-3xl border border-[#C8AB78]/45 bg-[#3B0B14] px-5 py-5 text-center text-[#FAF5EC]">
              {data.ceremonyExtras.map((extra) => (
                <div key={extra.label} className="py-1.5">
                  <p className="text-[11px] font-semibold tracking-[0.2em] text-[#E6C58B] uppercase">
                    {extra.label}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#F3D6DB]">
                    {extra.detail}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION 6: LOVE STORY */}
        {data.storyTimeline.length > 0 && (
          <section className="px-4 pt-10">
            <div className="rounded-3xl border border-[#C8AB78] bg-[#EFE7D8] px-5 py-7 shadow-lg">
              <div className="text-center">
                <p className="text-[11px] font-semibold tracking-[0.24em] text-[#7A1C2C] uppercase">
                  Love Story
                </p>
                <h3 className="mt-1 font-[family-name:var(--font-cormorant)] text-3xl italic text-[#4A0E19]">
                  Perjalanan Cinta Kami
                </h3>
              </div>

              <div className="mt-6 space-y-5 border-l-2 border-[#C8AB78] pl-5">
                {data.storyTimeline.map((story) => (
                  <div key={`${story.year}-${story.title}`} className="relative">
                    <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-[#EFE7D8] bg-[#7A1C2C]" />
                    <p className="text-[11px] font-bold tracking-wider text-[#9E783B]">
                      {story.year}
                    </p>
                    <h4 className="font-[family-name:var(--font-cormorant)] text-lg font-semibold text-[#4A0E19]">
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
              <p className="text-[11px] font-semibold tracking-[0.24em] text-[#E6C58B] uppercase">
                Gallery
              </p>
              <h3 className="mt-1 font-[family-name:var(--font-cormorant)] text-3xl italic text-[#FAF5EC]">
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
                    "group relative overflow-hidden rounded-2xl border border-[#C8AB78]/60 bg-[#3B0B14]",
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

        {/* SECTION 8: RSVP & YOUR WISH */}
        <section id="rsvp" className="px-4 pt-10">
          <div className="relative overflow-hidden rounded-3xl border border-[#C8AB78] bg-[#EFE7D8] px-5 py-7 shadow-lg">
            <div className="text-center">
              <p className="text-[11px] font-semibold tracking-[0.24em] text-[#7A1C2C] uppercase">
                Konfirmasi Kehadiran
              </p>
              <h3 className="mt-1 font-[family-name:var(--font-cormorant)] text-3xl italic text-[#4A0E19]">
                RSVP &amp; Your Wish
              </h3>
            </div>

            <form onSubmit={handleWishSubmit} className="mt-5 space-y-3 text-left">
              <div>
                <label className="text-xs font-semibold text-[#5E3A2E]">
                  Nama Tamu
                </label>
                <input
                  type="text"
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  placeholder={guestName}
                  className="mt-1 w-full rounded-xl border border-[#C8AB78]/70 bg-[#FAF5EC] px-3.5 py-2.5 text-sm text-[#3B1F1E] outline-none focus:border-[#7A1C2C]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#5E3A2E]">
                  Konfirmasi
                </label>
                <select
                  value={rsvpStatus}
                  onChange={(e) => setRsvpStatus(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#C8AB78]/70 bg-[#FAF5EC] px-3.5 py-2.5 text-sm text-[#3B1F1E] outline-none focus:border-[#7A1C2C]"
                >
                  <option value="Hadir, 1 Orang">Hadir, 1 Orang</option>
                  <option value="Hadir, 2 Orang">Hadir, 2 Orang</option>
                  <option value="Tidak Hadir">Maaf, Tidak Hadir</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#5E3A2E]">
                  Doa &amp; Ucapan
                </label>
                <textarea
                  rows={3}
                  value={rsvpMessage}
                  onChange={(e) => setRsvpMessage(e.target.value)}
                  placeholder="Tulis doa terbaik untuk kedua mempelai..."
                  className="mt-1 w-full rounded-xl border border-[#C8AB78]/70 bg-[#FAF5EC] px-3.5 py-2.5 text-sm text-[#3B1F1E] outline-none focus:border-[#7A1C2C]"
                />
              </div>

              <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                <button
                  type="submit"
                  className="flex-1 rounded-full bg-[#681624] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#4A0E19]"
                >
                  Kirim Ucapan
                </button>
                <a
                  href={whatsappRsvpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[#681624] px-4 py-2.5 text-xs font-semibold text-[#681624] transition hover:bg-[#681624]/5"
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
                  className="rounded-2xl border border-[#DFCFB6] bg-[#FAF5EC] px-4 py-3 text-left"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-[#4A0E19]">{w.name}</p>
                    <span className="text-[10px] font-medium text-[#7A1C2C]">
                      {w.relation}
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

        {/* SECTION 9: WEDDING GIFT & DRESSCODE */}
        {(data.digitalEnvelopes.length > 0 || data.giftAddress || data.dresscode) && (
          <section className="px-4 pt-10 space-y-6">
            {(data.digitalEnvelopes.length > 0 || data.giftAddress) && (
              <div className="rounded-3xl border border-[#C8AB78] bg-[#EFE7D8] px-5 py-7 text-center shadow-lg">
                <Gift size={28} className="mx-auto text-[#7A1C2C]" weight="duotone" />
                <h3 className="mt-2 font-[family-name:var(--font-cormorant)] text-3xl italic text-[#4A0E19]">
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
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#681624] px-4 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#4A0E19]"
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

                {data.giftAddress && (
                  <div className="mt-4 rounded-2xl border border-[#DFCFB6] bg-[#FAF5EC] p-4 text-center">
                    <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A1C2C]">
                      <Package size={15} weight="duotone" />
                      Kirim Kado Fisik
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[#4A0E19]">
                      {data.giftAddress.recipient}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-[#6E4F45]">
                      {data.giftAddress.address}
                    </p>
                  </div>
                )}
              </div>
            )}

            {data.dresscode && (
              <div className="rounded-3xl border border-[#C8AB78]/45 bg-[#3B0B14] px-5 py-6 text-center text-[#FAF5EC]">
                <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.22em] text-[#E6C58B] uppercase">
                  <Palette size={15} />
                  Dresscode Tamu
                </p>
                <p className="mt-2 text-xs leading-relaxed text-[#F3D6DB]">
                  {data.dresscode.note}
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  {data.dresscode.colors.map((c) => (
                    <div key={c.label} className="flex items-center gap-2 text-xs">
                      <span
                        className="h-5 w-5 rounded-full border border-white/40"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* CLOSING ARCH PORTRAIT */}
        <footer className="relative mt-10 overflow-hidden px-4 pb-6 pt-4 text-center">
          <div className="relative overflow-hidden rounded-3xl border border-[#C8AB78] bg-[#EFE7D8] px-6 pt-8 pb-44 text-[#3B1F1E] shadow-lg">
            <div className="mx-auto h-52 w-40 overflow-hidden rounded-t-full rounded-b-2xl border-2 border-[#C8AB78] bg-[#E5D8C1] p-1 shadow-md">
              <img
                src={closingPortrait}
                alt={`${data.bride.nickname} & ${data.groom.nickname}`}
                className="h-full w-full rounded-t-full rounded-b-xl object-cover"
              />
            </div>
            <p className="mt-5 text-xs leading-relaxed text-[#6E4F45]">
              Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
            </p>
            <p className="mt-4 font-[family-name:var(--font-cormorant)] text-3xl italic font-semibold text-[#4A0E19]">
              {data.bride.nickname} &amp; {data.groom.nickname}
            </p>

            <img
              src="/demo/motion/floral-bottom-garland.webp"
              alt=""
              className="pointer-events-none absolute -bottom-2 left-1/2 w-[108%] -translate-x-1/2 object-contain opacity-95"
            />
          </div>
        </footer>
      </div>

      {/* STICKY BOTTOM NAVIGATION */}
      {isOpen && (
        <nav
          aria-label="Navigasi Undangan"
          className={cn(
            "fixed bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full border border-[#C8AB78] bg-[#4A0E19]/95 px-3 py-2 text-white shadow-xl backdrop-blur-md",
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

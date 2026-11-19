"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  ArrowSquareOut,
  CalendarHeart,
  CalendarPlus,
  CaretDown,
  CaretUp,
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
  Users,
  WhatsappLogo,
  X,
} from "@phosphor-icons/react";
import { MusicPlayer } from "@/components/MusicPlayer";
import type { NikahSiteConfig } from "@/lib/schema";
import { playSfx, type SfxName } from "@/lib/sfx";
import { buildWhatsAppUrl, cn } from "@/lib/utils";

export type CulturalWatermarkKind =
  | "kawung"
  | "pucuk-rebung"
  | "parang-truntum"
  | "mega-mendung"
  | "botanical-trellis";

export interface NikahMotionTheme {
  id: "minang" | "jawa" | "sunda" | "garden";
  assets: {
    sky: string;
    floralGarland: string;
    floralTree: string;
    leaves: string;
    guardianLeft: string;
    guardianRight: string;
    butterfly: string;
  };
  watermark: CulturalWatermarkKind;
  openSfx: SfxName;
  palette: {
    outerBg: string;
    canvasBg: string;
    darkCardBg: string;
    lightCardBg: string;
    creamSurface: string;
    skyBg: string;
    borderGold: string;
    softBorder: string;
    accent: string;
    accentDark: string;
    headingDark: string;
    bodyDark: string;
    mutedDark: string;
    lightText: string;
    lightAccent: string;
    watermarkStroke: string;
    selectionBg: string;
  };
  labels: {
    coverEyebrow: string;
    openButton: string;
    heroEyebrow: string;
    defaultGuestName: string;
    defaultScrollCue: string;
    continueScrollCue: string;
    brideSectionTitle: string;
    brideRole: string;
    groomRole: string;
    countdownTitle: string;
    eventsEyebrow: string;
    eventsTitle: string;
    akadTitle: string;
    resepsiTitle: string;
    storyEyebrow: string;
    storyTitle: string;
    galleryEyebrow: string;
    galleryTitle: string;
    rsvpEyebrow: string;
    rsvpTitle: string;
    rsvpWaPrefix: string;
    giftTitle: string;
    giftNote: string;
    closingNote: string;
    venueAlt: string;
  };
  guardianSizeClass?: string;
  guardianFlankClass?: string;
}

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
const VIEWPORT_ONCE = { once: true, amount: "some" } as const;
const VIEWPORT_REVEAL = { once: true, amount: 0.3 } as const;

function ParallaxImage({
  src,
  alt,
  className,
  enabled,
}: {
  src: string;
  alt: string;
  className?: string;
  enabled: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-9%", "9%"]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.img
        src={src}
        alt={alt}
        style={enabled ? { y, scale: 1.2 } : undefined}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function useStage(progress: MotionValue<number>, range: [number, number]) {
  return useTransform(progress, range, [0, 1], { clamp: true });
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

function CulturalWatermarkSvg({
  kind,
  stroke,
  className,
}: {
  kind: CulturalWatermarkKind;
  stroke: string;
  className?: string;
}) {
  const patternId = `wm-${kind}`;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 160 160"
      fill="none"
      className={className}
    >
      <defs>
        {kind === "pucuk-rebung" && (
          <pattern id={patternId} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M20 4L34 36H6L20 4Z" stroke={stroke} strokeWidth="0.9" opacity="0.34" />
            <path d="M20 12L28 32H12L20 12Z" stroke={stroke} strokeWidth="0.7" opacity="0.28" />
            <circle cx="20" cy="25" r="2" fill={stroke} opacity="0.32" />
          </pattern>
        )}
        {kind === "parang-truntum" && (
          <pattern id={patternId} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M-4 32C6 18 18 18 24 8C30 -2 38 6 44 -4" stroke={stroke} strokeWidth="1.05" opacity="0.32" />
            <path d="M-4 44C8 30 20 30 28 18C34 8 40 16 46 6" stroke={stroke} strokeWidth="0.8" opacity="0.26" />
            <circle cx="20" cy="20" r="2" fill={stroke} opacity="0.34" />
          </pattern>
        )}
        {kind === "mega-mendung" && (
          <pattern id={patternId} width="48" height="36" patternUnits="userSpaceOnUse">
            <path
              d="M4 24C4 16 12 12 18 16C20 10 30 10 32 16C38 14 44 18 44 24C44 29 38 31 24 31C10 31 4 29 4 24Z"
              stroke={stroke}
              strokeWidth="0.95"
              opacity="0.32"
            />
            <path
              d="M12 24C12 19 18 17 24 19C30 17 36 19 36 24"
              stroke={stroke}
              strokeWidth="0.75"
              opacity="0.24"
            />
          </pattern>
        )}
        {kind === "botanical-trellis" && (
          <pattern id={patternId} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 20L20 0L40 20L20 40Z" stroke={stroke} strokeWidth="0.8" opacity="0.28" />
            <circle cx="20" cy="20" r="4" stroke={stroke} strokeWidth="0.75" opacity="0.25" />
          </pattern>
        )}
        {kind === "kawung" && (
          <pattern id={patternId} width="40" height="40" patternUnits="userSpaceOnUse">
            <ellipse cx="20" cy="10" rx="6" ry="9" stroke={stroke} strokeWidth="0.9" opacity="0.32" />
            <ellipse cx="20" cy="30" rx="6" ry="9" stroke={stroke} strokeWidth="0.9" opacity="0.32" />
            <ellipse cx="10" cy="20" rx="9" ry="6" stroke={stroke} strokeWidth="0.9" opacity="0.32" />
            <ellipse cx="30" cy="20" rx="9" ry="6" stroke={stroke} strokeWidth="0.9" opacity="0.32" />
            <circle cx="20" cy="20" r="1.8" fill={stroke} opacity="0.38" />
          </pattern>
        )}
      </defs>
      <rect width="160" height="160" fill={`url(#${patternId})`} />
    </svg>
  );
}

function WatercolorButterfly({
  src,
  className,
  flapSeconds = 0.32,
}: {
  src: string;
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
        src={src}
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
        src={src}
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

export function NikahMotionShell({
  site,
  theme,
  embedded = false,
}: {
  site: NikahSiteConfig;
  theme: NikahMotionTheme;
  embedded?: boolean;
}) {
  const { data } = site;
  const { assets, palette, labels } = theme;
  const shouldReduceMotion = Boolean(useReducedMotion());

  const [isOpen, setIsOpen] = useState(false);
  const scrub = !shouldReduceMotion && !embedded;

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroRaw } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"],
  });
  const heroProgress = useSpring(heroRaw, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.0005,
  });

  const gateOpen = useStage(heroProgress, [0.02, 0.5]);
  const cueFade = useTransform(heroProgress, [0, 0.08], [1, 0]);
  const portraitFade = useTransform(heroProgress, [0.18, 0.4], [1, 0]);
  const portraitScale = useTransform(heroProgress, [0, 0.4], [1, 0.82]);
  const portraitY = useTransform(heroProgress, [0, 0.4], ["0%", "-12%"]);
  const pendopoScale = useTransform(heroProgress, [0, 0.6], [1.45, 1]);
  const pendopoY = useTransform(heroProgress, [0, 0.6], ["9%", "0%"]);

  const treeLX = useTransform(gateOpen, [0, 1], ["6%", "0%"]);
  const treeRX = useTransform(gateOpen, [0, 1], ["-6%", "0%"]);
  const treeScale = useTransform(gateOpen, [0, 1], [1.38, 1]);
  const leafLX = useTransform(gateOpen, [0, 1], ["4%", "0%"]);
  const leafRX = useTransform(gateOpen, [0, 1], ["-4%", "0%"]);
  const leafY = useTransform(gateOpen, [0, 1], ["-12%", "0%"]);
  const leafScale = useTransform(gateOpen, [0, 1], [1.6, 1]);
  const garlandY = useTransform(gateOpen, [0, 1], ["-14%", "0%"]);
  const garlandScale = useTransform(gateOpen, [0, 1], [1.22, 1]);

  const guardianIn = useStage(heroProgress, [0.42, 0.7]);
  const guardianLX = useTransform(guardianIn, [0, 1], [-80, 0]);
  const guardianRX = useTransform(guardianIn, [0, 1], [80, 0]);
  const skyIn = useStage(heroProgress, [0.45, 0.75]);
  const watermarkOpacity = useTransform(skyIn, [0, 1], [0, 0.25]);

  const subIn = useStage(heroProgress, [0.4, 0.55]);
  const brideIn = useStage(heroProgress, [0.46, 0.62]);
  const ampIn = useStage(heroProgress, [0.52, 0.66]);
  const groomIn = useStage(heroProgress, [0.56, 0.72]);
  const dateIn = useStage(heroProgress, [0.64, 0.8]);
  const subY = useTransform(subIn, [0, 1], [18, 0]);
  const brideY = useTransform(brideIn, [0, 1], [18, 0]);
  const groomY = useTransform(groomIn, [0, 1], [18, 0]);
  const dateY = useTransform(dateIn, [0, 1], [18, 0]);
  const ampScale = useTransform(ampIn, [0, 1], [0.7, 1]);

  const [guestName, setGuestName] = useState(labels.defaultGuestName);
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
            name: "Keluarga Besar",
            relation: "Keluarga",
            message:
              "Selamat menempuh hidup baru, semoga menjadi keluarga sakinah mawaddah warahmah.",
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
    playSfx(theme.openSfx);
    if (!embedded) window.scrollTo({ top: 0 });
    setIsOpen(true);
  }, [embedded, theme.openSfx]);

  const coverPortrait = data.gallery[0] ?? data.bride.photoUrl;
  const featurePortrait = data.gallery[1] ?? data.gallery[0] ?? data.bride.photoUrl;
  const saveDatePhoto = data.gallery[2] ?? data.gallery[0] ?? data.bride.photoUrl;
  const closingPortrait = data.gallery[data.gallery.length - 1] ?? coverPortrait;

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
    playSfx("stamp-claim");
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
    playSfx("chat-pop");
    setWishes((prev) => [
      { name: cleanName, relation: rsvpStatus, message: cleanMsg },
      ...prev,
    ]);
    setRsvpMessage("");
  };

  const whatsappRsvpUrl = useMemo(() => {
    const cleanName = rsvpName.trim() || guestName;
    const msg = `${labels.rsvpWaPrefix} *${cleanName}* ingin konfirmasi kehadiran di pernikahan *${data.bride.nickname} & ${data.groom.nickname}*.\nStatus: *${rsvpStatus}*${
      rsvpMessage.trim() ? `\nUcapan: "${rsvpMessage.trim()}"` : ""
    }`;
    return buildWhatsAppUrl(data.rsvpWhatsapp, msg);
  }, [
    data.bride.nickname,
    data.groom.nickname,
    data.rsvpWhatsapp,
    guestName,
    labels.rsvpWaPrefix,
    rsvpMessage,
    rsvpName,
    rsvpStatus,
  ]);

  const guardianClass = theme.guardianSizeClass ?? "w-[33%]";
  const guardianFlankClass = theme.guardianFlankClass ?? "h-[34vh]";

  return (
    <main
      className="relative min-h-screen w-full overflow-x-clip font-[family-name:var(--font-jakarta)]"
      style={{
        backgroundColor: palette.outerBg,
        color: palette.bodyDark,
      }}
    >
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
        @keyframes cueBob {
          0% { transform: translateY(3px); }
          100% { transform: translateY(-3px); }
        }
        .motion-cue-bob { animation: cueBob 0.9s ease-in-out infinite alternate; }
        @media (prefers-reduced-motion: reduce) {
          .motion-sway-a, .motion-sway-b, .motion-sway-c, .motion-cue-bob { animation: none !important; }
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

      {/* DESKTOP AMBIENT BACKDROP FLANKING THE PHONE STAGE */}
      {!embedded && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 hidden overflow-hidden md:block"
        >
          <img
            src={assets.sky}
            alt=""
            loading="eager"
            className="h-full w-full scale-105 object-cover object-bottom opacity-35 blur-[2px]"
          />
          <div
            className="absolute inset-0 opacity-65"
            style={{ backgroundColor: palette.outerBg }}
          />

          {/* Left ambient flora & cultural guardian */}
          <img
            src={assets.floralTree}
            alt=""
            className="motion-sway-a absolute -left-8 top-0 h-[56vh] w-auto object-contain opacity-85"
          />
          <img
            src={assets.leaves}
            alt=""
            className="motion-sway-a absolute -bottom-10 -left-10 h-[44vh] w-auto object-contain opacity-90"
          />
          <img
            src={assets.guardianLeft}
            alt=""
            className={cn(
              "motion-sway-c absolute bottom-16 left-6 w-auto object-contain opacity-90",
              guardianFlankClass
            )}
          />
          <img
            src={assets.floralGarland}
            alt=""
            className="absolute -bottom-6 left-0 w-[34vw] max-w-[460px] object-contain opacity-95"
          />

          {/* Right ambient flora & cultural guardian */}
          <div className="motion-sway-b absolute -right-8 top-0 h-[56vh]">
            <img
              src={assets.floralTree}
              alt=""
              className="h-full w-auto -scale-x-100 object-contain opacity-85"
            />
          </div>
          <div className="motion-sway-b absolute -bottom-10 -right-10 h-[44vh]">
            <img
              src={assets.leaves}
              alt=""
              className="h-full w-auto -scale-x-100 object-contain opacity-90"
            />
          </div>
          <img
            src={assets.guardianRight}
            alt=""
            className={cn(
              "motion-sway-c absolute bottom-16 right-6 w-auto object-contain opacity-90",
              guardianFlankClass
            )}
          />
          <img
            src={assets.floralGarland}
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
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[2px]"
            style={{ backgroundColor: `${palette.outerBg}88` }}
          >
            <div
              className="relative flex h-full w-full max-w-[430px] flex-col items-center justify-center overflow-hidden px-5 py-6 shadow-2xl md:border-x"
              style={{
                backgroundColor: palette.lightCardBg,
                borderColor: palette.borderGold,
              }}
            >
              <CulturalWatermarkSvg
                kind={theme.watermark}
                stroke={palette.watermarkStroke}
                className="pointer-events-none absolute inset-0 h-full w-full opacity-30"
              />

              {/* Lush Edge-to-Edge Watercolor Cover Florals */}
              <img
                src={assets.floralTree}
                alt=""
                loading="eager"
                className="motion-sway-a pointer-events-none absolute -left-8 -top-6 z-10 w-[56%] max-w-[235px] object-contain"
              />
              <div className="motion-sway-b pointer-events-none absolute -right-8 -top-6 z-10 w-[56%] max-w-[235px]">
                <img
                  src={assets.floralTree}
                  alt=""
                  loading="eager"
                  className="w-full -scale-x-100 object-contain"
                />
              </div>
              <img
                src={assets.leaves}
                alt=""
                loading="eager"
                className="motion-sway-a pointer-events-none absolute bottom-10 -left-14 z-10 w-[58%] object-contain opacity-90"
              />
              <div className="motion-sway-b pointer-events-none absolute bottom-10 -right-14 z-10 w-[58%] opacity-90">
                <img
                  src={assets.leaves}
                  alt=""
                  loading="eager"
                  className="w-full -scale-x-100 object-contain"
                />
              </div>
              <img
                src={assets.floralGarland}
                alt=""
                loading="eager"
                className="motion-sway-c pointer-events-none absolute -bottom-2 left-1/2 z-20 w-[112%] -translate-x-1/2 object-contain"
              />

              {/* Delicate Double-Gold Arch Card */}
              <motion.div
                initial={shouldReduceMotion ? false : { y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.75, ease: CINEMATIC_EASE }}
                className="relative z-10 mb-[6svh] flex w-full max-w-[310px] flex-col items-center rounded-t-[190px] rounded-b-[2rem] border px-5 pt-[min(2rem,4svh)] pb-[min(2.25rem,4.5svh)] text-center shadow-xl"
                style={{
                  borderColor: palette.borderGold,
                  backgroundColor: `${palette.creamSurface}F2`,
                }}
              >
                <div
                  className="pointer-events-none absolute inset-2 rounded-t-[182px] rounded-b-[1.6rem] border opacity-60"
                  style={{ borderColor: palette.borderGold }}
                />

                <div
                  className="relative aspect-[3/4] h-[min(12rem,26svh)] overflow-hidden rounded-t-full rounded-b-2xl border-2 p-1 shadow-md"
                  style={{
                    borderColor: palette.borderGold,
                    backgroundColor: palette.outerBg,
                  }}
                >
                  <img
                    src={coverPortrait}
                    alt={`${data.bride.nickname} & ${data.groom.nickname}`}
                    loading="eager"
                    className="h-full w-full rounded-t-full rounded-b-xl object-cover"
                  />
                </div>

                <p
                  className="mt-5 text-[10px] font-semibold tracking-[0.26em] uppercase"
                  style={{ color: palette.accent }}
                >
                  {labels.coverEyebrow}
                </p>
                <h1
                  className="mt-2 font-[family-name:var(--font-cormorant)] text-[clamp(1.9rem,9vw,2.25rem)] font-semibold italic leading-tight tracking-wide"
                  style={{ color: palette.headingDark }}
                >
                  {data.bride.nickname} &amp; {data.groom.nickname}
                </h1>

                <div
                  className="mt-4 w-full rounded-xl border px-3 py-2.5"
                  style={{
                    borderColor: palette.softBorder,
                    backgroundColor: `${palette.lightCardBg}D8`,
                  }}
                >
                  <p className="text-[11px]" style={{ color: palette.mutedDark }}>
                    Kepada Bapak/Ibu/Saudara/i :
                  </p>
                  <p
                    className="mt-0.5 font-[family-name:var(--font-cormorant)] text-xl font-semibold"
                    style={{ color: palette.headingDark }}
                  >
                    {guestName}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={triggerEntrance}
                  className="relative z-20 mt-5 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-semibold tracking-wide text-white shadow-lg transition hover:brightness-90 active:scale-95"
                  style={{ backgroundColor: palette.accentDark }}
                >
                  <DoorOpen size={16} weight="fill" />
                  {labels.openButton}
                </button>
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* CENTERED MOBILE-FIRST INVITATION CANVAS */}
      <div
        className={cn(
          "relative z-10 mx-auto max-w-[430px] pb-24 shadow-2xl md:my-6 md:rounded-[2rem] md:border",
          !isOpen && "h-[100dvh] overflow-hidden pb-0 md:my-0 md:rounded-none"
        )}
        style={{
          backgroundColor: palette.canvasBg,
          borderColor: `${palette.borderGold}99`,
        }}
      >
        {/* SECTION 1: SCROLL-DRIVEN BOTANICAL GATE OVER CULTURAL ARCHITECTURE */}
        <section
          id="hero"
          ref={heroRef}
          className={cn("relative", scrub ? "h-[260svh]" : "h-[100svh]")}
        >
          <div
            className="sticky top-0 h-[100svh] min-h-[560px] overflow-hidden text-center md:rounded-t-[2rem]"
            style={{ backgroundColor: palette.skyBg }}
          >
            <motion.div
              style={scrub ? { scale: pendopoScale, y: pendopoY } : undefined}
              className="pointer-events-none absolute inset-0"
            >
              <img
                src={assets.sky}
                alt={labels.venueAlt}
                loading="eager"
                className="h-full w-full object-cover object-bottom"
              />
            </motion.div>

            {!shouldReduceMotion && (
              <motion.div
                animate={{ x: [-26, 26, -26] }}
                transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", type: "tween" }}
                className="pointer-events-none absolute inset-x-0 top-10 h-44 bg-[radial-gradient(ellipse_at_center,rgba(255,252,244,0.68)_0%,transparent_72%)]"
              />
            )}

            <motion.div
              style={{ opacity: scrub ? watermarkOpacity : 0.25 }}
              className="pointer-events-none absolute inset-x-0 top-0 h-72"
            >
              <CulturalWatermarkSvg
                kind={theme.watermark}
                stroke={palette.watermarkStroke}
                className="h-full w-full"
              />
            </motion.div>

            {!shouldReduceMotion && (
              <motion.div
                style={scrub ? { opacity: skyIn } : undefined}
                className="pointer-events-none absolute inset-0 z-20"
              >
                <motion.div
                  animate={{ x: [0, 38, 12, -22, 0], y: [0, -24, -44, -14, 0] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", type: "tween" }}
                  className="absolute left-[16%] top-[52%]"
                >
                  <WatercolorButterfly src={assets.butterfly} className="h-9 w-9" flapSeconds={0.28} />
                </motion.div>
                <motion.div
                  animate={{ x: [0, -34, -8, 24, 0], y: [0, -20, -40, -12, 0] }}
                  transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", type: "tween" }}
                  className="absolute right-[16%] top-[56%]"
                >
                  <WatercolorButterfly src={assets.butterfly} className="h-8 w-8" flapSeconds={0.34} />
                </motion.div>
                <motion.div
                  animate={{ x: [0, 22, -16, 10, 0], y: [0, -22, -42, -16, 0] }}
                  transition={{ duration: 13.5, repeat: Infinity, ease: "easeInOut", type: "tween" }}
                  className="absolute left-[46%] top-[48%]"
                >
                  <WatercolorButterfly src={assets.butterfly} className="h-6 w-6" flapSeconds={0.38} />
                </motion.div>
              </motion.div>
            )}

            {/* Left & Right Cultural Guardians */}
            <motion.div
              style={scrub ? { x: guardianLX, opacity: guardianIn } : undefined}
              className={cn("pointer-events-none absolute bottom-[12%] -left-2 z-[22]", guardianClass)}
            >
              <img
                src={assets.guardianLeft}
                alt=""
                loading="eager"
                className="motion-sway-c w-full object-contain"
              />
            </motion.div>
            <motion.div
              style={scrub ? { x: guardianRX, opacity: guardianIn } : undefined}
              className={cn("pointer-events-none absolute bottom-[12%] -right-2 z-[22]", guardianClass)}
            >
              <img
                src={assets.guardianRight}
                alt=""
                loading="eager"
                className="motion-sway-c w-full object-contain"
              />
            </motion.div>

            {/* Gate doors: start closed edge-to-edge, part into the corner frame */}
            <motion.div
              style={scrub ? { x: treeLX, scale: treeScale } : undefined}
              className="pointer-events-none absolute -left-10 -top-4 z-30 w-[47%] origin-top-left"
            >
              <img
                src={assets.floralTree}
                alt=""
                loading="eager"
                className="motion-sway-a w-full object-contain"
              />
            </motion.div>
            <motion.div
              style={scrub ? { x: treeRX, scale: treeScale } : undefined}
              className="pointer-events-none absolute -right-10 -top-4 z-30 w-[47%] origin-top-right"
            >
              <div className="motion-sway-b w-full">
                <img
                  src={assets.floralTree}
                  alt=""
                  loading="eager"
                  className="w-full -scale-x-100 object-contain"
                />
              </div>
            </motion.div>

            <motion.div
              style={scrub ? { x: leafLX, y: leafY, scale: leafScale } : undefined}
              className="pointer-events-none absolute bottom-[8%] -left-14 z-20 w-[52%] origin-bottom-left opacity-95"
            >
              <img
                src={assets.leaves}
                alt=""
                loading="eager"
                className="motion-sway-a w-full object-contain"
              />
            </motion.div>
            <motion.div
              style={scrub ? { x: leafRX, y: leafY, scale: leafScale } : undefined}
              className="pointer-events-none absolute bottom-[8%] -right-14 z-20 w-[52%] origin-bottom-right opacity-95"
            >
              <div className="motion-sway-b w-full">
                <img
                  src={assets.leaves}
                  alt=""
                  loading="eager"
                  className="w-full -scale-x-100 object-contain"
                />
              </div>
            </motion.div>

            <motion.div
              style={scrub ? { y: garlandY, scale: garlandScale } : undefined}
              className="pointer-events-none absolute -bottom-2 left-1/2 z-30 w-[112%] -translate-x-1/2 origin-bottom"
            >
              <img
                src={assets.floralGarland}
                alt=""
                loading="eager"
                className="motion-sway-c w-full object-contain"
              />
            </motion.div>

            {/* Couple Portrait Resting Inside Closed Botanical Gate */}
            {scrub && (
              <div
                style={{ top: "47%", zIndex: 25 }}
                className="pointer-events-none absolute inset-x-0 flex -translate-y-1/2 flex-col items-center"
              >
                <motion.div
                  style={{
                    opacity: portraitFade,
                    scale: portraitScale,
                    y: portraitY,
                    height: "min(18rem, 38svh)",
                    borderColor: palette.borderGold,
                    backgroundColor: palette.creamSurface,
                  }}
                  className="aspect-[3/4] rounded-t-full rounded-b-3xl border-2 p-1.5 shadow-2xl"
                >
                  <img
                    src={coverPortrait}
                    alt={`${data.bride.nickname} & ${data.groom.nickname}`}
                    loading="eager"
                    className="h-full w-full rounded-t-full rounded-b-[1.2rem] object-cover"
                  />
                </motion.div>

                {isOpen && (
                  <motion.a
                    href="#mempelai"
                    onClick={(e) => {
                      e.preventDefault();
                      heroRef.current?.nextElementSibling?.scrollIntoView({ behavior: "smooth" });
                    }}
                    style={{
                      opacity: cueFade,
                      backgroundColor: `${palette.creamSurface}DC`,
                      color: palette.accentDark,
                    }}
                    className="pointer-events-auto mt-4 flex flex-col items-center gap-0.5 rounded-2xl px-5 py-2.5 shadow-lg backdrop-blur-sm"
                  >
                    <CaretUp size={16} weight="bold" className="motion-cue-bob" />
                    <span className="font-[family-name:var(--font-cormorant)] text-base font-semibold italic">
                      {labels.defaultScrollCue}
                    </span>
                    <span className="text-[9px] tracking-[0.2em] uppercase">
                      untuk membuka gerbang
                    </span>
                  </motion.a>
                )}
              </div>
            )}

            {/* Open Sky Title Reveal */}
            <div className="relative z-20 flex flex-col items-center px-6 pt-[max(3rem,11svh)]">
              <motion.p
                style={scrub ? { opacity: subIn, y: subY, color: palette.accentDark } : { color: palette.accentDark }}
                className="max-w-[190px] text-[11px] font-semibold leading-relaxed tracking-[0.26em] uppercase"
              >
                {labels.heroEyebrow}
              </motion.p>
              <motion.h2
                style={scrub ? { opacity: brideIn, y: brideY, color: palette.headingDark } : { color: palette.headingDark }}
                className="mt-3 font-[family-name:var(--font-cormorant)] text-[clamp(2.3rem,11.5vw,2.75rem)] font-semibold italic leading-none"
              >
                {data.bride.nickname}
              </motion.h2>
              <motion.span
                style={scrub ? { opacity: ampIn, scale: ampScale, color: palette.borderGold } : { color: palette.borderGold }}
                className="my-1 font-[family-name:var(--font-cormorant)] text-2xl font-medium"
              >
                &amp;
              </motion.span>
              <motion.h2
                style={scrub ? { opacity: groomIn, y: groomY, color: palette.headingDark } : { color: palette.headingDark }}
                className="font-[family-name:var(--font-cormorant)] text-[clamp(2.3rem,11.5vw,2.75rem)] font-semibold italic leading-none"
              >
                {data.groom.nickname}
              </motion.h2>
              <motion.div
                style={scrub ? { opacity: dateIn, y: dateY } : undefined}
                className="flex flex-col items-center"
              >
                <p
                  className="mt-4 rounded-full border px-4 py-1 text-[11px] font-medium tracking-[0.2em]"
                  style={{
                    borderColor: palette.borderGold,
                    backgroundColor: `${palette.creamSurface}E8`,
                    color: palette.bodyDark,
                  }}
                >
                  {data.akad.dateLabel}
                </p>
                <span
                  className="mt-3 inline-flex items-center gap-1 text-[10px] font-medium tracking-widest uppercase opacity-80"
                  style={{ color: palette.accentDark }}
                >
                  {labels.continueScrollCue}
                  <CaretDown size={12} />
                </span>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 2: FEATURE PORTRAIT + BLESSING QUOTE */}
        <motion.section
          initial={shouldReduceMotion ? false : { y: 24, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: 0.7, ease: CINEMATIC_EASE }}
          className="relative mx-4 mt-6 overflow-hidden rounded-3xl border p-4 text-center shadow-lg"
          style={{
            borderColor: `${palette.borderGold}75`,
            backgroundColor: palette.lightCardBg,
          }}
        >
          <div
            className="overflow-hidden rounded-2xl border"
            style={{ borderColor: `${palette.borderGold}80` }}
          >
            <ParallaxImage
              src={featurePortrait}
              alt={`${data.bride.nickname} & ${data.groom.nickname}`}
              enabled={!shouldReduceMotion}
              className="aspect-[4/3] w-full"
            />
          </div>
          <div className="px-2 pt-5 pb-3">
            <p
              className="font-[family-name:var(--font-cormorant)] text-base italic leading-relaxed"
              style={{ color: palette.headingDark }}
            >
              &ldquo;{data.blessingQuote.text}&rdquo;
            </p>
            <p
              className="mt-3 text-[11px] font-semibold tracking-[0.2em] uppercase"
              style={{ color: palette.accent }}
            >
              {data.blessingQuote.source}
            </p>
          </div>
        </motion.section>

        {/* SECTION 3: BRIDE & GROOM ARCH PANEL */}
        <section id="mempelai" className="px-4 pt-8">
          <div
            className="relative overflow-hidden rounded-t-[190px] rounded-b-3xl border px-5 pt-36 pb-8 text-center shadow-lg"
            style={{
              borderColor: palette.borderGold,
              backgroundColor: palette.lightCardBg,
            }}
          >
            <motion.img
              src={assets.floralGarland}
              alt=""
              initial={shouldReduceMotion ? false : { scale: 0.55, opacity: 0, y: -30 }}
              whileInView={{ scale: 1, opacity: 0.95, y: 0 }}
              viewport={VIEWPORT_REVEAL}
              transition={{ duration: 1.1, ease: CINEMATIC_EASE }}
              className="pointer-events-none absolute -top-2 left-1/2 w-[104%] -translate-x-1/2 rotate-180 origin-center object-contain"
            />

            <p
              className="relative z-10 text-[11px] font-semibold tracking-[0.26em] uppercase"
              style={{ color: palette.accent }}
            >
              {labels.brideSectionTitle}
            </p>
            <p
              className="relative z-10 mt-2 text-xs leading-relaxed"
              style={{ color: palette.mutedDark }}
            >
              {data.culturalNote}
            </p>

            <div className="relative z-10 mt-7 space-y-6">
              {[
                { role: labels.brideRole, person: data.bride },
                { role: labels.groomRole, person: data.groom },
              ].map((item, idx) => (
                <motion.div
                  key={item.role}
                  initial={
                    shouldReduceMotion
                      ? false
                      : { x: idx === 0 ? -48 : 48, opacity: 0, rotate: idx === 0 ? -3 : 3 }
                  }
                  whileInView={{ x: 0, opacity: 1, rotate: 0 }}
                  viewport={VIEWPORT_REVEAL}
                  transition={{ duration: 0.8, ease: CINEMATIC_EASE }}
                  className="rounded-3xl border px-5 py-6 shadow-sm"
                  style={{
                    borderColor: palette.softBorder,
                    backgroundColor: palette.creamSurface,
                  }}
                >
                  <div
                    className="mx-auto h-44 w-34 overflow-hidden rounded-t-full rounded-b-xl border-2 p-1"
                    style={{
                      borderColor: palette.borderGold,
                      backgroundColor: palette.outerBg,
                    }}
                  >
                    <img
                      src={item.person.photoUrl}
                      alt={item.person.fullName}
                      className="h-full w-full rounded-t-full rounded-b-lg object-cover"
                    />
                  </div>
                  <p
                    className="mt-4 text-[10px] font-semibold tracking-[0.22em] uppercase"
                    style={{ color: palette.borderGold }}
                  >
                    {item.role}
                  </p>
                  <h3
                    className="mt-1 font-[family-name:var(--font-cormorant)] text-2xl font-semibold italic"
                    style={{ color: palette.headingDark }}
                  >
                    {item.person.fullName}
                  </h3>
                  <p
                    className="mt-2 text-xs leading-relaxed"
                    style={{ color: palette.mutedDark }}
                  >
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
          className="relative mx-4 mt-8 overflow-hidden rounded-3xl border text-center text-white shadow-lg"
          style={{
            borderColor: `${palette.borderGold}80`,
            backgroundColor: palette.darkCardBg,
          }}
        >
          <div className="relative h-56 overflow-hidden">
            <ParallaxImage
              src={saveDatePhoto}
              alt="Save The Date"
              enabled={!shouldReduceMotion}
              className="h-full w-full opacity-85"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to top, ${palette.darkCardBg}, ${palette.darkCardBg}55, transparent)`,
              }}
            />
            <div className="absolute inset-x-0 bottom-3 px-4">
              <p
                className="text-[10px] font-semibold tracking-[0.28em] uppercase"
                style={{ color: palette.lightAccent }}
              >
                Save The Date
              </p>
              <h3 className="mt-1 font-[family-name:var(--font-cormorant)] text-3xl italic">
                {labels.countdownTitle}
              </h3>
            </div>
          </div>

          <div className="px-5 pt-3 pb-7">
            {countdown.isPast ? (
              <p
                className="rounded-xl bg-white/10 py-3 text-sm font-medium"
                style={{ color: palette.lightText }}
              >
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
                    className="rounded-2xl border bg-white/10 py-3"
                    style={{ borderColor: `${palette.borderGold}66` }}
                  >
                    <p className="font-[family-name:var(--font-cormorant)] text-2xl font-bold tabular-nums">
                      {unit.value}
                    </p>
                    <p
                      className="text-[10px] tracking-wider uppercase"
                      style={{ color: palette.lightText }}
                    >
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
              className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold shadow transition hover:brightness-105"
              style={{
                backgroundColor: palette.lightCardBg,
                color: palette.canvasBg,
              }}
            >
              <CalendarPlus size={16} weight="bold" />
              Simpan ke Google Calendar
            </a>
          </div>
        </motion.section>

        {/* SECTION 5: AKAD & RESEPSI ARCH CARDS */}
        <section id="acara" className="px-4 pt-10">
          <div className="text-center">
            <p
              className="text-[11px] font-semibold tracking-[0.26em] uppercase"
              style={{ color: palette.lightAccent }}
            >
              {labels.eventsEyebrow}
            </p>
            <h3
              className="mt-1 font-[family-name:var(--font-cormorant)] text-3xl italic"
              style={{ color: palette.creamSurface }}
            >
              {labels.eventsTitle}
            </h3>
          </div>

          <div className="mt-6 space-y-6">
            {[
              { title: labels.akadTitle, event: data.akad },
              { title: labels.resepsiTitle, event: data.resepsi },
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                initial={shouldReduceMotion ? false : { y: 22, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={VIEWPORT_ONCE}
                transition={{ duration: 0.65, delay: idx * 0.1, ease: CINEMATIC_EASE }}
                className="relative overflow-hidden rounded-t-[170px] rounded-b-3xl border px-6 pt-40 pb-44 text-center shadow-lg"
                style={{
                  borderColor: palette.borderGold,
                  backgroundColor: palette.lightCardBg,
                  color: palette.bodyDark,
                }}
              >
                <motion.img
                  src={assets.floralGarland}
                  alt=""
                  initial={shouldReduceMotion ? false : { scale: 0.55, opacity: 0, y: -30 }}
                  whileInView={{ scale: 1, opacity: 0.95, y: 0 }}
                  viewport={VIEWPORT_REVEAL}
                  transition={{ duration: 1.1, ease: CINEMATIC_EASE }}
                  className="pointer-events-none absolute -top-2 left-1/2 w-[104%] -translate-x-1/2 rotate-180 object-contain"
                />
                <motion.img
                  src={assets.floralGarland}
                  alt=""
                  initial={shouldReduceMotion ? false : { scale: 0.55, opacity: 0, y: 30 }}
                  whileInView={{ scale: 1, opacity: 0.95, y: 0 }}
                  viewport={VIEWPORT_REVEAL}
                  transition={{ duration: 1.1, delay: 0.2, ease: CINEMATIC_EASE }}
                  className="pointer-events-none absolute -bottom-2 left-1/2 w-[104%] -translate-x-1/2 origin-bottom object-contain"
                />

                <div className="relative z-10">
                  <h4
                    className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold italic"
                    style={{ color: palette.headingDark }}
                  >
                    {item.title}
                  </h4>
                  <div className="mt-4 space-y-2 text-xs">
                    <p
                      className="inline-flex items-center justify-center gap-1.5 font-semibold"
                      style={{ color: palette.accentDark }}
                    >
                      <CalendarHeart size={15} weight="fill" />
                      {item.event.dateLabel}
                    </p>
                    <p
                      className="flex items-center justify-center gap-1.5"
                      style={{ color: palette.mutedDark }}
                    >
                      <Clock size={15} />
                      {item.event.timeLabel}
                    </p>
                    <p
                      className="pt-2 font-semibold"
                      style={{ color: palette.headingDark }}
                    >
                      {item.event.venueName}
                    </p>
                    <p
                      className="mx-auto max-w-xs leading-relaxed"
                      style={{ color: palette.mutedDark }}
                    >
                      {item.event.address}
                    </p>
                  </div>

                  <a
                    href={item.event.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-semibold text-white shadow transition hover:brightness-90"
                    style={{ backgroundColor: palette.accentDark }}
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
            <div
              className="mt-5 rounded-3xl border px-5 py-5 text-center"
              style={{
                borderColor: `${palette.borderGold}75`,
                backgroundColor: palette.darkCardBg,
                color: palette.creamSurface,
              }}
            >
              {data.ceremonyExtras.map((extra) => (
                <div key={extra.label} className="py-1.5">
                  <p
                    className="text-[11px] font-semibold tracking-[0.2em] uppercase"
                    style={{ color: palette.lightAccent }}
                  >
                    {extra.label}
                  </p>
                  <p
                    className="mt-1 text-xs leading-relaxed"
                    style={{ color: palette.lightText }}
                  >
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
            <div
              className="rounded-3xl border px-5 py-7 shadow-lg"
              style={{
                borderColor: palette.borderGold,
                backgroundColor: palette.lightCardBg,
              }}
            >
              <div className="text-center">
                <p
                  className="text-[11px] font-semibold tracking-[0.24em] uppercase"
                  style={{ color: palette.accent }}
                >
                  {labels.storyEyebrow}
                </p>
                <h3
                  className="mt-1 font-[family-name:var(--font-cormorant)] text-3xl italic"
                  style={{ color: palette.headingDark }}
                >
                  {labels.storyTitle}
                </h3>
              </div>

              <div
                className="mt-6 space-y-5 border-l-2 pl-5"
                style={{ borderColor: palette.borderGold }}
              >
                {data.storyTimeline.map((story) => (
                  <motion.div
                    key={`${story.year}-${story.title}`}
                    initial={shouldReduceMotion ? false : { x: -28, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={VIEWPORT_REVEAL}
                    transition={{ duration: 0.7, ease: CINEMATIC_EASE }}
                    className="relative"
                  >
                    <span
                      className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2"
                      style={{
                        borderColor: palette.lightCardBg,
                        backgroundColor: palette.accent,
                      }}
                    />
                    <p
                      className="text-[11px] font-bold tracking-wider"
                      style={{ color: palette.borderGold }}
                    >
                      {story.year}
                    </p>
                    <h4
                      className="font-[family-name:var(--font-cormorant)] text-lg font-semibold"
                      style={{ color: palette.headingDark }}
                    >
                      {story.title}
                    </h4>
                    <p
                      className="mt-1 text-xs leading-relaxed"
                      style={{ color: palette.mutedDark }}
                    >
                      {story.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SECTION 7: GALLERY */}
        {data.gallery.length > 0 && (
          <section id="galeri" className="px-4 pt-10">
            <div className="text-center">
              <p
                className="text-[11px] font-semibold tracking-[0.24em] uppercase"
                style={{ color: palette.lightAccent }}
              >
                {labels.galleryEyebrow}
              </p>
              <h3
                className="mt-1 font-[family-name:var(--font-cormorant)] text-3xl italic"
                style={{ color: palette.creamSurface }}
              >
                {labels.galleryTitle}
              </h3>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {data.gallery.map((photo, idx) => (
                <motion.button
                  key={`${photo}-${idx}`}
                  type="button"
                  initial={shouldReduceMotion ? false : { y: 40, scale: 0.92, opacity: 0 }}
                  whileInView={{ y: 0, scale: 1, opacity: 1 }}
                  viewport={VIEWPORT_REVEAL}
                  transition={{
                    duration: 0.75,
                    delay: (idx % 2) * 0.12,
                    ease: CINEMATIC_EASE,
                  }}
                  onClick={() => {
                    playSfx("camera-shutter");
                    setLightboxSrc(photo);
                  }}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border",
                    idx === 0 ? "col-span-2 aspect-[16/10]" : "aspect-[3/4]"
                  )}
                  style={{
                    borderColor: `${palette.borderGold}99`,
                    backgroundColor: palette.darkCardBg,
                  }}
                >
                  <img
                    src={photo}
                    alt={`Galeri ${idx + 1}`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </motion.button>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 8: RSVP & YOUR WISH */}
        <section id="rsvp" className="px-4 pt-10">
          <div
            className="relative overflow-hidden rounded-3xl border px-5 py-7 shadow-lg"
            style={{
              borderColor: palette.borderGold,
              backgroundColor: palette.lightCardBg,
            }}
          >
            <div className="text-center">
              <p
                className="text-[11px] font-semibold tracking-[0.24em] uppercase"
                style={{ color: palette.accent }}
              >
                {labels.rsvpEyebrow}
              </p>
              <h3
                className="mt-1 font-[family-name:var(--font-cormorant)] text-3xl italic"
                style={{ color: palette.headingDark }}
              >
                {labels.rsvpTitle}
              </h3>
            </div>

            <form onSubmit={handleWishSubmit} className="mt-5 space-y-3 text-left">
              <div>
                <label className="text-xs font-semibold" style={{ color: palette.bodyDark }}>
                  Nama Tamu
                </label>
                <input
                  type="text"
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  placeholder={guestName}
                  className="mt-1 w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none"
                  style={{
                    borderColor: `${palette.borderGold}B0`,
                    backgroundColor: palette.creamSurface,
                    color: palette.bodyDark,
                  }}
                />
              </div>

              <div>
                <label className="text-xs font-semibold" style={{ color: palette.bodyDark }}>
                  Konfirmasi
                </label>
                <select
                  value={rsvpStatus}
                  onChange={(e) => setRsvpStatus(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none"
                  style={{
                    borderColor: `${palette.borderGold}B0`,
                    backgroundColor: palette.creamSurface,
                    color: palette.bodyDark,
                  }}
                >
                  <option value="Hadir, 1 Orang">Hadir, 1 Orang</option>
                  <option value="Hadir, 2 Orang">Hadir, 2 Orang</option>
                  <option value="Tidak Hadir">Maaf, Tidak Hadir</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold" style={{ color: palette.bodyDark }}>
                  Doa &amp; Ucapan
                </label>
                <textarea
                  rows={3}
                  value={rsvpMessage}
                  onChange={(e) => setRsvpMessage(e.target.value)}
                  placeholder="Tulis doa terbaik untuk kedua mempelai..."
                  className="mt-1 w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none"
                  style={{
                    borderColor: `${palette.borderGold}B0`,
                    backgroundColor: palette.creamSurface,
                    color: palette.bodyDark,
                  }}
                />
              </div>

              <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                <button
                  type="submit"
                  className="flex-1 rounded-full px-4 py-2.5 text-xs font-semibold text-white transition hover:brightness-90"
                  style={{ backgroundColor: palette.accentDark }}
                >
                  Kirim Ucapan
                </button>
                <a
                  href={whatsappRsvpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border px-4 py-2.5 text-xs font-semibold transition hover:opacity-80"
                  style={{
                    borderColor: palette.accentDark,
                    color: palette.accentDark,
                  }}
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
                  className="rounded-2xl border px-4 py-3 text-left"
                  style={{
                    borderColor: palette.softBorder,
                    backgroundColor: palette.creamSurface,
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className="text-xs font-bold"
                      style={{ color: palette.headingDark }}
                    >
                      {w.name}
                    </p>
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: palette.accent }}
                    >
                      {w.relation}
                    </span>
                  </div>
                  <p
                    className="mt-1 text-xs leading-relaxed"
                    style={{ color: palette.mutedDark }}
                  >
                    {w.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 9: WEDDING GIFT & DRESSCODE */}
        {(data.digitalEnvelopes.length > 0 || data.giftAddress || data.dresscode) && (
          <section className="space-y-6 px-4 pt-10">
            {(data.digitalEnvelopes.length > 0 || data.giftAddress) && (
              <div
                className="rounded-3xl border px-5 py-7 text-center shadow-lg"
                style={{
                  borderColor: palette.borderGold,
                  backgroundColor: palette.lightCardBg,
                }}
              >
                <Gift
                  size={28}
                  className="mx-auto"
                  style={{ color: palette.accent }}
                  weight="duotone"
                />
                <h3
                  className="mt-2 font-[family-name:var(--font-cormorant)] text-3xl italic"
                  style={{ color: palette.headingDark }}
                >
                  {labels.giftTitle}
                </h3>
                <p
                  className="mt-2 text-xs leading-relaxed"
                  style={{ color: palette.mutedDark }}
                >
                  {labels.giftNote}
                </p>

                <div className="mt-5 space-y-3">
                  {data.digitalEnvelopes.map((env) => (
                    <div
                      key={env.accountNumber}
                      className="rounded-2xl border p-4"
                      style={{
                        borderColor: palette.softBorder,
                        backgroundColor: palette.creamSurface,
                      }}
                    >
                      <p
                        className="text-xs font-bold tracking-wider uppercase"
                        style={{ color: palette.accent }}
                      >
                        {env.bankName}
                      </p>
                      <p
                        className="mt-1 font-mono text-base font-bold"
                        style={{ color: palette.bodyDark }}
                      >
                        {env.accountNumber}
                      </p>
                      <p className="text-xs" style={{ color: palette.mutedDark }}>
                        a.n. {env.accountHolder}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleCopyAccount(env.accountNumber)}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-semibold text-white transition hover:brightness-90"
                        style={{ backgroundColor: palette.accentDark }}
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
                  <div
                    className="mt-4 rounded-2xl border p-4 text-center"
                    style={{
                      borderColor: palette.softBorder,
                      backgroundColor: palette.creamSurface,
                    }}
                  >
                    <p
                      className="inline-flex items-center gap-1.5 text-xs font-semibold"
                      style={{ color: palette.accent }}
                    >
                      <Package size={15} weight="duotone" />
                      Kirim Kado Fisik
                    </p>
                    <p
                      className="mt-1 text-xs font-semibold"
                      style={{ color: palette.headingDark }}
                    >
                      {data.giftAddress.recipient}
                    </p>
                    <p
                      className="mt-0.5 text-xs leading-relaxed"
                      style={{ color: palette.mutedDark }}
                    >
                      {data.giftAddress.address}
                    </p>
                  </div>
                )}
              </div>
            )}

            {data.dresscode && (
              <div
                className="rounded-3xl border px-5 py-6 text-center"
                style={{
                  borderColor: `${palette.borderGold}75`,
                  backgroundColor: palette.darkCardBg,
                  color: palette.creamSurface,
                }}
              >
                <p
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.22em] uppercase"
                  style={{ color: palette.lightAccent }}
                >
                  <Palette size={15} />
                  Dresscode Tamu
                </p>
                <p
                  className="mt-2 text-xs leading-relaxed"
                  style={{ color: palette.lightText }}
                >
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
          <div
            className="relative overflow-hidden rounded-3xl border px-6 pt-8 pb-44 shadow-lg"
            style={{
              borderColor: palette.borderGold,
              backgroundColor: palette.lightCardBg,
              color: palette.bodyDark,
            }}
          >
            <div
              className="mx-auto h-52 w-40 overflow-hidden rounded-t-full rounded-b-2xl border-2 p-1 shadow-md"
              style={{
                borderColor: palette.borderGold,
                backgroundColor: palette.outerBg,
              }}
            >
              <img
                src={closingPortrait}
                alt={`${data.bride.nickname} & ${data.groom.nickname}`}
                className="h-full w-full rounded-t-full rounded-b-xl object-cover"
              />
            </div>
            <p
              className="mt-5 text-xs leading-relaxed"
              style={{ color: palette.mutedDark }}
            >
              {labels.closingNote}
            </p>
            <p
              className="mt-4 font-[family-name:var(--font-cormorant)] text-3xl font-semibold italic"
              style={{ color: palette.headingDark }}
            >
              {data.bride.nickname} &amp; {data.groom.nickname}
            </p>

            <motion.img
              src={assets.floralGarland}
              alt=""
              initial={shouldReduceMotion ? false : { scale: 0.55, opacity: 0, y: 30 }}
              whileInView={{ scale: 1, opacity: 0.95, y: 0 }}
              viewport={VIEWPORT_REVEAL}
              transition={{ duration: 1.1, ease: CINEMATIC_EASE }}
              className="pointer-events-none absolute -bottom-2 left-1/2 w-[108%] -translate-x-1/2 origin-bottom object-contain"
            />
          </div>
        </footer>
      </div>

      {/* STICKY BOTTOM NAVIGATION */}
      {isOpen && (
        <nav
          aria-label="Navigasi Undangan"
          className={cn(
            "fixed bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full border px-3 py-2 text-white shadow-xl backdrop-blur-md",
            embedded && "bottom-2"
          )}
          style={{
            borderColor: palette.borderGold,
            backgroundColor: `${palette.darkCardBg}F2`,
          }}
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
                className="flex flex-col items-center rounded-full px-3 py-1 text-[10px] transition hover:bg-white/10 hover:text-white"
                style={{ color: palette.lightText }}
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
            key={`nikah-lightbox-${theme.id}`}
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

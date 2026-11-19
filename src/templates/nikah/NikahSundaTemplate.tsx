"use client";

import type { NikahSiteConfig } from "@/lib/schema";
import {
  NikahMotionShell,
  type NikahMotionTheme,
} from "@/templates/nikah/NikahMotionShell";

const SUNDA_THEME: NikahMotionTheme = {
  id: "sunda",
  assets: {
    sky: "/demo/motion/sunda/sky.webp",
    floralGarland: "/demo/motion/sunda/floral-garland.webp",
    floralTree: "/demo/motion/sunda/floral-tree.webp",
    leaves: "/demo/motion/sunda/leaves.webp",
    guardianLeft: "/demo/motion/sunda/guardian-left.webp",
    guardianRight: "/demo/motion/sunda/guardian-right.webp",
    butterfly: "/demo/motion/sunda/butterfly.webp",
  },
  watermark: "mega-mendung",
  openSfx: "paper-flip",
  palette: {
    outerBg: "#DCE6D8",
    canvasBg: "#163826",
    darkCardBg: "#0F271A",
    lightCardBg: "#F2F6F0",
    creamSurface: "#FAFCF8",
    skyBg: "#ECF3EA",
    borderGold: "#B59449",
    softBorder: "#D5DFD0",
    accent: "#1C5236",
    accentDark: "#14452B",
    headingDark: "#113521",
    bodyDark: "#1C2E22",
    mutedDark: "#4B6352",
    lightText: "#DDECE1",
    lightAccent: "#DFC17B",
    watermarkStroke: "#5E866B",
    selectionBg: "#14452B",
  },
  labels: {
    coverEyebrow: "Sampurasun / Walimatul Ursy",
    openButton: "Buka Ondangan",
    heroEyebrow: "Walimatul Ursy Adat Sunda",
    defaultGuestName: "Tamu Undangan",
    defaultScrollCue: "Geser ke atas",
    continueScrollCue: "Teraskeun ningali jadwal",
    brideSectionTitle: "Mojang & Jajaka Sunda",
    brideRole: "Mojang Siger Sunda",
    groomRole: "Jajaka Sunda",
    countdownTitle: "Ngantosan Dinten Bagja",
    eventsEyebrow: "Runtuyan Acara",
    eventsTitle: "Ijab Qabul & Walimatul Ursy",
    akadTitle: "Ijab Qabul",
    resepsiTitle: "Walimatul Ursy",
    storyEyebrow: "Carita Asih",
    storyTitle: "Lalakon Cinta Priangan",
    galleryEyebrow: "Galeri Panganten",
    galleryTitle: "Potret Adat Sunda",
    rsvpEyebrow: "Konfirmasi Sumping",
    rsvpTitle: "RSVP & Pidua Réréncangan",
    rsvpWaPrefix: "Sampurasun, simkuring",
    giftTitle: "Kanyaah & Amplop Digital",
    giftNote:
      "Pidua sareng kasumpingan sadérék sadayana mangrupikeun kado nu pangéndahna. Upami badé ngintunkeun tanda kanyaah, tiasa ngalangkungan rekening di handap:",
    closingNote:
      "Hatur nuhun kana sagala rupi pidua sareng pangestuna. Mugia kasaean Bapak/Ibu/Sadérék dibales ku Gusti Allah SWT.",
    venueAlt: "Bale Taman Priangan Adat Sunda",
  },
  guardianSizeClass: "w-[27%]",
  guardianFlankClass: "h-[33vh]",
};

export function NikahSundaTemplate({
  site,
  embedded = false,
}: {
  site: NikahSiteConfig;
  embedded?: boolean;
}) {
  return <NikahMotionShell site={site} theme={SUNDA_THEME} embedded={embedded} />;
}
